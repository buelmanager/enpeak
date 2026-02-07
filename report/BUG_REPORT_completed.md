# EnPeak Frontend 버그 리포트

**작성일**: 2026-02-07
**분석 범위**: frontend/src 전체 (페이지 8개, 컴포넌트 17개, 컨텍스트 4개, 훅 2개, 유틸리티 6개)
**분석 방법**: 정적 코드 리뷰 (시니어 개발자 관점)

---

## 요약

| 심각도 | 건수 | 설명 |
|--------|------|------|
| Critical | 5 | 메모리 누수, 데이터 손실 등 즉시 수정 필요 |
| High | 8 | 기능 오동작, 잘못된 라우팅 등 |
| Medium | 10 | Race condition, UX 문제 등 |
| Low | 7 | 코드 품질, 성능 최적화 등 |
| **총계** | **30** | |

---

## Critical (즉시 수정 필요)

### C-1. ServiceWorkerRegister - setInterval 미정리 (메모리 누수)

- **파일**: `src/components/ServiceWorkerRegister.tsx:28-30`
- **설명**: SW 업데이트 확인용 `setInterval` (1시간 주기)이 useEffect 리턴에서 정리되지 않음. 컴포넌트가 언마운트/리마운트될 때마다 새 interval이 생성되어 누적됨.
- **재현**: React StrictMode에서 컴포넌트 마운트 시 2개 interval 생성
- **영향**: 장시간 사용 시 중복 업데이트 체크로 불필요한 네트워크 요청

```tsx
// 현재 코드 (line 28-30)
setInterval(() => {
  registration.update()
}, 60 * 60 * 1000)

// 수정: intervalId를 저장하고 cleanup에서 clearInterval
```

---

### C-2. ChatWindow - fallbackTimestamps 배열 무한 증가

- **파일**: `src/components/ChatWindow.tsx:397-448`
- **설명**: `fallbackTimestampsRef.current` 배열에 타임스탬프가 계속 추가됨. `canUseFallback()`에서 오래된 항목을 필터링하지만, 필터링 결과를 다시 할당할 뿐 GC는 이전 배열 참조를 유지. 장시간 사용 시 배열이 계속 커짐.
- **재현**: STT 폴백을 반복 사용하면서 1시간 이상 대화
- **영향**: 메모리 점진적 증가

```tsx
// 현재 코드 (line 402-404)
fallbackTimestampsRef.current = fallbackTimestampsRef.current.filter(
  ts => now - ts < FALLBACK_RATE_WINDOW_MS
)

// 수정: 주기적으로 배열 초기화하거나, 최대 크기 제한 추가
```

---

### C-3. userDataSync - 통계 병합 시 데이터 손실

- **파일**: `src/lib/userDataSync.ts:242-250`
- **설명**: 다중 기기 통계 병합 시 `Math.max()`를 사용하여 "더 높은 값"을 선택함. 주석에는 "합산"이라 되어있지만 실제로는 max 연산. 예: 기기A에서 3개 단어, 기기B에서 5개 단어를 학습하면 총 8개가 아닌 5개로 기록됨.
- **재현**: 2개 기기에서 동일 날짜에 학습 후 로그인/동기화
- **영향**: 학습 통계 축소, 사용자 동기 저하

```tsx
// 현재 코드 (line 243-250)
// 주석: "둘 다 오늘 데이터면 합산"
totalSessions: Math.max(existingStats.todayStats.totalSessions, localStats.todayStats.totalSessions),
totalMinutes: Math.max(existingStats.todayStats.totalMinutes, localStats.todayStats.totalMinutes),

// 수정: Math.max -> 덧셈, 또는 lastSyncTimestamp 기반 delta 계산
```

---

### C-4. TTSContext - HD TTS 오디오 캐시 blob URL 미해제

- **파일**: `src/contexts/TTSContext.tsx:104-123`
- **설명**: `audioCache` Map은 모듈 레벨 변수로 컴포넌트 라이프사이클과 무관하게 존재함. MAX_CACHE_SIZE(50) 제한이 있지만, TTSProvider가 언마운트되어도 캐시가 유지됨. 또한 캐시에서 삭제 시 `URL.revokeObjectURL` 호출하지만, 해당 blob URL이 현재 재생 중인 Audio 요소에서 사용 중일 수 있음.
- **재현**: 50개 이상의 서로 다른 문장을 TTS로 재생
- **영향**: blob URL 메모리 누수, 재생 중인 오디오 끊김 가능

---

### C-5. useAudioRecorder - onstop 핸들러 덮어쓰기

