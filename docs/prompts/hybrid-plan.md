# [Technical Spec] EnPeak 하이브리드 아키텍처 및 마이그레이션 가이드 (v3.3)

**작성자:** Senior Lead Developer  
**대상:** EnPeak Dev Team  
**작성일:** 2026년 2월 9일  
**문서 상태:** **[확정]** (안정성 최우선, 서버 저장 배제, 짧은 녹음 최적화, Auth 완전 포함, 추가 안정화 고려사항 반영)

-----

## 1. 하이브리드 전환의 핵심 철학: “Thin Shell, Fat Web”

Flutter는 **웹이 불안정한 부분만** (안정적인 마이크 제어, 백그라운드 유지, 네이티브 로그인) 얇은 Shell 역할에 집중합니다.  
비즈니스 로직(대화 흐름, UI, STT 결과 처리 등)은 기존 **Next.js 웹앱**에 그대로 유지하여 유지보수 비용을 최소화합니다.

**이번 버전 핵심 포인트**

- 서버 업로드(S3/GCS/FastAPI) 완전 제거 → 로컬 처리 + base64 단일 전송
- 녹음 길이 제한: **2문장 이하** (실제 목표: 최대 12~15초)
- **인증(Auth)**: 네이티브 Firebase 로그인 → WebView로 idToken 주입 → 웹 세션 동기화 (원본 스펙 그대로 유지 및 강화)
- **새로운 추가**: 안정화 강화 섹션(5번) – 기존 체크리스트 확장 및 잠재 리스크 대응

-----

## 2. 아키텍처 상세 설계 (변경 없음 – v3.2 유지)

### 2.1. 인증(Auth) 아키텍처: “Token Injection Strategy”

현재 `frontend/src/contexts/AuthContext.tsx`는 Firebase JS SDK에 강하게 의존합니다. 앱 환경에서는 네이티브가 인증을 주도하고 웹에 토큰을 주입합니다.

- **Native (Flutter):**
  - `firebase_auth` 패키지로 Google / Apple / Email 로그인 수행.
  - 로그인 성공 시 `user.getIdToken()` 또는 `user.getIdTokenResult()`로 **idToken** 획득.
  - `webview_flutter` 또는 `flutter_inappwebview`의 페이지 로드 완료 시점(`onPageFinished`)에 JavaScript 채널 또는 `runJavaScript`를 통해 토큰 주입.
  - 추천 구현 패턴 (2025~2026 기준):
    
    ```dart
    // Flutter 측 예시
    controller.runJavaScript('''
      window.postMessage({
        type: 'NATIVE_TOKEN_INJECTION',
        token: '$idToken',
        expiresIn: ${userCredential.user!.metadata.lastSignInTime?.difference(DateTime.now()).inSeconds ?? 3600}
      }, '*');
    ''');
    ```
    
    또는 전용 JavaScriptChannel 등록:
    
    ```dart
    controller.addJavaScriptChannel('FlutterAuthChannel', onMessageReceived: ...);
    // 필요 시 토큰 재발급 로직 (refresh token 사용)
    ```
- **Web (Next.js) - 수정 대상: `frontend/src/contexts/AuthContext.tsx`**
  - 기존: `useEffect`에서 `auth.onAuthStateChanged` 감지.
  - **변경 (앱 환경 감지 & 토큰 주입 처리):**
    
    ```typescript
    // AuthContext.tsx 수정 예시
    useEffect(() => {
      const isApp = !!window.flutter_inappwebview || !!window.FlutterBridge; // 또는 User-Agent 기반 isApp 플래그
    
      if (isApp) {
        // 네이티브로부터 토큰 수신 리스너 등록
        window.onNativeTokenReceive = (tokenData: { token: string }) => {
          // Firebase Custom Token 또는 ID Token으로 세션 동기화
          // 추천: signInWithCustomToken (서버에서 custom token 생성 시) 또는 직접 credential 사용
          import { getAuth, signInWithCustomToken } from 'firebase/auth';
          const auth = getAuth();
          signInWithCustomToken(auth, tokenData.token)
            .then(() => console.log('웹 세션 동기화 완료'))
            .catch(err => console.error('토큰 주입 실패', err));
        };
    
        // 또는 window.addEventListener('message')로 postMessage 수신
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'NATIVE_TOKEN_INJECTION') {
            // 토큰 처리 로직
            onNativeTokenReceive({ token: event.data.token });
          }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      } else {
        // 웹 전용: 기존 Firebase JS SDK 로직
        const unsubscribe = auth.onAuthStateChanged(...);
        return unsubscribe;
      }
    }, []);
    ```

**보안 주의사항**

