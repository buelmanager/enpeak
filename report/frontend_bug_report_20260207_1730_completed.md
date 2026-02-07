# EnPeak Frontend 버그 검증 리포트

**작성일**: 2026-02-07 17:30
**작성자**: 시니어 개발자 (코드 리뷰)
**대상**: 이전 버그 리포트(report/BUG_REPORT.md) 30건에 대한 수정 확인

---

## 요약

| 상태 | 건수 | 비율 |
|------|------|------|
| 수정 완료 | 8 | 27% |
| 미수정 | 22 | 73% |
| **총계** | **30** | 100% |

### 심각도별 수정 현황

| 심각도 | 전체 | 수정 | 미수정 | 수정률 |
|--------|------|------|--------|--------|
| Critical | 5 | 4 | 1 | 80% |
| High | 8 | 0 | 8 | 0% |
| Medium | 10 | 4 | 6 | 40% |
| Low | 7 | 0 | 7 | 0% |

---

## Part 1: 수정 완료 항목 (8건)

### C-1. ServiceWorkerRegister - setInterval 미정리
- **상태**: 수정 완료
- **파일**: `src/components/ServiceWorkerRegister.tsx`

**Before**:
```tsx
// setInterval 반환값 미저장, cleanup 없음
setInterval(() => {
  registration.update()
}, 60 * 60 * 1000)
```

**After**:
```tsx
let intervalId: ReturnType<typeof setInterval> | null = null
// ...
intervalId = setInterval(() => {
  registration.update()
}, 60 * 60 * 1000)
// ...
return () => {
  if (intervalId) clearInterval(intervalId)
}
```

**평가**: intervalId를 변수에 저장하고 useEffect cleanup에서 clearInterval 호출. 정상 수정됨.

---

### C-3. userDataSync - 통계 병합 Math.max
- **상태**: 의도적 유지 (주석 수정)
- **파일**: `src/lib/userDataSync.ts:242-250`

**Before**:
```tsx
// 둘 다 오늘 데이터면 합산
totalSessions: Math.max(...)
```

**After**:
```tsx
// 둘 다 오늘 데이터면 더 큰 값 선택 (같은 세션 데이터가 양쪽에 있을 수 있으므로 합산 대신 max 유지)
totalSessions: Math.max(...)
```

**평가**: 로직은 동일하나 주석이 의도를 명확히 설명. 동일 세션 데이터가 로컬과 Firebase 양쪽에 존재할 수 있어 합산 시 이중 계산 문제가 있으므로 Math.max가 더 안전한 접근. 다만 서로 다른 기기에서 별도 세션으로 학습한 경우 데이터 손실 가능성은 여전히 존재. 향후 delta 기반 동기화 고려 필요.

---

### C-4. TTSContext - HD TTS 오디오 캐시 blob URL 미해제
- **상태**: 수정 완료
- **파일**: `src/contexts/TTSContext.tsx:215-221`

**Before**:
```tsx
// unmount 시 cleanup 없음
```

**After**:
```tsx
// Cleanup blob URLs on unmount
useEffect(() => {
  return () => {
    audioCache.forEach(url => URL.revokeObjectURL(url))
    audioCache.clear()
  }
}, [])
```

**평가**: TTSProvider unmount 시 모든 캐시 blob URL을 해제하고 Map을 비움. 정상 수정됨.

---

### C-5. useAudioRecorder - onstop 핸들러 덮어쓰기
- **상태**: 수정 완료
- **파일**: `src/hooks/useAudioRecorder.ts`

**Before**:
```tsx
// startRecording에서 onstop 설정
recorder.onstop = () => {
  audioBlobRef.current = new Blob(chunksRef.current, { type: mType })
}
// stopRecording에서 onstop 덮어쓰기
recorder.onstop = () => {
  // blob 생성 + resolve(blob) + stream 정리
}
```

**After**:
```tsx
// resolveStopRef 패턴: 단일 onstop 핸들러
const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null)

// startRecording - 통합 onstop
recorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: mType })
  audioBlobRef.current = blob
  setIsRecording(false)
  // stream 정리
  if (ownStreamRef.current && streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop())
  }
  streamRef.current = null
  // stopRecording Promise resolve
  if (resolveStopRef.current) {
    resolveStopRef.current(blob)
    resolveStopRef.current = null
  }
}

// stopRecording - ref에 resolve 저장만
resolveStopRef.current = resolve
recorder.stop()
```