- **파일**: `src/hooks/useAudioRecorder.ts:82, 107`
- **설명**: `startRecording`에서 `recorder.onstop` 핸들러를 설정(line 82)한 후, `stopRecording`에서 다시 덮어씀(line 107). 만약 recorder가 외부 요인(브라우저, 다른 탭)으로 자동 중지되면 line 107의 핸들러가 아닌 line 82의 핸들러가 실행되어야 하나, 정상 흐름에서는 항상 line 107로 덮어쓰므로 line 82는 사실상 실행되지 않음.
- **재현**: `stopRecording()` 호출 없이 MediaRecorder가 자체 종료되는 경우 (stream 트랙 종료 등)
- **영향**: audioBlobRef만 업데이트되고 Promise resolve가 되지 않아 호출자가 무한 대기

---

## High (기능 오동작)

### H-1. ChatWindow - autoRecord 타이밍 문제

- **파일**: `src/components/ChatWindow.tsx:239-250`
- **설명**: `startAutoRecording`이 500ms setTimeout 후 녹음을 시작하는데, 500ms 동안 사용자가 모드를 변경하거나 TTS가 다시 시작될 수 있음. setTimeout 콜백 내에서 현재 상태를 재검증하지 않음.
- **재현**: TTS 종료 직후 빠르게 모드 변경
- **영향**: 예기치 않은 녹음 시작, 사용자 혼란

---

### H-2. VoiceRecorder - no-speech 재시도 중 녹음 중지 무시

- **파일**: `src/components/VoiceRecorder.tsx:99-112`
- **설명**: `no-speech` 에러 시 `setTimeout`으로 recognition을 재시작하는데, 사용자가 그 사이에 녹음을 중지해도 setTimeout이 실행되어 recognition이 다시 시작됨.
- **재현**: 마이크 버튼 누르고 아무 말 안 하다가, no-speech 에러 직후 빠르게 녹음 중지
- **영향**: 사용자가 중지했는데 음성 인식이 다시 활성화

---

### H-3. MessageBubble - 롱프레스 타이머 미정리

- **파일**: `src/components/MessageBubble.tsx:71-87`
- **설명**: `handleWordPress`에서 설정한 800ms `setTimeout`이 컴포넌트 unmount 시 정리되지 않음. 사용자가 단어를 길게 누르는 도중 페이지를 벗어나면 unmount된 컴포넌트의 state를 업데이트하려고 시도.
- **재현**: 메시지의 단어를 길게 누르는 중 뒤로가기
- **영향**: React 경고, 잠재적 에러

---

### H-4. My Page - 버전 비교 로직 오류

- **파일**: `src/app/my/page.tsx:276-280`
- **설명**: `serverVersion !== APP_VERSION`으로 단순 문자열 비교만 수행. 서버 버전이 더 낮은 경우(롤백)에도 "최신 버전"으로 표시됨. 시맨틱 버전 비교가 필요.
- **재현**: 서버 버전이 1.0.9이고 클라이언트가 1.1.0일 때
- **영향**: 잘못된 업데이트 안내

```tsx
// 현재 코드 (line 276)
{serverVersion && serverVersion !== APP_VERSION && (
  <div>최신 버전 v{serverVersion}</div>
)}

// 수정: semver 비교하여 serverVersion > APP_VERSION인 경우에만 표시
```

---

### H-5. Cards Page - 비동기 fetchWords unmount 문제

- **파일**: `src/app/cards/page.tsx:71-145`
- **설명**: `fetchWords`에서 API 호출 후 state를 업데이트하는데, 컴포넌트가 이미 unmount되었을 수 있음. `useEffect` cleanup에서 abort 처리가 없음.
- **재현**: Cards 페이지 진입 직후 빠르게 다른 페이지로 이동
- **영향**: React "Can't perform state update on unmounted component" 경고

---

### H-6. Create Page - 존재하지 않는 라우트로 네비게이션

- **파일**: `src/app/create/page.tsx:212, 215`
- **설명**: 시나리오 발행 후 `/community?published=true` 또는 `/community`로 이동하는데, 현재 라우트 구조에 `/community` 페이지가 없음. middleware.ts에서 `/community` -> `/talk?mode=roleplay`로 리다이렉트하지만, `?published=true` 파라미터가 손실됨.
- **재현**: 시나리오 생성 -> 발행 완료
- **영향**: 발행 성공 메시지 미표시, 사용자 혼란

---

### H-7. TTSContext - onEnd 이중 호출 가능

- **파일**: `src/contexts/TTSContext.tsx:298-305`
- **설명**: Chrome에서 TTS가 시작되지 않을 경우를 위한 500ms 타임아웃이 있는데, TTS가 500ms 이후에 정상 시작되면 타임아웃에서 `onEnd`가 먼저 호출되고, 이후 실제 `utterance.onend`에서 다시 호출될 수 있음.
- **재현**: 느린 네트워크/기기에서 TTS 재생
- **영향**: 음성 사이클이 비정상적으로 두 번 실행, 녹음이 조기 시작

