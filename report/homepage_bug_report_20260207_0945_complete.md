# Homepage Bug Report

**Date:** 2026-02-07 09:45
**Tester:** Senior Developer Review
**Test URL:** http://localhost:3001
**Main App URL:** http://localhost:3000
**Branch:** main

---

## Test Summary

| Category | Status | Details |
|----------|--------|---------|
| Page Load | PASS | 정상 로드, 200 응답 |
| Desktop Scroll Animation | PASS | 모든 섹션 fade-in-up 정상 |
| Mobile Responsive | PARTIAL | 도구 한계로 완전 검증 불가 |
| Anchor Links | PASS | #features, #community, #challenge 정상 |
| CTA Links | PASS | localhost:3000/talk 정상 이동 |
| Blog Route | FAIL | 개별 글 페이지 404 |
| Console Errors | WARN | 청크 로드 에러 1건 |

---

## BUG-001: 블로그 개별 글 라우트 미구현 (Critical)

**Severity:** High
**Component:** `homepage/src/app/blog/page.tsx`

### 현상
- `/blog` 목록 페이지는 존재
- 블로그 글 클릭 시 `/blog/{id}` 라우트로 이동하나 해당 페이지가 없어 **404 에러** 발생

### 원인
- `homepage/src/app/blog/[id]/page.tsx` 동적 라우트 파일이 미구현
- `BLOG_POSTS` 데이터에 `id` 필드가 있고, 각 카드가 `/blog/${post.id}`로 링크되어 있음

### 관련 코드
```tsx
// homepage/src/app/blog/page.tsx:44,72
<a href={`/blog/${featured.id}`} ...>   // line 44
<a href={`/blog/${post.id}`} ...>       // line 72
```

### 수정 방안
1. `homepage/src/app/blog/[id]/page.tsx` 동적 라우트 생성
2. 또는 블로그 글이 없는 상태이므로 링크를 `#`이나 알림으로 대체

---

## BUG-002: 개발 모드 청크 로드 에러 (Low)

**Severity:** Low
**Component:** Next.js HMR / Webpack

### 현상
```
Failed to fetch RSC payload for http://localhost:3001/.
Falling back to browser navigation.
ChunkLoadError: Loading chunk app/error failed.
(error: http://localhost:3001/_next/static/chunks/app/error.js)
```

### 원인
- `app/error.tsx` 파일이 없어서 Next.js가 에러 바운더리 청크를 찾지 못함
- HMR 리빌드 시에만 발생 (Fast Refresh 트리거 후)

### 수정 방안
- `homepage/src/app/error.tsx` 에러 바운더리 컴포넌트 추가 (선택사항)
- 프로덕션 빌드에서는 문제 없을 수 있으나, 개발 경험 개선을 위해 추가 권장

---

## BUG-003: Next.js 버전 경고 (Info)

**Severity:** Info
**Component:** Next.js

### 현상
- 브라우저 콘솔에 "Next.js (14.2.35) is outdated" 경고 배너 표시

### 수정 방안
- 메이저 업데이트가 필요한 것은 아니나, 보안 패치를 위해 최신 14.x로 업데이트 권장

---

## Test Detail: Desktop (1512x776)

### HomepageNav (Sticky Navigation)
- **Status:** PASS
- 스크롤 시 상단 고정 정상 동작
- 메뉴 항목: 기능 소개, 커뮤니티, 챌린지, 블로그, 학습 시작하기
- 앵커 링크 스크롤 동작 정상

### HeroSection
- **Status:** PASS
- 히어로 텍스트, 그라데이션 정상 렌더링
- CTA 버튼 2개 (무료로 시작하기, 기능 살펴보기) 정상
- 통계 카운터 (5,375+ / 14개 / 2,648+) 정상 표시
- 스크롤 힌트 화살표 애니메이션 동작

### FeaturesBento
- **Status:** PASS
- 5개 카드 벤토 그리드 정상 배치 (2+1+1+2+full)
- 스크롤 시 fade-in-up 애니메이션 순차 등장
- 카드별 그라데이션 색상 정상

### CommunityHighlights
- **Status:** PASS
- 3개 카드 (Q&A 포럼, 스터디 그룹, 커뮤니티 시나리오)
- "Coming Soon" 태그 정상 표시 (Q&A, 스터디 그룹)
- 스크롤 애니메이션 정상

### DailyChallengePreview
- **Status:** PASS
- "오늘의 챌린지" 배지 정상
- "Break the ice" 표현 카드 정상
- 마우스 호버 시 뜻 확인 안내 텍스트 표시

### LeaderboardTeaser
- **Status:** PASS
- Top 5 학습자 리스트 정상 표시
- 순위, 아바타, 이름, 스트릭, 단어 수 모두 정상
- "커뮤니티 참여하기" 버튼 존재

### TestimonialsCarousel
- **Status:** PASS
- 수평 스크롤 캐러셀 4개 이상 후기 카드 표시
- 사용자 이름, 레벨, 후기 텍스트 정상

### HomepageFooter
- **Status:** PASS
- 4개 컬럼 (EnPeak, 서비스, 커뮤니티, 지원)
- 모든 링크 localhost:3000 라우트로 정상 연결
- "Soon" 태그 (Q&A 포럼, 스터디 그룹) 정상
- 저작권 텍스트 "2026 EnPeak" 정상

---

## Test Detail: Link Navigation

### Internal Anchor Links
| Link | Target | Result |
|------|--------|--------|
| 기능 소개 | #features | PASS - 스크롤 이동 |
| 커뮤니티 | #community | PASS - 스크롤 이동 |
| 챌린지 | #challenge | PASS - 스크롤 이동 |
| 기능 살펴보기 | #features | PASS - 스크롤 이동 |

### External Links (to Main App)
| Link | Target | Result |
|------|--------|--------|
| 무료로 시작하기 | /talk | PASS |
| 학습 시작하기 | /talk | PASS |
| AI 자유 대화 카드 | /talk | PASS (href 확인) |
| 단어 카드 | /cards | PASS (href 확인) |
| 오늘의 표현 | /talk?mode=expression | PASS (href 확인) |
| 롤플레이 시나리오 | /talk?mode=roleplay | PASS (href 확인) |
| 실시간 문법 피드백 | /talk | PASS (href 확인) |
| 커뮤니티 시나리오 | /create | PASS (href 확인) |
| 연습 시작하기 | /talk?mode=expression | PASS (href 확인) |
| 커뮤니티 참여하기 | /talk | PASS (href 확인) |

### Blog Links
| Link | Target | Result |
|------|--------|--------|
| 블로그 (nav) | /blog | PASS - 목록 표시 |
| 블로그 글 클릭 | /blog/{id} | FAIL - 404 |

---

## Test Detail: Mobile Responsive

**Note:** Chrome MCP resize 도구가 실제 뷰포트를 변경하지 못해 (innerWidth 1512px 유지) 완전한 모바일 테스트는 수행하지 못함. 아래는 코드 분석 기반 확인.

### 코드 기반 확인
- 햄버거 메뉴: `md:hidden` 클래스로 768px 미만에서만 표시
- 그리드 전환: `grid-cols-1 md:grid-cols-4` 으로 모바일 1열 전환
- CTA 버튼: `flex-col sm:flex-row` 으로 모바일 세로 배치
- 텍스트 크기: `text-5xl sm:text-6xl lg:text-7xl` 반응형 적용

### 수동 테스트 권장사항
- [ ] iPhone SE (375px) 에서 실제 테스트
- [ ] iPad (768px) 에서 실제 테스트
- [ ] Android (360px) 에서 실제 테스트