**평가**: 단일 onstop 핸들러에서 blob 생성, state 정리, stream 정리, Promise resolve를 모두 처리. 외부 요인으로 recorder가 중지되어도 정상 동작. 훌륭한 수정.

---

### M-3. PWAInstallGuide - deprecated document.execCommand
- **상태**: 수정 완료 (이미 적용되어 있었음)
- **파일**: `src/components/PWAInstallGuide.tsx:177-192`

**코드**:
```tsx
try {
  await navigator.clipboard.writeText(appUrl)
  // 성공
} catch {
  // fallback: deprecated API
  const textarea = document.createElement('textarea')
  textarea.value = appUrl
  document.execCommand('copy')
}
```

**평가**: 최신 Clipboard API 우선 사용, execCommand는 레거시 브라우저 폴백. 업계 표준 패턴. 적절함.

---

### M-5. STTConfirmationBanner - 100ms interval 과도한 리렌더링
- **상태**: 수정 완료
- **파일**: `src/components/STTConfirmationBanner.tsx:39-43`

**Before**:
```tsx
countdownRef.current = setInterval(() => {
  // ...
  setCountdown(Math.ceil(remaining))
}, 100)  // 100ms - 초당 10회 리렌더링
```

**After**:
```tsx
countdownRef.current = setInterval(() => {
  // ...
  setCountdown(Math.ceil(remaining))
}, 1000)  // 1000ms - 초당 1회 리렌더링
```

**평가**: 표시는 초 단위이므로 1000ms가 적절. 불필요한 리렌더링 90% 감소. 정상 수정됨.

---

### M-8. TalkContext - hydration mismatch 위험
- **상태**: 수정 완료 (이미 적용되어 있었음)
- **파일**: `src/contexts/TalkContext.tsx:55-73`

**코드**:
```tsx
const [mode, setModeState] = useState<TalkMode>(() => {
  if (typeof window !== 'undefined') {
    return getInitialMode()
  }
  return DEFAULT_MODE  // SSR fallback
})

useEffect(() => {
  const savedMode = getInitialMode()
  setModeState(savedMode)
  setIsLoaded(true)
}, [])
```

**평가**: SSR 시 기본값, CSR 시 localStorage 동기화. isLoaded로 깜빡임 방지. 적절한 hydration 처리.

---

### M-9. Login Page - auth 상태 깜빡임 무한 루프
- **상태**: 수정 완료 (이미 적용되어 있었음)
- **파일**: `src/app/login/page.tsx:27-31`

**코드**:
```tsx
useEffect(() => {
  if (waitingForAuth && isReady && isAuthenticated) {
    router.replace(redirectTo)
  }
}, [waitingForAuth, isReady, isAuthenticated, redirectTo, router])
```

**평가**: `waitingForAuth` 플래그가 로그인 버튼 클릭 후에만 true가 되므로, auth 상태 변경만으로는 effect가 트리거되지 않음. 안전한 패턴.

---

## Part 2: 미수정 항목 (22건)

### Critical (1건)

#### C-2. ChatWindow - fallbackTimestamps 배열 관리
- **파일**: `src/components/ChatWindow.tsx:401-406`
- **현재 상태**: canUseFallback()에서 오래된 항목 필터링으로 배열 크기 자동 관리됨
- **평가 수정**: 실제로는 FALLBACK_RATE_LIMIT(3) + FALLBACK_RATE_WINDOW_MS(60초) 조합으로 배열 최대 크기가 3으로 제한됨. 이전 리포트에서의 "무한 증가" 판단은 부정확했음. **실제 위험도 Low로 하향 조정**.

---

### High (8건)

#### H-1. ChatWindow - autoRecord 500ms 후 조건 미재검증
- **파일**: `src/components/ChatWindow.tsx:239-250`
- **현재 코드**:
```tsx
autoRecordTimerRef.current = setTimeout(() => {
  autoRecordTimerRef.current = null
  if (voiceCycleActive && isVoiceMode) {
    voiceRecorderRef.current?.startRecording()
  }
}, 500)
```
- **문제**: `!loading`, `!isSpeaking` 조건이 500ms 후에는 검증되지 않음
- **영향**: TTS가 500ms 내에 다시 시작되면 동시 재생+녹음 발생 가능
- **수정 제안**: setTimeout 콜백 내에서 `isSpeaking` 상태도 재검증

