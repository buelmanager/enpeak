# EnPeak Frontend 개선 문서

**작성일**: 2026-02-07 17:30
**작성자**: 시니어 기획자 (제품 개선)
**범위**: 프론트엔드 전체 - UX, 기능, 아키텍처, 성능

---

## 목차

1. [제품 현황 분석](#1-제품-현황-분석)
2. [미수정 버그 기반 기술 개선](#2-미수정-버그-기반-기술-개선)
3. [UX 개선 제안](#3-ux-개선-제안)
4. [기능 개선/추가 제안](#4-기능-개선추가-제안)
5. [아키텍처 개선 제안](#5-아키텍처-개선-제안)
6. [단계별 실행 계획](#6-단계별-실행-계획)

---

## 1. 제품 현황 분석

### 1.1 현재 포지션

EnPeak은 AI 기반 영어 학습 PWA로, **음성 우선(Voice-First)** 디자인이 핵심 차별점입니다.

**강점**:
- 무료 AI 대화 (경쟁사 대비 진입 장벽 낮음)
- 음성 입출력 중심 UX (Speak과 유사한 학습 경험)
- 한국어 UI/지원 (현지화)
- 커뮤니티 시나리오 생성 (사용자 참여형 콘텐츠)
- PWA 지원 (앱스토어 없이 설치)

**약점**:
- 게이미피케이션 부재 (XP, 리그, 도전 과제 없음)
- 진행 추적 미흡 (주간 통계 미구현, 스트릭 불정확)
- 롤플레이 모드 발견성 낮음 (ModeSelector에 미표시)
- 오프라인 지원 제한적 (Talk은 네트워크 필수)
- 접근성(WCAG) 미충족

### 1.2 경쟁사 비교

| 기능 | EnPeak | Speak | Duolingo |
|------|--------|-------|----------|
| AI 대화 | O (무료) | O (유료) | 부분적 |
| 음성 입력 | O | O | O |
| 발음 점수 | X | O (100점 척도) | O |
| 게이미피케이션 | X | 부분적 | O (XP, 리그, 스트릭) |
| 오프라인 학습 | 부분적 | O | O |
| 커리큘럼 | X (자유형) | O (CEFR) | O (트리 구조) |
| 커뮤니티 콘텐츠 | O | X | X |
| 가격 | 무료 | $14/월 | $7/월 |

### 1.3 핵심 기회

1. **게이미피케이션 도입** - 리텐션 핵심 동력
2. **발음 평가 추가** - 학습 효과 체감 향상
3. **구조화된 학습 경로** - 초보자 온보딩 개선
4. **오프라인 모드 확장** - PWA 장점 극대화

---

## 2. 미수정 버그 기반 기술 개선

### 2.1 음성 사이클 안정화 (H-1, H-2, H-7)

**현재 문제**:
음성 대화 사이클(TTS -> 자동 녹음 -> STT -> AI 응답 -> TTS)이 4개의 독립 플래그(`voiceCycleActive`, `voiceCycleActiveRef`, `shouldAutoRecordRef`, `conversationStarted`)로 관리되어 상태 동기화가 어렵고 예측 불가능한 동작이 발생합니다.

**개선 방향: 유한 상태 머신(FSM) 도입**

```
[IDLE] --(사용자 시작)--> [LISTENING]
[LISTENING] --(STT 완료)--> [PROCESSING]
[PROCESSING] --(AI 응답)--> [SPEAKING]
[SPEAKING] --(TTS 완료)--> [LISTENING] (자동) 또는 [IDLE] (수동)
```

**구현 방법**:
- `useReducer` 기반 상태 머신 구현
- 각 상태 전환에 가드 조건 추가 (예: SPEAKING -> LISTENING 전환 시 `isSpeaking === false` 확인)
- 타임아웃 자동 복구 (어떤 상태든 30초 초과 시 IDLE로 리셋)

**수정 대상 파일**:
- `src/components/ChatWindow.tsx` - 상태 머신 적용
- `src/components/VoiceRecorder.tsx` - manualStop 체크 추가 (H-2)
- `src/contexts/TTSContext.tsx` - onEnd 이중 호출 방지 (H-7)

**예상 공수**: 4시간

---

### 2.2 비동기 작업 안전성 (H-5, M-4)

**현재 문제**:
Cards 페이지의 fetchWords, WordPopup의 단어 조회 등에서 `AbortController`가 없어 unmount 후 state 업데이트, race condition 발생.

**개선 방향: 공통 useAsync 훅 도입**

```typescript
// src/hooks/useAsync.ts
function useAsync<T>(asyncFn: () => Promise<T>, deps: any[]) {
  // AbortController 자동 관리
  // unmount 시 자동 abort
  // loading, error, data 상태 제공
  // race condition 방지 (latest request wins)
}
```

**수정 대상 파일**:
- `src/hooks/useAsync.ts` (신규)
- `src/app/cards/page.tsx` - useAsync 적용
- `src/components/WordPopup.tsx` - useAsync 적용

**예상 공수**: 2시간

---

### 2.3 시간대 안전 날짜 처리 (M-7)

**현재 문제**:
`toISOString().split('T')[0]`는 UTC 기준이라 KST 00:00~08:59 학습 시 전날로 기록됨.

**개선 방향**:

```typescript
// src/lib/dateUtils.ts (신규)
function getLocalDateString(): string {
  return new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD, 로컬 시간대
}

function getLocalYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('sv-SE')
}
```

**수정 대상 파일**:
- `src/lib/dateUtils.ts` (신규)
- `src/lib/learningHistory.ts` - getTodayString 교체
- `src/lib/userDataSync.ts` - today 계산 교체

**예상 공수**: 30분

---

### 2.4 에러 처리 체계화 (M-1, M-10, L-4, L-5)

**현재 문제**:
API 에러 시 사용자 피드백 없음, 타임아웃 없음, 에러 정보 부족.

**개선 방향: 토스트 알림 + API 클라이언트 강화**

```typescript
// src/lib/apiClient.ts (신규)
const DEFAULT_TIMEOUT = 30_000

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new ApiError(response.status, errorBody)
    }
    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}
```

```typescript
// src/components/Toast.tsx (신규)
// 간단한 토스트 알림 컴포넌트
function showToast(message: string, type: 'error' | 'success' | 'info')
```

**수정 대상 파일**:
- `src/lib/apiClient.ts` (신규) - 타임아웃 + 에러 파싱
- `src/components/Toast.tsx` (신규) - 토스트 알림
- `src/infrastructure/api/baseApi.ts` - apiClient 사용
- `src/app/cards/page.tsx` - expandWord 에러 토스트
- `src/components/ChatWindow.tsx` - sendMessage 에러 토스트

**예상 공수**: 3시간

---

## 3. UX 개선 제안

### 3.1 Talk 페이지 - 모드 전환 개선

**현재 문제점**:
- 롤플레이 모드가 ModeSelector에 표시되지 않아 사용자가 발견하기 어려움
- 모드 전환 시 대화 내용이 즉시 삭제됨 (확인 없음)
- URL에 모드가 반영되지 않아 딥링크/뒤로가기 불가
- 상황 설정 시 "완료"를 타이핑해야 하는 비직관적 UX

**개선 방안**:

#### 3.1.1 ModeSelector 3탭 구조
```
[자유 대화] [표현 연습] [롤플레이]
```
- 롤플레이 탭 선택 시 ScenarioSelector가 하단에 슬라이드업
- 각 모드에 간단한 설명 툴팁 (첫 방문 시)

#### 3.1.2 대화 보존
- 모드 전환 시 "대화를 지우고 새로 시작할까요?" 확인 다이얼로그
- 이전 대화 임시 저장 (sessionStorage)
- "이전 대화 이어하기" 옵션

#### 3.1.3 URL 기반 상태
```
/talk                    -> 자유 대화
/talk?mode=expression    -> 표현 연습
/talk?mode=roleplay      -> 롤플레이
/talk?mode=roleplay&scenario=cafe_order -> 특정 시나리오
```
- `router.push` 대신 `router.replace`로 URL 업데이트
- 뒤로가기 시 이전 모드로 복귀

#### 3.1.4 상황 설정 UX 개선
- "완료" 타이핑 대신 명확한 "설정 완료" 버튼 상시 표시
- 예시 상황 3~5개 제안 카드 표시
- 설정 단계를 시각적 스텝퍼로 표시

**수정 대상 파일**:
- `src/components/ModeSelector.tsx` - 3탭 + 설명
- `src/app/talk/page.tsx` - URL 상태 관리
- `src/components/ChatWindow.tsx` - 대화 보존 + 상황 설정 UI
- `src/contexts/TalkContext.tsx` - URL 동기화

**예상 공수**: 6시간

---

### 3.2 Cards 페이지 - 학습 효과 강화

**현재 문제점**:
- "알아요/모르겠어요" 이분법적 선택만 가능
- 학습 진행률 미표시 (몇 개 학습했는지 알 수 없음)
- 레벨 전환 시 진행률 초기화
- 숙어/예문 확장 기능 발견 어려움
- 오답 단어 반복 학습 없음

**개선 방안**:

#### 3.2.1 3단계 학습 응답
```
[모르겠어요]  [애매해요]  [알아요]
```
- "애매해요" -> 2라운드 후 재출제
- "모르겠어요" -> 1라운드 후 재출제
- "알아요" -> 이번 세션에서 제외

#### 3.2.2 학습 진행 바
```
진행: 12/30 단어  ||||||||||||.............. 40%
오늘 목표: 30단어 중 12개 완료
```
- 화면 상단에 진행 바 상시 표시
- 일일 목표 설정 가능 (기본 30단어)

#### 3.2.3 스페이스드 리피티션 (SM-2 간소화)
```typescript
// 각 단어의 학습 상태
interface WordProgress {
  word: string
  level: number       // 0: 새 단어, 1-5: 숙련도
  nextReview: string  // 다음 복습 날짜
  failCount: number
}
```
- localStorage에 진행 상태 저장
- 레벨 전환해도 진행 상태 유지
- "오늘 복습할 단어" 섹션 추가

#### 3.2.4 확장 기능 개선
- 단어 카드 하단에 항상 "숙어/예문 보기" 버튼 표시
- 확장 결과 캐싱 (IndexedDB)
- 오프라인에서도 캐시된 확장 정보 표시

**수정 대상 파일**:
- `src/app/cards/page.tsx` - 전체 리팩토링
- `src/lib/wordProgress.ts` (신규) - SM-2 알고리즘
- `src/lib/savedWords.ts` - Firebase 동기화 추가

**예상 공수**: 8시간

---

### 3.3 My 페이지 - 통계 대시보드

**현재 문제점**:
- 주간 학습 통계 미구현 (헤더만 있고 내용 없음)
- 스트릭 계산 부정확 (시간대 문제)
- 학습 이력 조회 불가
- STT/알림 설정 없음

**개선 방안**:

#### 3.3.1 주간 통계 카드
```
이번 주 학습 현황
---------------------------------
| 월 | 화 | 수 | 목 | 금 | 토 | 일 |
| -- | O  | O  | -- | O  | -- | -- |
---------------------------------
학습일: 3일 | 단어: 45개 | 회화: 5회
연속 학습: 3일째
```

#### 3.3.2 설정 확장
- STT 설정 (감도, 재시도 횟수)
- 알림 설정 (학습 리마인더 시간)
- 데이터 내보내기 (JSON 다운로드)
- 기기 간 동기화 상태 표시

**수정 대상 파일**:
- `src/app/my/page.tsx` - 통계 UI
- `src/lib/learningHistory.ts` - 시간대 수정 + 주간 통계 함수
- `src/contexts/ConversationSettingsContext.tsx` - 설정 확장

**예상 공수**: 6시간

---

### 3.4 Daily 페이지 - 사용자 참여 강화

**현재 문제점**:
- 페이지 방문할 때마다 표현이 변경 (일관성 없음)
- 학습 완료 여부 추적 없음
- 공유 기능 없음

**개선 방안**:

#### 3.4.1 진정한 "오늘의 표현"
```typescript
// 날짜 기반 고정 표현
function getDailyExpression(): string {
  const today = getLocalDateString()
  const cached = localStorage.getItem(`daily_expression_${today}`)
  if (cached) return JSON.parse(cached)

  // API에서 가져온 후 캐시
  const expression = await fetchExpression()
  localStorage.setItem(`daily_expression_${today}`, JSON.stringify(expression))
  return expression
}
```
- 24시간 동안 같은 표현 유지
- "연습 완료" 체크마크 (localStorage)
- 새로고침 버튼은 유지하되 "다른 표현 보기"로 명칭 변경

#### 3.4.2 표현 학습 흐름
```
1. 오늘의 표현 카드 [읽기]
2. 예문 3개 확인 [이해하기]
3. "이 표현으로 대화하기" 버튼 [실천하기]
4. 대화 완료 후 "학습 완료" 배지 [달성감]
```

**수정 대상 파일**:
- `src/app/daily/page.tsx` - 날짜 고정 + 학습 흐름
- `src/lib/learningHistory.ts` - 일일 표현 학습 기록

**예상 공수**: 3시간

---

### 3.5 음성 녹음 UX 개선

**현재 문제점**:
- 녹음 시작 시 시각적 피드백 부족 (버튼 색상 변경만)
- 오디오 레벨 표시 없음 (useAudioLevel 훅은 있으나 미사용)
- 에러 메시지가 기술적 ("음성 인식 오류가 발생했어요")
- 재시도 자동 진행이 사용자에게 보이지 않음

**개선 방안**:

#### 3.5.1 녹음 시각 피드백 강화
```
녹음 전: [마이크 아이콘] (회색)
녹음 중: [마이크 아이콘 + 오디오 레벨 바] (빨간색, 펄스)
처리 중: [로딩 스피너] "인식 중..."
완료:    [체크 아이콘] (초록색, 0.5초)
```
- 기존 `useAudioLevel` 훅의 레벨 데이터를 녹음 버튼 주변에 시각화
- 녹음 중 소리 크기에 따라 바 높이 변경

#### 3.5.2 사용자 친화적 에러 메시지
```
"마이크를 사용할 수 없어요"
  -> "마이크 접근이 차단되어 있어요. 브라우저 설정에서 마이크를 허용해주세요."
  -> [설정 열기] 버튼

"음성 인식 오류가 발생했어요"
  -> "목소리가 잘 안 들렸어요. 조금 더 크게 말씀해주세요."
  -> [다시 시도] 버튼

"no-speech 재시도 중"
  -> "아직 목소리가 안 들려요... 다시 듣는 중 (2/3)"
```

**수정 대상 파일**:
- `src/components/VoiceRecorder.tsx` - 에러 메시지 개선 + 레벨 표시
- `src/components/ListeningIndicator.tsx` - 오디오 레벨 시각화

**예상 공수**: 4시간

---

## 4. 기능 개선/추가 제안

### 4.1 게이미피케이션 시스템 (P2)

**목표**: 사용자 리텐션 향상 (DAU/MAU 비율 개선)

**핵심 요소**:

#### 4.1.1 경험치(XP) 시스템
```
자유 대화 1턴: +5 XP
표현 연습 완료: +20 XP
롤플레이 완료: +30 XP
단어 학습 10개: +15 XP
일일 미션 완료: +50 XP (보너스)
```

#### 4.1.2 연속 학습 (스트릭) 강화
```
현재: 단순 일수 표시
개선:
- 스트릭 달력 (월 단위)
- 스트릭 위험 알림 ("오늘 아직 학습 안 하셨어요!")
- 스트릭 프리즈 1회/주 (학습 못 한 날 방어)
```

#### 4.1.3 일일 미션
```
오늘의 미션 (매일 3개 랜덤 생성):
1. [O] 오늘의 표현 학습하기 (+10 XP)
2. [ ] AI와 5턴 대화하기 (+20 XP)
3. [ ] 단어 15개 학습하기 (+15 XP)
보너스: 3개 모두 완료 시 +50 XP
```

**구현 접근**:
- `src/lib/gamification.ts` (신규) - XP/레벨/미션 로직
- Firebase Firestore에 사용자 XP 저장
- My 페이지에 XP/레벨 표시

**예상 공수**: 16시간

---

### 4.2 발음 평가 기능 (P2)

**목표**: 단순 "맞다/틀리다"에서 "점수 + 개선 가이드"로 전환

**구현 방법**:

#### 방법 A: 프론트엔드 기반 (빠른 MVP)
```
1. Web Speech API STT 결과 텍스트를 기대 문장과 비교
2. 단어 단위 일치율 계산 (Levenshtein distance)
3. 점수 = 일치 단어 수 / 전체 단어 수 * 100
```

#### 방법 B: 백엔드 AI 기반 (정확도 높음)
```
1. 오디오 녹음 (useAudioRecorder 활용)
2. 백엔드에서 Whisper STT + 음소 분석
3. 기대 텍스트와 비교하여 점수 + 피드백 생성
4. "th" 발음, "r/l" 구분 등 한국인 특화 피드백
```

**권장**: 방법 A로 MVP -> 방법 B로 고도화

**예상 공수**: MVP 8시간, 고도화 24시간

---

### 4.3 온보딩 플로우 (P1)

**현재 문제**: 신규 사용자가 앱 진입 시 아무 안내 없이 빈 채팅 화면

**개선 방안**:

#### 첫 방문 온보딩 (3단계)
```
Step 1: "안녕하세요! EnPeak에 오신 것을 환영합니다"
        "AI와 영어로 대화하며 실력을 키워보세요"

Step 2: "3가지 학습 방법이 있어요"
        [자유 대화] - AI와 자유롭게 대화
        [표현 연습] - 오늘의 표현 활용 연습
        [롤플레이] - 카페, 호텔 등 상황 연습

Step 3: "먼저 간단히 인사해볼까요?"
        -> 바로 자유 대화 시작 + 가이드 메시지
```

**수정 대상 파일**:
- `src/components/Onboarding.tsx` (신규)
- `src/app/talk/page.tsx` - 첫 방문 감지 + 온보딩 표시

**예상 공수**: 4시간

---

### 4.4 오프라인 모드 (P2)

**현재 상태**: Cards는 오프라인 가능, Talk/Daily는 네트워크 필수

**개선 방안**:

#### 4.4.1 Service Worker 캐싱 전략
```
정적 자원: Cache First (CSS, JS, 이미지)
API 응답: Network First, Cache Fallback
  - /api/vocabulary/* : 24시간 캐시
  - /api/rag/* : 1시간 캐시
  - /api/roleplay/scenarios : 24시간 캐시
```

#### 4.4.2 오프라인 Talk 모드
- 네트워크 미연결 감지 시 안내 메시지
- "오프라인에서도 단어 학습은 가능합니다" 안내
- 이전 대화 복습 기능 (저장된 대화 읽기)

#### 4.4.3 데이터 프리페치
- Daily 표현: 다음 3일치 미리 캐시
- Cards 단어: 사용자 레벨의 전체 단어 캐시
- 시나리오: 인기 시나리오 상위 10개 캐시

**예상 공수**: 12시간

---

## 5. 아키텍처 개선 제안

### 5.1 상태 관리 최적화

**현재 문제**:
- 5개 중첩 Context Provider (Auth > TTS > ConversationSettings > Talk > children)
- 부모 Context 상태 변경 시 모든 자식 리렌더링
- 메모이제이션 미적용

**개선 방향**:

#### 5.1.1 Context 값 메모이제이션
```tsx
// Before
<TTSContext.Provider value={{ voices, settings, speak, ... }}>

// After
const contextValue = useMemo(() => ({
  voices, settings, speak, ...
}), [voices, settings]) // 함수는 useCallback으로 래핑
```

#### 5.1.2 Context 분할
```
현재: TTSContext (음성 목록 + 설정 + 재생)
개선:
  - TTSVoicesContext (음성 목록, 거의 변경 안 됨)
  - TTSSettingsContext (설정)
  - TTSPlaybackContext (재생 상태, 자주 변경)
```

**예상 공수**: 4시간

---

### 5.2 코드 스플리팅

**현재 문제**: 전체 앱이 단일 번들로 로드

**개선 방향**:

```tsx
// 라우트 단위 동적 임포트
// next.config.js는 이미 App Router 사용 중이므로
// 각 page.tsx가 자동 코드 스플리팅됨

// 컴포넌트 단위 동적 임포트 (헤비 컴포넌트)
const PronunciationModal = dynamic(() => import('@/components/PronunciationModal'), {
  loading: () => <Spinner />,
})

const TTSSettingsModal = dynamic(() => import('@/components/TTSSettingsModal'))
```

**대상 컴포넌트**:
- PronunciationModal (발음 연습)
- PronunciationPracticeSheet
- TTSSettingsModal (TTS 설정)
- PWAInstallGuide (설치 가이드)
- ScenarioSelector (시나리오 선택)

**예상 공수**: 2시간

---

### 5.3 접근성 (WCAG AA) 개선

**현재 문제점**:
- 색상 대비 미달: #8a8a8a on #faf9f7 = 3.4:1 (최소 4.5:1 필요)
- 키보드 네비게이션 미지원
- ARIA 라벨 부재
- 모달 포커스 트랩 없음
- 화면 확대 차단 (userScalable: false)

**개선 방안**:

#### 5.3.1 색상 대비 수정
```css
/* Before */
color: #8a8a8a;  /* 3.4:1 on #faf9f7 */

/* After */
color: #6b6b6b;  /* 4.5:1 on #faf9f7 */
```

#### 5.3.2 키보드 지원
- Space/Enter로 녹음 시작/중지
- Escape로 모달/팝업 닫기
- Tab 순서 논리적 배치
- 포커스 인디케이터 추가

#### 5.3.3 ARIA 라벨
```tsx
<button aria-label="음성 녹음 시작" aria-pressed={isRecording}>
<div role="alert" aria-live="polite">{sttResult}</div>
<dialog aria-modal="true" aria-labelledby="modal-title">
```

#### 5.3.4 화면 확대 허용
```tsx
// layout.tsx viewport
userScalable: true  // WCAG 필수
```

**예상 공수**: 6시간

---

### 5.4 성능 최적화

**현재 문제점**:
- ChatWindow 텍스트 입력 시 매 키 입력마다 리렌더링
- Cards 단어 목록 전체 렌더링 (가상화 없음)
- vocabulary.json 2,648단어 한 번에 로드
- TTS 오디오 캐시 크기 기반이 아닌 개수 기반

**개선 방안**:

#### 5.4.1 입력 디바운싱
```tsx
// ChatWindow 텍스트 입력
const debouncedInput = useDeferredValue(input)
// 또는 입력은 로컬, 렌더링만 최적화
```

#### 5.4.2 Cards 가상화
```tsx
// react-window 또는 @tanstack/react-virtual
<FixedSizeList
  height={500}
  itemCount={words.length}
  itemSize={120}
>
  {({ index, style }) => <WordCard word={words[index]} style={style} />}
</FixedSizeList>
```

#### 5.4.3 단어 지연 로드
```tsx
// 레벨별 단어를 별도 파일로 분리
// /data/vocabulary_a1.json, /data/vocabulary_a2.json, ...
// 선택된 레벨만 로드
```

#### 5.4.4 TTS 캐시 크기 제한
```tsx
const MAX_CACHE_SIZE_MB = 10
let currentCacheSize = 0

function addToCache(key: string, blobUrl: string, blobSize: number) {
  while (currentCacheSize + blobSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
    evictOldest()
  }
  // ...
}
```

**예상 공수**: 6시간

---

## 6. 단계별 실행 계획

### P0: 즉시 수정 (이번 주 내) - 총 2시간

| 순위 | 작업 | 파일 | 공수 | 효과 |
|------|------|------|------|------|
| 1 | TTS onEnd 이중 호출 방지 (H-7) | TTSContext.tsx | 5분 | 음성 사이클 안정화 |
| 2 | VoiceRecorder manualStop 체크 (H-2) | VoiceRecorder.tsx | 5분 | 녹음 중지 버그 수정 |
| 3 | MessageBubble 타이머 cleanup (H-3) | MessageBubble.tsx | 5분 | 메모리 누수 방지 |
| 4 | Create 페이지 라우트 수정 (H-6) | create/page.tsx | 5분 | 네비게이션 오류 수정 |
| 5 | 시간대 안전 날짜 처리 (M-7) | learningHistory.ts, dateUtils.ts | 30분 | 스트릭 정확도 |
| 6 | 미사용 변수 제거 (L-6) | create/page.tsx | 1분 | 코드 품질 |
| 7 | expandWord 에러 토스트 (M-10) | cards/page.tsx | 10분 | 사용자 피드백 |
| 8 | AppShell Firebase 타임아웃 (H-8) | AppShell.tsx | 30분 | 앱 안정성 |

**기대 효과**: High 이슈 5건 해소, 음성 사이클 안정성 대폭 향상

---

### P1: 이번 달 (2월) - 총 25시간

| 순위 | 작업 | 공수 | 효과 |
|------|------|------|------|
| 1 | Talk 모드 전환 UX 개선 (3.1) | 6시간 | 롤플레이 발견성, 대화 보존 |
| 2 | 온보딩 플로우 (4.3) | 4시간 | 신규 사용자 전환율 |
| 3 | 음성 녹음 UX 개선 (3.5) | 4시간 | 녹음 피드백, 에러 메시지 |
| 4 | 음성 사이클 FSM 리팩토링 (2.1) | 4시간 | 음성 대화 안정성 |
| 5 | My 페이지 통계 대시보드 (3.3) | 4시간 | 학습 동기 부여 |
| 6 | 에러 처리 체계화 (2.4) | 3시간 | 전체 앱 안정성 |

**기대 효과**: 핵심 UX 마찰점 해소, 신규 사용자 온보딩, 음성 기능 안정화

---

### P2: 다음 분기 (3~4월) - 총 50시간

| 순위 | 작업 | 공수 | 효과 |
|------|------|------|------|
| 1 | 게이미피케이션 (XP/미션) (4.1) | 16시간 | 리텐션 향상 |
| 2 | 오프라인 모드 확장 (4.4) | 12시간 | PWA 가치 극대화 |
| 3 | Cards 학습 효과 강화 - SM-2 (3.2) | 8시간 | 학습 효과 체감 |
| 4 | 발음 평가 MVP (4.2) | 8시간 | 차별화 기능 |
| 5 | 접근성 WCAG AA (5.3) | 6시간 | 법적 컴플라이언스 |

**기대 효과**: Speak/Duolingo 수준의 게이미피케이션, 발음 평가로 차별화

---

### P3: 로드맵 (5월~) - 기획 단계

| 작업 | 설명 | 비고 |
|------|------|------|
| 구조화된 커리큘럼 | CEFR 기반 학습 경로 | 콘텐츠 기획 필요 |
| AI 튜터 개성화 | 친절/엄격/유머러스 튜터 선택 | 프롬프트 엔지니어링 |
| 소셜 기능 | 리더보드, 친구 챌린지 | 백엔드 인프라 필요 |
| i18n | 다국어 UI 지원 | react-intl 도입 |
| 푸시 알림 | 학습 리마인더 | FCM 연동 |
| 태블릿 레이아웃 | 2단 레이아웃 | 반응형 디자인 |

---

## 부록: 핵심 파일 변경 맵

### P0 수정 시 변경 파일 (8개)
```
src/contexts/TTSContext.tsx          - onEnd 이중 호출 방지
src/components/VoiceRecorder.tsx     - manualStop 체크
src/components/MessageBubble.tsx     - 타이머 cleanup
src/app/create/page.tsx              - 라우트 수정 + 미사용 변수
src/lib/dateUtils.ts                 - (신규) 시간대 안전 날짜
src/lib/learningHistory.ts           - dateUtils 사용
src/app/cards/page.tsx               - expandWord 에러 처리
src/components/AppShell.tsx          - Firebase 타임아웃
```

### P1 수정 시 추가 변경 파일 (10개+)
```
src/components/ModeSelector.tsx      - 3탭 구조
src/app/talk/page.tsx                - URL 상태 관리
src/components/ChatWindow.tsx        - FSM + 대화 보존 + 에러 토스트
src/contexts/TalkContext.tsx          - URL 동기화
src/components/Onboarding.tsx        - (신규) 온보딩
src/lib/apiClient.ts                 - (신규) API 클라이언트
src/components/Toast.tsx             - (신규) 토스트 알림
src/app/my/page.tsx                  - 통계 대시보드
src/components/ListeningIndicator.tsx - 오디오 레벨 시각화
src/infrastructure/api/baseApi.ts    - apiClient 사용
```