```tsx
// 수정: onEnd 호출 시 flag로 중복 방지
let ended = false
const safeOnEnd = () => { if (!ended) { ended = true; onEnd?.() } }
```

---

### H-8. AppShell - Firebase 초기화 무한 대기

- **파일**: `src/components/AppShell.tsx:41-64`
- **설명**: `isReady` 상태가 true가 될 때까지 기다리는데, Firebase 초기화 실패 시 `isReady`가 영원히 false로 남아 앱이 스플래시 화면에서 멈춤.
- **재현**: Firebase 서비스 장애 시
- **영향**: 앱 사용 불가

---

## Medium (Race Condition, UX 문제)

### M-1. ChatWindow - sendMessage 거대 함수

- **파일**: `src/components/ChatWindow.tsx:572-744`
- **설명**: 170줄 이상의 단일 함수로 situation setup, roleplay, free chat 로직을 모두 처리. 네트워크 오류 시 에러 로그만 남기고 사용자에게 알림 없음. 오류 복구 로직 부재.
- **영향**: 유지보수 어려움, 네트워크 오류 시 무응답 상태

---

### M-2. PWAInstallGuide - setTimeout 미정리

- **파일**: `src/components/PWAInstallGuide.tsx:137`
- **설명**: 자동 팝업용 2초 `setTimeout`이 useEffect cleanup에서 정리되지 않음.
- **영향**: unmount 시 불필요한 콜백 실행

---

### M-3. PWAInstallGuide - deprecated API 사용

- **파일**: `src/components/PWAInstallGuide.tsx:183-193`
- **설명**: 클립보드 복사 폴백으로 `document.execCommand('copy')`를 사용하는데 이는 deprecated API.
- **영향**: 향후 브라우저 업데이트에서 동작 안 할 수 있음

---

### M-4. WordPopup - 단어 빠른 변경 시 Race Condition

- **파일**: `src/components/WordPopup.tsx:31-61`
- **설명**: 사용자가 다른 단어를 빠르게 선택하면 이전 fetch가 완료되지 않은 상태에서 새 fetch가 시작됨. AbortController 없이 이전 요청 미취소.
- **재현**: 여러 단어를 빠르게 연속 탭
- **영향**: 이전 단어의 정보가 현재 선택된 단어에 표시

---

### M-5. STTConfirmationBanner - 과도한 리렌더링

- **파일**: `src/components/STTConfirmationBanner.tsx:39-43`
- **설명**: 카운트다운을 100ms 간격 `setInterval`로 업데이트하지만 표시는 초 단위(`Math.ceil`). 초가 바뀔 때만 setState하면 충분.
- **영향**: 초당 10회 불필요한 리렌더링

---

### M-6. Feedback Page - 좋아요 Race Condition

- **파일**: `src/app/feedback/page.tsx:158-180`
- **설명**: 좋아요 버튼 동시 클릭 시 Firestore 업데이트가 경합. 낙관적 UI 업데이트 없이 서버 응답 대기.
- **재현**: 좋아요 버튼 빠르게 연속 클릭
- **영향**: 좋아요 수 불일치

---

### M-7. learningHistory - 스트릭 계산 시간대 문제

- **파일**: `src/lib/learningHistory.ts:169-187`
- **설명**: `toISOString().split('T')[0]`로 날짜를 계산하는데 이는 UTC 기준. 한국(UTC+9)에서 자정~오전 9시 사이 학습하면 전날로 기록되어 스트릭이 끊길 수 있음.
- **재현**: KST 00:00~08:59에 학습
- **영향**: 연속 학습 스트릭 부정확

---

### M-8. TalkContext - Hydration Mismatch 위험

- **파일**: `src/contexts/TalkContext.tsx:55-73`
- **설명**: `useState` 초기값과 `useEffect` 내 localStorage 읽기로 이중 초기화. SSR 시 기본값, CSR 시 localStorage 값으로 달라져 hydration mismatch 경고 발생 가능.
- **영향**: React 콘솔 경고, 간헐적 UI 깜빡임

---

### M-9. Login Page - auth 상태 깜빡임 시 무한 루프 가능

- **파일**: `src/app/login/page.tsx:27-31`
- **설명**: `waitingForAuth` 의존성이 있는 useEffect에서 auth 상태가 빠르게 변하면 effect가 반복 실행될 수 있음.
- **재현**: 네트워크 불안정 시 Firebase auth 상태 깜빡임
- **영향**: 불필요한 리다이렉트 반복

---

### M-10. Cards Page - expandWord 실패 시 피드백 없음

- **파일**: `src/app/cards/page.tsx:177-209`
- **설명**: `expandWord` API 호출 실패 시 빈 콘텐츠만 설정하고 사용자에게 에러 메시지를 표시하지 않음.
- **재현**: 백엔드 다운 상태에서 단어 확장 시도
- **영향**: 사용자가 기능이 왜 안 되는지 알 수 없음

