# EnPeak Homepage 개선 계획서

**Date:** 2026-02-07
**Author:** Senior Product Planner
**Status:** Draft
**Priority:** Phase 1 > Phase 2 > Phase 3 (단계별 진행)

---

## 1. 현황 분석 요약

### 잘 된 점
- Next.js 14 Static Export 기반 빠른 로딩
- Tailwind CSS 기반 일관된 디자인 시스템 (hp-* 커스텀 컬러)
- IntersectionObserver 기반 스크롤 애니메이션
- 벤토 그리드 레이아웃으로 모던한 피처 소개
- prefers-reduced-motion 접근성 고려

### 개선 필요 사항 (우선순위 순)
| # | 항목 | 심각도 | 영향도 | 예상 공수 |
|---|------|--------|--------|-----------|
| 1 | 블로그 개별 글 404 오류 | High | 사용자 이탈 | 2-3h |
| 2 | SEO 메타데이터 미비 | High | 검색 노출 -40% | 2-3h |
| 3 | 분석/트래킹 부재 | High | 성과 측정 불가 | 4-6h |
| 4 | CTA 전략 불명확 | Medium | 전환율 -20~30% | 2-3h |
| 5 | 가짜 데이터 (후기/리더보드) | Medium | 신뢰도 하락 | 4-8h |
| 6 | 접근성(a11y) 부족 | Medium | 장애인 사용 불가 | 3-4h |
| 7 | 이메일 수집 없음 | Medium | 리드 유실 | 2-3h |
| 8 | 모바일 최적화 미흡 | Medium | 모바일 전환율 하락 | 4-6h |
| 9 | 다크모드 미지원 | Low | 사용자 경험 | 2-3h |
| 10 | 에러 바운더리 없음 | Low | 개발 경험 | 1h |

---

## 2. Phase 1: 긴급 수정 (1-2일)

> 목표: 사용자 이탈을 유발하는 치명적 버그 수정 + 기본적인 SEO 확보

### 2.1 블로그 라우트 수정

**문제:** `/blog/{id}` 클릭 시 404 발생
**파일:** `homepage/src/app/blog/[id]/page.tsx` (신규)

**수정 방향:**
```
옵션 A (권장): 정적 블로그 글 페이지 생성
- homepage-data.ts의 BLOG_POSTS에 content 필드 추가
- [id]/page.tsx에서 generateStaticParams로 정적 생성
- 마크다운 렌더링으로 글 내용 표시

옵션 B (간단): 블로그 링크 비활성화
- 블로그 글 클릭 시 "준비 중" 토스트 표시
- 추후 CMS 연동 시 활성화
```

**구현 단계 (옵션 A):**
1. `homepage-data.ts`에 `BLOG_POSTS`의 각 항목에 `content` 필드 추가
2. `homepage/src/app/blog/[id]/page.tsx` 생성
3. `generateStaticParams()`로 모든 블로그 ID에 대한 정적 페이지 생성
4. 블로그 글 레이아웃 (제목, 카테고리, 날짜, 본문) 구현
5. 뒤로가기 네비게이션 추가

### 2.2 SEO 메타데이터 보강

**문제:** OG 이미지 없음, 구조화된 데이터 없음, 키워드 미설정
**파일:** `homepage/src/app/layout.tsx`

**수정 내용:**
```
1. 메타 타이틀 최적화
   현재: "EnPeak - AI English Learning Community"
   변경: "EnPeak - AI로 배우는 실전 영어 회화 | 무료 시작"

2. 메타 설명 통일
   현재: 영어/한국어 혼합
   변경: "AI 튜터와 5,000+ 학습 리소스로 실전 영어 대화 연습. 롤플레이, 단어 학습, 실시간 피드백. 무료로 시작하세요."

3. OG 이미지 추가 (1200x630px)
   - 히어로 디자인 기반 OG 이미지 제작
   - public/og-image.png 배치

4. 구조화된 데이터 (JSON-LD)
   - SoftwareApplication 스키마
   - EducationalOrganization 스키마

5. 키워드 추가
   - "영어 학습", "AI 영어 튜터", "영어 회화", "무료 영어 앱"

6. robots, sitemap, canonical URL 설정
```