---

#### H-2. VoiceRecorder - no-speech 재시도 중 사용자 중지 무시
- **파일**: `src/components/VoiceRecorder.tsx:98-112`
- **현재 코드**:
```tsx
case 'no-speech':
  if (retryCountRef.current < MAX_NO_SPEECH_RETRIES) {
    retryCountRef.current++
    setTimeout(() => {
      try { recognition.start() } catch (e) { ... }
    }, 300)
    return
  }
```
- **문제**: 300ms setTimeout 내에서 `manualStopRef.current` 미확인
- **영향**: 사용자가 녹음 중지 후에도 인식이 재시작
- **수정 제안**: setTimeout 콜백에 `if (manualStopRef.current) return` 추가

---

#### H-3. MessageBubble - 롱프레스 타이머 unmount 미정리
- **파일**: `src/components/MessageBubble.tsx:66, 78-86`
- **문제**: `longPressTimer.current`가 useEffect cleanup에서 정리되지 않음
- **수정 제안**: useEffect cleanup에서 `clearTimeout(longPressTimer.current)` 추가

---

#### H-4. My Page - 버전 비교 로직
- **파일**: `src/app/my/page.tsx:276-280`
- **문제**: `serverVersion !== APP_VERSION` 단순 문자열 비교
- **영향**: 서버 롤백 시에도 "최신 버전" 표시
- **수정 제안**: semver 비교 유틸리티 함수 도입

---

#### H-5. Cards Page - fetchWords unmount 중 state 업데이트
- **파일**: `src/app/cards/page.tsx:71-145`
- **문제**: AbortController 없이 비동기 fetch, unmount 후 setState 호출 가능
- **수정 제안**: `useEffect` 내 AbortController + cleanup에서 abort()

---

#### H-6. Create Page - /community 라우트
- **파일**: `src/app/create/page.tsx:211-222`
- **현재 코드**:
```tsx
router.push('/community?published=true')
// 또는
router.push('/community')
```
- **문제**: middleware에서 `/community` -> `/talk?mode=roleplay` 리다이렉트 시 `?published=true` 파라미터 손실
- **수정 제안**: 직접 `/talk?mode=roleplay&published=true`로 이동

---

#### H-7. TTSContext - onEnd 이중 호출
- **파일**: `src/contexts/TTSContext.tsx:298-305`
- **문제**: 500ms 타임아웃과 utterance.onend에서 각각 onEnd() 호출 가능
- **수정 제안**: `let ended = false` 플래그로 이중 호출 방지

---

#### H-8. AppShell - Firebase 초기화 무한 대기
- **파일**: `src/components/AppShell.tsx:41-64`
- **문제**: `if (!isReady) return`에 타임아웃 없음
- **영향**: Firebase 장애 시 앱 완전 사용 불가
- **수정 제안**: 10초 타임아웃 후 isReady를 강제 true 처리 (오프라인 모드)

---

### Medium (6건)

#### M-1. ChatWindow - sendMessage 170줄+ 거대 함수
- **파일**: `src/components/ChatWindow.tsx:572-744`
- **문제**: situation setup, roleplay, free chat 로직이 단일 함수에 혼재. 네트워크 에러 시 사용자 피드백 없음.
- **수정 제안**: 모드별 핸들러 분리, 에러 토스트 추가

---

#### M-2. PWAInstallGuide - setTimeout 미정리
- **파일**: `src/components/PWAInstallGuide.tsx:137`
- **문제**: 2초 자동 팝업 setTimeout이 cleanup에서 미정리
- **영향**: sessionStorage 가드로 실질적 영향 미미하나 코드 품질 이슈
- **수정 제안**: timeoutId 저장 + cleanup

---

#### M-4. WordPopup - 단어 변경 race condition
- **파일**: `src/components/WordPopup.tsx:26-65`
- **문제**: 단어 빠르게 변경 시 이전 fetch 미취소, 늦게 도착한 응답이 표시
- **수정 제안**: AbortController로 이전 요청 취소