---

## Low (코드 품질, 성능)

### L-1. TTSSettingsModal - 음성 목록 하드코딩 제한

- **파일**: `src/components/TTSSettingsModal.tsx:60-62`
- **설명**: `otherVoices`를 `.slice(0, 5)`로 5개만 표시. 이유 불명, 주석 없음.
- **영향**: 기기에 더 많은 음성이 있어도 선택 불가

---

### L-2. ListeningIndicator - 비효율적 렌더링

- **파일**: `src/components/ListeningIndicator.tsx:19`
- **설명**: `Date.now() / 300` 계산이 매 렌더마다 실행됨. `requestAnimationFrame` 대신 React 렌더 사이클에 의존하여 애니메이션이 불규칙.
- **영향**: CPU 사용량 미미하나 비효율적

---

### L-3. savedWords - Firebase 동기화 미구현

- **파일**: `src/lib/savedWords.ts`
- **설명**: 저장된 단어가 localStorage에만 저장되어 기기 변경 시 데이터 손실. learningHistory, ttsSettings 등은 Firebase 동기화가 구현되어 있으나 savedWords만 누락.
- **영향**: 기기 변경 시 저장 단어 손실

---

### L-4. baseApi - 에러 정보 부족

- **파일**: `src/infrastructure/api/baseApi.ts:24-25`
- **설명**: API 에러 시 status code만 반환하고 응답 body를 포함하지 않음. 디버깅 어려움.
- **영향**: 에러 원인 파악 어려움

---

### L-5. chatApi - API 타임아웃 없음

- **파일**: `src/infrastructure/api/chatApi.ts`
- **설명**: 모든 API 호출에 `AbortController` 기반 타임아웃이 없음. 네트워크 장애 시 요청이 무한 대기.
- **영향**: 느린 네트워크에서 사용자 대기

---

### L-6. Create Page - 미사용 변수

- **파일**: `src/app/create/page.tsx:42`
- **설명**: `authLoading` 변수를 destructuring하지만 사용하지 않음.
- **영향**: Dead code, TypeScript strict 모드에서 경고 가능

---

### L-7. learningHistory - 약한 ID 생성

- **파일**: `src/lib/learningHistory.ts:58`
- **설명**: `Math.random().toString(36).substr(2, 9)`로 ID 생성. 9자리 base36은 약 5조 가지이나 `Math.random()`의 엔트로피가 낮아 충돌 가능성 존재.
- **영향**: 극히 낮은 확률의 ID 충돌

---

## 페이지별 이슈 분포

| 페이지/컴포넌트 | Critical | High | Medium | Low | 합계 |
|----------------|----------|------|--------|-----|------|
| ChatWindow | 1 | 2 | 1 | - | 4 |
| TTSContext | 1 | 1 | - | - | 2 |
| useAudioRecorder | 1 | - | - | - | 1 |
| userDataSync | 1 | - | - | - | 1 |
| ServiceWorkerRegister | 1 | - | - | - | 1 |
| VoiceRecorder | - | 1 | - | - | 1 |
| MessageBubble | - | 1 | - | - | 1 |
| my/page | - | 1 | - | - | 1 |
| cards/page | - | 1 | 1 | - | 2 |
| create/page | - | 1 | - | 1 | 2 |
| AppShell | - | 1 | - | - | 1 |
| PWAInstallGuide | - | - | 2 | - | 2 |
| WordPopup | - | - | 1 | - | 1 |
| STTConfirmationBanner | - | - | 1 | - | 1 |
| feedback/page | - | - | 1 | - | 1 |
| learningHistory | - | - | 1 | 1 | 2 |
| TalkContext | - | - | 1 | - | 1 |
| login/page | - | - | 1 | - | 1 |
| TTSSettingsModal | - | - | - | 1 | 1 |
| ListeningIndicator | - | - | - | 1 | 1 |
| savedWords | - | - | - | 1 | 1 |
| baseApi / chatApi | - | - | - | 2 | 2 |

---

## 수정 우선순위 제안

### 1단계 - 즉시 수정 (데이터 손실/메모리 누수)
- C-3: 통계 병합 로직 (데이터 손실)
- C-5: onstop 핸들러 통합
- C-1: setInterval cleanup

### 2단계 - 기능 수정
- H-6: /community 라우트 수정
- H-7: TTS onEnd 이중 호출 방지
- H-8: Firebase 초기화 타임아웃 추가
- H-2: VoiceRecorder 재시도 취소 처리

### 3단계 - 안정성 개선
- M-4: WordPopup AbortController
- M-7: 시간대 기반 날짜 계산
- M-1: sendMessage 리팩토링

### 4단계 - 품질 개선
- Low 이슈들 순차 처리