### 2.3 에러 바운더리 추가

**문제:** `app/error.tsx` 없어서 개발 모드 청크 에러 발생
**파일:** `homepage/src/app/error.tsx` (신규)

**수정:** 간단한 에러 UI 컴포넌트 + 재시도 버튼

---

## 3. Phase 2: 전환율 최적화 (3-5일)

> 목표: CTA 개선, 소셜 프루프 강화, 분석 도구 설치

### 3.1 CTA 전략 재설계

**현재 문제:**
- 히어로에 CTA 2개 (결정 피로 유발)
- 네비게이션 CTA가 "학습 시작하기"로 일반적
- 섹션별 CTA 불일치

**개선 방향:**

```
히어로:
  Primary CTA: "무료로 대화 시작" (단일)
  Secondary: "어떻게 학습하나요?" (앵커 스크롤)

네비게이션:
  CTA: "무료 시작" (짧고 명확)

FeaturesBento 각 카드:
  CTA: "체험하기 >" (호버 시 나타남)

DailyChallenge:
  CTA: "오늘의 표현 연습하기"

Footer 상단:
  Final CTA: "지금 무료로 시작하세요 - 가입 없이 바로 대화"
```

**리서치 근거:**
- EdTech 랜딩페이지 평균 전환율: 8.4% (업계 평균 6.6% 대비 27% 높음)
- 단일 CTA가 복수 CTA 대비 전환율 ~13% 높음
- 한국 사용자: "무료" 키워드가 전환에 가장 큰 영향

### 3.2 소셜 프루프 강화

**현재 문제:**
- 후기 5개 모두 제네릭 + 검증 불가
- 리더보드 하드코딩된 가짜 데이터
- 구체적 성과 수치 없음

**개선 방향:**

```
후기 섹션 개선:
1. 실제 사용자 후기 수집 (앱 내 피드백 연동)
2. 후기에 구체적 성과 추가:
   - "3개월 만에 TOEIC Speaking 150점 향상"
   - "해외 출장에서 처음으로 영어로 미팅 진행"
3. 아바타 -> 실제 프로필 사진 또는 더 상세한 프로필
4. 별점 시스템 추가 (5점 만점)
5. 사용 기간 표시 ("EnPeak 87일 학습")

리더보드 개선:
옵션 A: 실시간 데이터 연동 (백엔드 API)
옵션 B: "예시" 라벨 명시 후 실제 데이터 전환 예고
옵션 C: 섹션 임시 제거 후 실제 데이터 확보 시 복원
```

**리서치 근거:**
- 사진이 포함된 후기는 텍스트만 있는 후기 대비 리콜 +18.7%
- 5개 이상 리뷰 시 구매 가능성 4배 증가
- 소셜 프루프는 전환율을 최대 340% 향상 가능

### 3.3 분석/트래킹 도입

**현재 문제:** 트래킹 전무 -> 성과 측정 불가

**구현 계획:**

```
Phase 2-A: 기본 분석 (2h)
- Google Analytics 4 (GA4) 설치
- 기본 페이지뷰, 스크롤 깊이 추적
- CTA 클릭 이벤트 추적

Phase 2-B: 전환 추적 (2h)
- 주요 CTA 클릭 이벤트 정의
  - hero_cta_click
  - feature_card_click
  - nav_cta_click
  - footer_cta_click
- 스크롤 깊이별 이벤트 (25%, 50%, 75%, 100%)
- 이탈 지점 분석

Phase 2-C: 사용자 행동 분석 (2h)
- Microsoft Clarity 설치 (무료 세션 레코딩)
- 히트맵 분석
- 모바일 vs 데스크톱 행동 차이
```