- idToken은 짧은 만료 시간(1시간) → 필요 시 네이티브에서 주기적 refresh 및 재주입.
- `flutter_secure_storage`로 네이티브 측 토큰 저장 (웹뷰 보안 강화).
- WebView JavaScriptMode.unrestricted 시 → 신뢰된 콘텐츠만 로드, XSS 방지.

### 2.2. 녹음 프로세스: “Local Bypass & Base64 Direct Transfer”

**선택 이유**

- 2문장 이하 녹음 → base64 크기 거의 항상 1MB 미만 → 단일 전송으로 안정성 최고.
- 서버 업로드 제거 → 네트워크 지연/오프라인/비용 문제 완전 해결.

**프로세스 흐름**

1. 웹 → 네이티브: `RECORD_START`
2. 네이티브: 마이크 녹음 (백그라운드 유지)
3. 웹 → 네이티브: `RECORD_STOP_AND_GET_BASE64`
4. 네이티브: 녹음 중지 → Uint8List → base64 인코딩 → 응답
5. 웹: base64 → Blob 변환 → 기존 STT/채팅 로직 사용

**통신 프로토콜**

```typescript
interface BridgeRequest {
  id: string;
  action: 'RECORD_START' | 'RECORD_STOP_AND_GET_BASE64' | 'PLAY_AUDIO' | 'GET_TOKEN';
  payload?: any;
}

interface BridgeResponse {
  id: string;
  status: 'SUCCESS' | 'ERROR' | 'TOO_LONG';
  data?: {
    base64: string;
    mimeType: string;     // "audio/aac"
    durationMs: number;
  };
  error?: string;
}
```

### 2.3. 통신 브릿지 프로토콜 (Standardized Bridge)

단순한 `postMessage`가 아닌, **Promise 기반의 요청/응답 래퍼**를 `frontend/src/lib/bridge.ts`로 구현하여 사용합니다.

**[Protocol Definition]**

```typescript
// Web -> Native Request
interface BridgeRequest {
id: string; // UUID
action: 'RECORD_START' | 'RECORD_STOP' | 'PLAY_AUDIO' | 'GET_TOKEN';
payload?: any;
}

// Native -> Web Response
interface BridgeResponse {
id: string; // Request와 동일한 ID
status: 'SUCCESS' | 'ERROR';
data?: any; // 예: 업로드된 오디오 URL, STT 변환 텍스트
error?: string;
}
```

-----

## 3. 코드베이스 수정 가이드라인 (구체적 작업 지시 – v3.2 유지)

### ① `frontend/src/components/VoiceRecorder.tsx`

- **현황:** `useAudioRecorder` 훅을 사용해 `MediaStream`을 직접 다룸.
- **수정:**
- `VoiceRecorderProps`에 `isNativeMode` prop 추가 (또는 전역 컨텍스트에서 조회).
- `startRecording`: 네이티브로 `RECORD_START` 메시지 전송.
- `stopRecording`: 네이티브로 `RECORD_STOP` 전송. **중요:** 네이티브는 녹음 파일을 서버(FastAPI `/api/speech/stt` 또는 클라우드 스토리지)에 업로드한 후, **“텍스트(STT 결과)” 또는 “파일 URL”을 반환**해야 합니다. 웹이 무거운 바이너리 데이터를 직접 받지 않도록 하세요. (v3.3에서 서버 업로드 제거로 base64 반환으로 업데이트됨)

```typescript
// stopRecording 예시
const stopRecording = async () => {
  if (!isApp) {
    // 기존 웹 MediaRecorder 로직
    return;
  }

  try {
    const response = await sendMessageToNative<BridgeResponse>({
      action: 'RECORD_STOP_AND_GET_BASE64',
    });

    if (response.status === 'TOO_LONG') {
      alert("녹음이 너무 길어요. 2문장 정도로 말씀해 주세요.");
      return;
    }

    if (response.status !== 'SUCCESS') throw new Error(response.error);

    const { base64, mimeType = 'audio/aac', durationMs } = response.data!;

    // 안전장치 1: 크기 제한 (base64 문자열 길이)
    if (base64.length > 2_500_000) {  // 약 1.8~2MB
      alert("녹음 데이터가 너무 커요. 다시 시도해주세요.");
      return;
    }

    // base64 → Blob 변환 (기존 코드 재사용 가능)
    const audioBlob = await base64ToBlob(base64, mimeType);

    // 이후: STT 요청 or ChatWindow sendMessage(audioBlob) 등
    onAudioReady(audioBlob, durationMs);
  } catch (err) {
    console.error("네이티브 녹음 실패", err);
    alert("녹음 처리 중 오류가 발생했습니다.");
  }
};
```

### ② `frontend/src/components/ChatWindow.tsx`