---

#### M-6. Feedback Page - 좋아요 race condition
- **파일**: `src/app/feedback/page.tsx:158-181`
- **문제**: 좋아요 빠른 클릭 시 Firestore 경합
- **수정 제안**: 낙관적 UI + Firestore transaction 또는 디바운싱

---

#### M-7. learningHistory - 스트릭 시간대 문제
- **파일**: `src/lib/learningHistory.ts:34-36`
- **현재 코드**:
```tsx
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]  // UTC 기준
}
```
- **문제**: KST 00:00~08:59 학습 시 전날로 기록
- **수정 제안**: `toLocaleDateString('sv-SE')` 또는 Intl.DateTimeFormat 사용

---

#### M-10. Cards Page - expandWord 실패 피드백 없음
- **파일**: `src/app/cards/page.tsx:177-209`
- **문제**: API 실패 시 빈 배열만 설정, 사용자에게 에러 표시 없음
- **수정 제안**: catch 블록에서 에러 토스트/메시지 표시

---

### Low (7건)

| ID | 파일 | 문제 | 상태 |
|----|------|------|------|
| L-1 | TTSSettingsModal.tsx:203 | otherVoices.slice(0,5) 하드코딩 | 미수정 |
| L-2 | ListeningIndicator.tsx:19 | Date.now() 매 렌더 실행 | 미수정 |
| L-3 | savedWords.ts | Firebase 동기화 미구현 | 미수정 |
| L-4 | baseApi.ts:24-25 | 에러 시 body 미포함 | 미수정 |
| L-5 | chatApi.ts | API 타임아웃 없음 | 미수정 |
| L-6 | create/page.tsx:42 | authLoading 미사용 변수 | 미수정 |
| L-7 | learningHistory.ts:58 | Math.random ID 충돌 가능 | 미수정 |

---

## Part 3: 수정 우선순위 재정리

### 즉시 수정 권장 (High Impact, Low Effort)

| 순위 | ID | 예상 공수 | 설명 |
|------|-----|----------|------|
| 1 | H-7 | 5분 | TTS onEnd 이중 호출 방지 플래그 추가 |
| 2 | H-2 | 5분 | no-speech 재시도에 manualStop 체크 추가 |
| 3 | H-3 | 5분 | 롱프레스 타이머 useEffect cleanup 추가 |
| 4 | H-6 | 5분 | /community -> /talk?mode=roleplay 직접 이동 |
| 5 | M-7 | 10분 | toLocaleDateString으로 시간대 수정 |
| 6 | L-6 | 1분 | 미사용 변수 제거 |

### 다음 스프린트 권장

| 순위 | ID | 예상 공수 | 설명 |
|------|-----|----------|------|
| 7 | H-8 | 30분 | AppShell Firebase 타임아웃 + 오프라인 모드 |
| 8 | H-1 | 15분 | autoRecord 조건 재검증 |
| 9 | M-4 | 15분 | WordPopup AbortController |
| 10 | H-5 | 15분 | Cards fetchWords AbortController |
| 11 | M-10 | 10분 | expandWord 에러 토스트 |
| 12 | M-6 | 20분 | Firestore 좋아요 transaction |
| 13 | L-5 | 15분 | API 타임아웃 (AbortController) |

### 리팩토링 (별도 계획)

| ID | 예상 공수 | 설명 |
|----|----------|------|
| M-1 | 2시간 | sendMessage 함수 분리 |
| H-4 | 30분 | semver 비교 유틸리티 |
| L-3 | 2시간 | savedWords Firebase 동기화 |
| L-4 | 15분 | baseApi 에러 정보 확장 |

---

## 결론

이전 리포트의 Critical 5건 중 4건이 수정되어 **핵심 안정성이 크게 향상**되었습니다.

남은 22건 중 즉시 수정 가능한 6건(30분 미만)을 우선 처리하면 **High 이슈 4건이 해소**됩니다. 특히 H-7(TTS onEnd 이중호출)과 H-2(VoiceRecorder 재시도)는 음성 사이클 안정성에 직접 영향을 미치므로 최우선 수정을 권장합니다.