**추적할 핵심 지표 (KPI):**
| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| 전환율 (CTA 클릭) | > 8% | GA4 이벤트 |
| 이탈률 | < 40% | GA4 |
| 평균 체류 시간 | > 90초 | GA4 |
| 스크롤 완료율 | > 30% | 커스텀 이벤트 |
| 모바일 전환율 | > 6% | GA4 세그먼트 |

### 3.4 "How It Works" 섹션 추가

**현재 문제:** 기능은 보여주지만 "어떻게 사용하는지" 없음

**추가할 섹션:**
```
[Step 1] 시나리오 선택
"카페, 호텔, 면접 등 실생활 상황을 골라요"
+ 시나리오 선택 UI 미리보기

[Step 2] AI와 대화
"실시간으로 AI 튜터와 영어 대화를 나눠요"
+ 대화 화면 미리보기

[Step 3] 즉각 피드백
"문법, 발음, 표현을 바로 교정받아요"
+ 피드백 UI 미리보기
```

**배치:** FeaturesBento와 CommunityHighlights 사이
**리서치 근거:** EdTech 랜딩페이지 분석 결과, "How it works" 3단계 섹션이 전환율 +15% 효과

---

## 4. Phase 3: 성장 최적화 (1-2주)

> 목표: 모바일 최적화, 콘텐츠 전략, 장기 성장 기반

### 4.1 모바일 최적화 강화

**수정 항목:**

```
1. 모바일 Sticky CTA
   - 하단에 고정된 CTA 바 추가
   - 스크롤 시 항상 보이는 "무료로 시작하기" 버튼
   - 스크롤 방향에 따라 show/hide

2. 터치 타겟 최적화
   - 모든 버튼/링크 최소 44x44px 확보
   - 풋터 링크 간 여백 확대

3. 테스티모니얼 캐러셀 개선
   - 점(dot) 인디케이터 추가
   - 좌우 화살표 버튼 추가
   - 터치 스와이프 개선

4. 앱 프리뷰 이미지
   - 히어로에 폰 목업 + 앱 스크린샷 추가
   - 모바일에서는 스크린샷만 표시 (목업 생략)
```

### 4.2 접근성(a11y) 개선

**수정 항목:**

```
1. Skip Link 추가
   - layout.tsx에 "메인 콘텐츠로 건너뛰기" 링크

2. ARIA 속성 보강
   - HomepageNav: aria-expanded (모바일 메뉴)
   - GradientBlob: aria-hidden="true"
   - AnimatedCounter: role="status", aria-live="polite"
   - TestimonialsCarousel: aria-label, role="region"

3. 포커스 스타일
   - focus-visible 링 스타일 추가
   - 키보드 내비게이션 테스트

4. 색상 대비 검증
   - WAVE/Axe DevTools로 WCAG AA 검증
   - 그라데이션 위 흰색 텍스트 대비 확인
```

### 4.3 이메일 수집/리드 캡처

**구현 계획:**

```
위치 1: Coming Soon 섹션 (Q&A 포럼, 스터디 그룹)
- "출시 알림 받기" 이메일 입력 폼
- Firebase에 저장

위치 2: 페이지 하단 (Final CTA 영역)
- "주간 영어 팁 받기" 뉴스레터 구독
- 이메일 입력 + 구독 버튼

위치 3: 블로그 페이지
- 글 하단에 뉴스레터 구독 CTA
```

### 4.4 한국 시장 특화 최적화

**리서치 기반 권장사항:**

```
1. 네이버 SEO 등록
   - 네이버 서치 어드바이저 등록
   - 네이버용 메타태그 추가 (naver-site-verification)
   - 한국어 키워드: "영어회화 앱", "AI 영어 학습", "무료 영어앱"

2. 카카오톡 공유 버튼
   - 푸터 또는 CTA 영역에 카카오 공유 추가
   - Kakao JavaScript SDK 연동
   - 공유 시 OG 이미지 + 메시지 커스텀

3. 경쟁사 대비 포지셔닝 강화
   - Speak ($14.99/월) 대비 "무료" 강조
   - "카드 등록 없이 바로 시작" 메시지
   - 가격 비교 테이블 (선택사항)

4. 한국어 타이포그래피 개선
   - Pretendard 또는 Spoqa Han Sans Neo 적용 검토
   - 본문 가독성 향상 (line-height, letter-spacing 조정)
```