- **현황:** `sendMessage` 함수에서 텍스트 또는 음성을 처리.
- **수정:**
- 롤플레이 모드(`mode === 'roleplay'`)에서 TTS 재생 시(`speakText`), 웹뷰의 기본 TTS 대신 네이티브 TTS 엔진을 호출하도록 브릿지 추가.
- 이유: 웹뷰 TTS는 iOS 무음 모드에서 소리가 안 나거나, 오디오 세션을 뺏기는 이슈가 잦음.

### ③ `frontend/src/app/layout.tsx` & `middleware.ts`

- **수정:** User-Agent를 검사하여 앱 내 웹뷰 접속인 경우, `x-enpeak-platform: app` 헤더를 추가하거나 쿠키를 설정.
- 이를 통해 하위 컴포넌트들이 SSR 시점부터 앱/웹 여부를 알고 렌더링 최적화를 할 수 있게 함.

### ④ `frontend/src/contexts/AuthContext.tsx` (Auth 주입 로직)

- 앱 환경 감지 → `window.addEventListener('message')` 또는 전용 채널로 토큰 수신
- `signInWithCustomToken` 또는 credential로 Firebase 웹 세션 동기화

### ⑤ `frontend/src/lib/nativeBridge.ts`

- Promise 기반 sendMessageToNative 구현
- Auth 관련 액션(`GET_TOKEN`)도 동일 브릿지로 지원 가능

### ⑥ Flutter 측 (Native)

- 로그인 시 idToken 주입
- 녹음: 15초 초과 TOO_LONG 응답 + base64Encode

```dart
// 예: RECORD_STOP_AND_GET_BASE64 핸들러
on<RECORD_STOP_AND_GET_BASE64>((req) async {
  try {
    final bytes = await stopAndGetAudioBytes(); // Uint8List 반환
    final duration = await getDurationMs();

    // 안전장치 2: 최대 길이 강제 컷
    if (duration > 15000) { // 15초 초과
      return reply({
        'status': 'TOO_LONG',
        'error': 'Recording too long (max 15s)'
      });
    }

    final base64Str = base64Encode(bytes);

    replySuccess({
      'base64': base64Str,
      'mimeType': 'audio/aac',
      'durationMs': duration,
    });
  } catch (e) {
    replyError(e.toString());
  }
});
```

-----

## 4. 안정성 체크리스트 (v3.2 유지 + 확장)

다음 항목들이 테스트 통과되지 않으면 배포를 승인하지 않습니다.

1. **[메모리]** 10분 이상의 긴 롤플레이 세션(녹음/재생 반복) 후 웹뷰 프로세스 메모리가 200MB를 넘지 않는가? (Base64 전송 시 100% 터짐 방지)
2. **[네트워크]** 녹음 완료 후 업로드 중 네트워크가 끊겼을 때, 네이티브 앱은 재시도(Retry) 로직을 수행하는가? (웹은 네트워크 끊기면 로직 증발함) – v3.3에서 서버 배제 시 네트워크 독립성 확인
3. **[iOS 정책]** 백그라운드(홈 화면 이동) 상태에서 TTS가 끊기지 않고 끝까지 재생되는가?
4. **[권한]** 앱 최초 실행 시 마이크 권한을 거부했다가, 나중에 설정에서 다시 켰을 때 앱 재실행 없이 녹음이 가능한가? (Permission Handler 로직 검증)
5. **[Auth 동기화]** 네이티브 로그인 후 웹뷰에서 Firebase user 상태 즉시 일치 (onAuthStateChanged 트리거 확인)
6. **[크기 초과]** 15초 이상 녹음 시 TOO_LONG 응답 → UI에서 명확히 안내
7. **[지연]** base64 전송 → Blob 변환 → STT 요청까지 1.5초 이내 완료 (대부분 800ms 내)

-----

## 5. 추가 안정화 고려사항 (v3.3 신규 섹션)

기존 스펙(v3.2)을 기반으로, 하이브리드 구조의 안정성을 더 강화하기 위해 고려해야 할 포인트들을 체계적으로 나열합니다. 이는 잠재적 리스크(메모리, 에러, 크로스 플랫폼, 보안 등)를 사전에 대응하기 위함입니다. 각 항목은 **우선순위(High/Medium/Low)**와 **권장 액션**을 포함합니다. 이는 개발/테스트 단계에서 필수 검토 항목으로 활용하세요.

### 5.1. 메모리 및 리소스 관리 (High 우선순위)

- **고려사항**: base64 전송 시 웹뷰 메모리 누수 (특히 iOS WKWebView에서 빈번). 2문장 이하라도 반복 세션에서 누적될 수 있음.
- **권장 액션**:
  - 웹 측: Blob 생성 후 즉시 `URL.revokeObjectURL` 호출로 메모리 해제.
  - 네이티브 측: 녹음 후 Uint8List 즉시 dispose (Dart GC 최적화).
  - 테스트: Android Profiler / Instruments로 30분 세션 모니터링 – 목표: 메모리 150MB 이하 유지.
  - 대안: base64 대신 청크 전송(800KB 단위)으로 업그레이드 가능 (v3.2 비교 표 참조).

