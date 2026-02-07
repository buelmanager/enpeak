# EnPeak 홈 화면 리디자인

## 개요

기존 홈 화면의 단조로운 구성을 5가지 새로운 인터랙티브 섹션으로 개선했습니다.
사용자가 앱을 열자마자 다양한 학습 경로로 진입할 수 있도록 설계했습니다.

---

## 변경 전 vs 변경 후

### 변경 전 레이아웃
```
1. Header (인사말 + 아바타)
2. 스트릭 배지
3. "대화를 시작해보세요" (단순 텍스트 CTA)
4. Vocabulary 미리보기 (A1 단어 5개)
5. Today's Expression
6. This Week 활동 그리드
```

### 변경 후 레이아웃
```
1. Header (인사말 + 아바타)
2. 스트릭 배지
3. Quick Mode Cards (자유대화 / 표현연습 / 롤플레이)   -- NEW
4. Daily Challenge (오늘의 도전 + 진행률)               -- NEW
5. Recent Activity (최근 학습 이어하기)                  -- NEW
6. Quick Quiz (인터랙티브 단어 퀴즈)                    -- NEW
7. Today's Expression
8. Recommended Scenarios (추천 시나리오 6개)             -- NEW
9. Vocabulary 미리보기
10. This Week 활동 그리드
```

---

## 새로운 섹션 상세

### 1. Quick Mode Cards (빠른 모드 선택)

**목적**: 기존 밋밋한 텍스트 CTA를 3개의 비주얼 카드로 교체하여 사용자가 원하는 학습 모드에 즉시 접근

**구성**:
| 카드 | 링크 | 아이콘 |
|------|------|--------|
| 자유 대화 (Free Chat) | `/talk` | 채팅 버블 |
| 표현 연습 (Expressions) | `/talk?mode=expression` | 전구 |
| 롤플레이 (Roleplay) | `/talk?mode=roleplay` | 사용자 그룹 |

**디자인**: 3열 그리드, 각 카드에 `#1a1a1a` 아이콘 배경 + 한/영 라벨

---

### 2. Daily Challenge Card (오늘의 도전)

**목적**: 일일 학습 목표를 시각화하여 동기 부여

**구성**:
- 전체 진행률 퍼센트 + 프로그레스 바
- 대화 연습 목표: 3회
- 단어 학습 목표: 10개
- 각 목표별 현재/목표 수치 + 개별 프로그레스 바

**디자인**: `#1a1a1a` 어두운 배경, 흰색 텍스트, `learningHistory` 데이터 연동

**데이터 소스**: `getStats()` (localStorage의 `enpeak_learning_stats`)

---

### 3. Recent Activity (최근 학습 이어하기)

**목적**: 오늘 학습한 기록이 있으면 빠르게 이어서 할 수 있도록 유도

**구성**:
- 학습 유형 표시 (회화 연습 / 단어 학습 / 자유 대화)
- 시간 표시 (방금 전 / N분 전 / N시간 전)
- "이어하기" 버튼

**디자인**: 시계 아이콘 + 학습 정보 + 둥근 이어하기 배지

**조건**: `getTodayRecords()` 결과가 있을 때만 표시

---

### 4. Quick Quiz Widget (퀵 퀴즈)

**목적**: 홈 화면에서 바로 풀 수 있는 단어 퀴즈로 학습 참여 유도

**구성**:
- 영어 단어를 크게 표시
- 3개 선택지 (한국어 뜻)
- 정답: 초록 배경 (`#e8f5e9`)
- 오답: 빨강 배경 (`#fce4ec`)
- 미선택: 회색 처리
- "다음 문제" 버튼 (정답 확인 후)
- 누적 정답 수 표시

**단어 풀**:
- 기본 15개 단어 (A2~C1 레벨)
- API로 가져온 단어 추가 병합
- Fisher-Yates 셔플로 옵션 랜덤화

---

### 5. Recommended Scenarios (추천 시나리오)

**목적**: 다양한 롤플레이 시나리오를 홈에서 바로 발견하고 시작

**구성**:
| 시나리오 | 난이도 | 카테고리 | 예상 시간 |
|----------|--------|----------|-----------|
| 카페 주문 | 초급 | 일상 | 3-5 min |
| 호텔 체크인 | 초급 | 여행 | 5-7 min |
| 영어 면접 | 고급 | 비즈니스 | 10-15 min |
| 병원 방문 | 중급 | 일상 | 5-7 min |
| 레스토랑 주문 | 중급 | 일상 | 5-7 min |
| 공항 체크인 | 중급 | 여행 | 5-7 min |

**디자인**: 가로 스크롤, 카테고리 아이콘 + 난이도 색상 배지 + 예상 시간

**난이도 색상**:
- 초급: `bg-[#e8f5e9] text-[#2e7d32]`
- 중급: `bg-[#fff3e0] text-[#e65100]`
- 고급: `bg-[#fce4ec] text-[#c62828]`

---

## 기술 구현 사항

### 사용된 라이브러리/API
- `learningHistory.ts` - `getStats()`, `getWeeklyActivity()`, `getTodayRecords()`
- `AuthContext` - 사용자 인증 상태
- `/api/vocabulary/level/A1` - 단어 데이터
- `/api/rag/daily-expression` - 오늘의 표현

### 새로운 인터페이스
```typescript
interface QuizQuestion {
  word: string
  correctMeaning: string
  options: string[]
  correctIndex: number
}

interface DailyChallenge {
  date: string
  goals: { label: string; target: number; current: number; type: string }[]
}

interface ScenarioRecommendation {
  id: string
  title: string
  titleKo: string
  difficulty: string
  category: string
  icon: string
  estimatedTime: string
}
```

### 변경 파일
- `frontend/src/app/page.tsx` - 홈 페이지 전면 개편 (+438 lines, -34 lines)

---

## 향후 개선 아이디어

1. **퀴즈 난이도 적응**: 사용자 레벨에 맞춰 퀴즈 단어 레벨 자동 조절
2. **시나리오 개인화**: 학습 기록 기반 시나리오 추천 알고리즘
3. **Daily Challenge 커스터마이즈**: 사용자가 직접 목표 수치 설정
4. **학습 리마인더**: 미완료 챌린지에 대한 푸시 알림 연동
5. **퀴즈 모드 확장**: 뜻 맞추기 외에 철자 맞추기, 듣기 퀴즈 추가