### 4.5 인터랙티브 프리뷰 추가

**리서치 근거:** 2026 트렌드에서 "Interactive Product Preview"가 전환율에 가장 큰 영향

```
구현 방안:
1. 히어로에 간단한 AI 대화 데모 위젯
   - 3-4턴의 샘플 대화 자동 재생
   - "직접 해보기" 버튼 -> 앱으로 이동

2. DailyChallenge 섹션 인터랙션 개선
   - 블러 -> 클릭/탭 방식으로 변경 (모바일 호환)
   - "오늘의 표현 맞추기" 미니 퀴즈
```

---

## 5. 구현 일정 (권장)

```
Week 1 (Phase 1): 긴급 수정
├── Day 1: 블로그 [id] 라우트 + 에러 바운더리
├── Day 2: SEO 메타데이터 + OG 이미지
└── 검증: Lighthouse SEO 점수 90+ 확인

Week 2 (Phase 2-A): 전환율 기초
├── Day 3: CTA 전략 재설계 + 구현
├── Day 4: GA4 + Clarity 설치
├── Day 5: "How It Works" 섹션 추가
└── 검증: GA4 이벤트 트래킹 동작 확인

Week 3 (Phase 2-B): 소셜 프루프
├── Day 6-7: 후기 데이터 개선 + UI 업데이트
├── Day 8: 리더보드 처리 (라벨링 또는 API 연동)
└── 검증: A/B 테스트 기반 비교 (가능한 경우)

Week 4-5 (Phase 3): 성장
├── 모바일 최적화 (Sticky CTA, 캐러셀, 터치)
├── 접근성 개선 (ARIA, 포커스, 대비)
├── 이메일 캡처 구현
├── 네이버 SEO + 카카오 공유
└── 검증: Lighthouse 전체 점수 90+ / WAVE 접근성 통과
```

---

## 6. 성공 지표

| 지표 | 현재 (추정) | Phase 1 후 | Phase 2 후 | Phase 3 후 |
|------|------------|------------|------------|------------|
| Lighthouse SEO | ~60 | 90+ | 90+ | 95+ |
| Lighthouse Perf | ~80 | 85+ | 85+ | 90+ |
| Lighthouse a11y | ~70 | 75+ | 80+ | 90+ |
| CTA 전환율 | 측정 불가 | 측정 시작 | 8%+ | 10%+ |
| 이탈률 | 측정 불가 | 측정 시작 | <40% | <35% |
| 모바일 전환율 | 측정 불가 | 측정 시작 | 6%+ | 8%+ |

---

## 7. 참고 자료

### 경쟁사 분석
- **Speak**: 한국 550만 다운로드, $14.99/월, AI 음성 기반 롤플레이
- **Duolingo**: 게이미피케이션 + 캐릭터 브랜딩, 무료 모델
- **Lingoda**: 실시간 원어민 강사, 구독 모델

### EnPeak 차별점
- **완전 무료** (vs Speak $14.99/월)
- **PWA** (설치 없이 바로 사용)
- **RAG 기반** 5,375+ 학습 리소스
- **한국어 사용자 최적화**

### 리서치 출처
- Landingi: Landing Page Best Practices 2025
- Unbounce: Education Conversion Rate Benchmarks
- Prismic: Landing Page Optimization
- SaaSFrame: SaaS Landing Page Trends 2026
- HackerNoon: EdTech Landing Page Analysis (30+ pages)
- web.dev: PWA Install Patterns
- Next.js: SEO Rendering Strategies