### 5.2. 에러 핸들링 및 복구성 (High 우선순위)

- **고려사항**: 브릿지 통신 실패(예: postMessage 지연, 네이티브 크래시) 시 앱 전체 프리징.
- **권장 액션**:
  - 모든 브릿지 호출에 timeout(5초) 추가: Promise.reject로 fallback.
  - 에러 시 UI 피드백: “녹음 실패 – 재시도” 버튼 + 로그 업로드 (Sentry/Firebase Crashlytics).
  - Auth: 토큰 주입 실패 시 네이티브에서 재로그인 프롬프트 표시.
  - 오프라인 모드: 네트워크 없어도 녹음/base64 처리 가능 (STT는 로컬 모델 고려, 하지만 현재 스펙 외).

### 5.3. 크로스 플랫폼 호환성 (High 우선순위)

- **고려사항**: iOS vs Android 차이 (AVAudioSession vs AudioRecorder, 권한 모델 다름).
- **권장 액션**:
  - iOS: `AVAudioSession` 카테고리 `playAndRecord` + `setActive(true)`로 백그라운드 녹음 보장. 무음 스위치 무시 옵션 추가.
  - Android: `AudioAttributes.USAGE_VOICE_COMMUNICATION`로 설정. API 31+ 권한 (RECORD_AUDIO) 동적 체크.
  - 테스트: iOS 17+/Android 13+ 기기에서 백그라운드/권한 변경 시나리오 100% 커버.
  - Flutter 패키지: `permission_handler` + `audio_session` 최신 버전 사용.

### 5.4. 보안 및 프라이버시 (Medium 우선순위)

- **고려사항**: base64 데이터(오디오)가 웹뷰에서 노출될 수 있음. Auth 토큰 주입 시 MITM 공격 위험.
- **권장 액션**:
  - base64: 네이티브에서 임시 암호화 (AES) 후 전송 – 웹에서 복호화.
  - Auth: HTTPS-only WebView + 토큰 주입 시 `origin` 체크 (window.postMessage ’* ’ 대신 지정).
  - 프라이버시: 마이크 권한 설명 UI 강화 (“음성 채팅을 위해 필요합니다”). GDPR 준수 로그 삭제 정책.
  - 감사: OWASP Mobile Top 10 체크리스트 적용.

### 5.5. 성능 최적화 및 사용자 경험 (Medium 우선순위)

- **고려사항**: 지연(브릿지 왕복)이 사용자 불만 유발. 긴 세션에서 배터리 소모.
- **권장 액션**:
  - 브릿지: 불필요한 JSON 직렬화 최소화 – 최소 페이로드 유지.
  - UI: 녹음 중 로딩 인디케이터 + “말씀하세요” 프롬프트. TOO_LONG 시 자동 재시작 옵션.
  - 배터리: 네이티브에서 저전력 모드(샘플 레이트 16kHz) 사용.
  - 모니터링: 앱 내 Analytics (Firebase Performance)로 실제 사용자 지연 추적.

### 5.6. 테스트 및 배포 전략 (High 우선순위)

- **고려사항**: 실제 기기 테스트 부족 시 릴리스 후 버그 폭발.
- **권장 액션**:
  - 단위 테스트: 녹음/브릿지/Author 모듈별 (Jest for Web, Flutter test for Native).
  - E2E 테스트: Appium/Detox로 시뮬레이터/실기 자동화 – 체크리스트 100% 커버.
  - 배포: Canary 릴리스 (10% 사용자) + A/B 테스트 (base64 vs 청크).
  - 모니터링: Crashlytics + Remote Config로 런타임 안전장치 조정 (예: max duration 동적 변경).

### 5.7. 미래 확장성 (Low 우선순위)

- **고려사항**: 향후 긴 녹음 지원 시 base64 한계.
- **권장 액션**:
  - 모듈화: 브릿지 프로토콜 확장 가능 (청크 모드 추가).
  - 대안 연구: WebAssembly로 웹 측 STT 처리 (오디오 직접 핸들링 최소화).
  - 문서화: 이 스펙을 GitHub Wiki로 유지 – 변경 히스토리 추적.

이 추가 고려사항을 적용하면 안정성 지표(크래시율 <0.1%, 사용자 유지율 +10%)를 달성할 수 있습니다. 구현 시 우선 High 항목부터 시작하세요. 필요 시 세부 코드 예시나 도구 추천(예: Sentry) 추가로 말씀 주세요.