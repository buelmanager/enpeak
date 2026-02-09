# EnPeak Hybrid App - Implementation Plan v1

## Overview
"Thin Shell, Fat Web" 철학에 따라 Flutter WebView 기반 하이브리드 앱 구축.
Flutter는 네이티브 기능(인증, 녹음, TTS)만 담당하고, 비즈니스 로직은 기존 Next.js 웹앱에 유지.

## Architecture
```
Flutter Shell (Thin)
  ├── WebView (InAppWebView) → Next.js 웹앱 로드
  ├── Native Auth (firebase_auth) → idToken 주입 → 웹 세션 동기화
  ├── Native Recording (record) → base64 → WebView 전달
  ├── Bridge Protocol (JS Channel) → 양방향 통신
  └── Permission Handler → 마이크/카메라 권한
```

---

## Step 1: Flutter 프로젝트 초기화 [pending]
- flu/ 디렉토리에 새 Flutter 프로젝트 생성
- pubspec.yaml에 필수 패키지 추가:
  - `flutter_inappwebview` (WebView)
  - `firebase_core`, `firebase_auth` (인증)
  - `record` (오디오 녹음)
  - `flutter_secure_storage` (토큰 저장)
  - `permission_handler` (권한 관리)
  - `flutter_dotenv` (환경변수)
- .env 파일 설정 (WEB_URL, API_URL)

## Step 2: WebView Shell 구현 [pending]
- `lib/core/webview/` 디렉토리 구조
- `WebViewShell` 위젯: InAppWebView로 Next.js 앱 로드
- 앱/웹 감지를 위한 User-Agent 커스텀 ("EnPeakApp/1.0")
- JavaScript 채널 등록 (FlutterBridge)
- 네트워크 오류 시 오프라인 화면 처리
- 스플래시/로딩 화면

## Step 3: Bridge Protocol 구현 [pending]
- `lib/core/bridge/` 디렉토리
- Promise 기반 요청/응답 프로토콜:
  - `BridgeRequest` (id, action, payload)
  - `BridgeResponse` (id, status, data, error)
- 지원 액션:
  - `RECORD_START` - 녹음 시작
  - `RECORD_STOP_AND_GET_BASE64` - 녹음 중지 + base64 반환
  - `GET_TOKEN` - Firebase idToken 반환
  - `PLAY_AUDIO` - 네이티브 TTS 재생
  - `GET_PLATFORM_INFO` - 플랫폼 정보 반환
- 5초 timeout 안전장치
- 에러 핸들링 및 로깅

## Step 4: Native Authentication 구현 [pending]
- `lib/features/auth/` 디렉토리
- Firebase Auth 초기화 (Google / Email 로그인)
- 로그인 성공 시 idToken 획득
- WebView 페이지 로드 완료 시 토큰 주입 (postMessage)
- 토큰 만료 시 자동 refresh (1시간 주기)
- `flutter_secure_storage`로 토큰 안전 저장
- 로그인 화면 (네이티브 UI) - 선택적 표시

## Step 5: Native Recording 구현 [pending]
- `lib/features/recording/` 디렉토리
- `record` 패키지로 오디오 캡처
- 설정: AAC 코덱, 16kHz 샘플레이트, 모노
- 15초 초과 시 자동 중지 + TOO_LONG 응답
- base64 인코딩 (Uint8List → base64)
- 크기 제한: 2.5MB 초과 시 에러
- Blob URL 메모리 해제 안내 (웹 측)

## Step 6: Frontend 수정 (nativeBridge.ts) [pending]
- `frontend/src/lib/nativeBridge.ts` 신규 생성
  - `isNativeApp()` 감지 함수
  - `sendToNative(action, payload)` → Promise<BridgeResponse>
  - 타임아웃(5초) + 에러 핸들링
- `frontend/src/contexts/AuthContext.tsx` 수정
  - 앱 환경 감지 → postMessage로 토큰 수신
  - `signInWithCustomToken` 또는 credential로 세션 동기화
- `frontend/src/components/VoiceRecorder.tsx` 수정
  - `isNativeApp()` 시 네이티브 브릿지 사용
  - RECORD_START / RECORD_STOP_AND_GET_BASE64 호출
  - base64 → Blob 변환 → 기존 STT 로직 재사용

## Step 7: 플랫폼 권한 설정 [pending]
- **iOS**: Info.plist
  - NSMicrophoneUsageDescription
  - NSSpeechRecognitionUsageDescription
  - NSCameraUsageDescription (선택)
- **Android**: AndroidManifest.xml
  - RECORD_AUDIO, INTERNET, MODIFY_AUDIO_SETTINGS
  - Android 13+ 런타임 권한 대응
- **macOS**: Entitlements
  - com.apple.security.device.audio-input
  - com.apple.security.network.client

## Step 8: 빌드 검증 및 안정화 [pending]
- iOS/Android 빌드 테스트
- WebView 로딩 성능 확인
- Auth 토큰 주입 → 웹 세션 동기화 검증
- 녹음 → base64 → STT 플로우 검증
- 메모리 사용량 모니터링 (200MB 이하)
- 에러 핸들링 테스트

---

## Key Files
| 파일 | 역할 |
|------|------|
| `flu/lib/main.dart` | 앱 진입점 |
| `flu/lib/app.dart` | 앱 위젯 (WebView Shell) |
| `flu/lib/core/bridge/bridge_handler.dart` | 브릿지 프로토콜 핸들러 |
| `flu/lib/core/bridge/bridge_actions.dart` | 액션 정의 및 라우팅 |
| `flu/lib/core/webview/webview_shell.dart` | WebView 래퍼 |
| `flu/lib/core/webview/webview_controller.dart` | WebView 컨트롤러 |
| `flu/lib/features/auth/auth_service.dart` | Firebase 인증 서비스 |
| `flu/lib/features/auth/token_manager.dart` | 토큰 관리 (refresh, inject) |
| `flu/lib/features/recording/recording_service.dart` | 네이티브 녹음 서비스 |
| `flu/lib/features/recording/audio_encoder.dart` | base64 인코딩 |
| `frontend/src/lib/nativeBridge.ts` | 웹 측 브릿지 클라이언트 |

## Timeline Tracking
- 각 Step 완료 시 [pending] → [completed]로 업데이트
