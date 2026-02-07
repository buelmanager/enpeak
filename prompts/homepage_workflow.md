# EnPeak Homepage Workflow

## Overview

EnPeak 영어 학습 커뮤니티 홈페이지 구현을 위한 워크플로우 프롬프트.
각 Phase는 독립적인 커맨드로 실행 가능하며, 순서대로 진행한다.

---

## Phase 구성

### Phase 0: Research (`/homepage-research`)
- 영어 학습 커뮤니티 플랫폼 분석 (HelloTalk, italki, Duolingo 등)
- 2025-2026 웹 디자인 트렌드 조사
- `homepage/references.md`에 레퍼런스 URL 정리

### Phase 1: Design System (`/homepage-design`)
- `homepage/tailwind.config.js` 확장 (색상, 폰트, 키프레임)
- 공용 컴포넌트 3개 생성 (AnimatedCounter, BentoCard, GradientBlob)
- 커스텀 훅 생성 (useScrollAnimation, useMediaQuery)
- 정적 데이터 파일 생성 (homepage-data.ts)

### Phase 2: Hero + Navigation (`/homepage-hero`)
- `HomepageNav.tsx` - 고정 네비, 스크롤 배경 전환, 모바일 메뉴
- `HeroSection.tsx` - 헤드라인, CTA, 카운터, 블롭 장식
- Playfair Display 폰트 로딩

### Phase 3: Features Bento Grid (`/homepage-features`)
- `FeaturesBento.tsx` - 반응형 벤토 그리드 (4열/2열/1열)
- `BentoCard.tsx` 완성 - 크기 변형, 호버, 링크
- Phase 2와 병렬 가능

### Phase 4: Community Sections (`/homepage-community`)
- `CommunityHighlights.tsx` - Q&A, 스터디 그룹, 커뮤니티 시나리오
- `DailyChallengePreview.tsx` - 오늘의 챌린지
- `LeaderboardTeaser.tsx` - 리더보드 미리보기
- `TestimonialsCarousel.tsx` - 추천평 캐러셀
- `HomepageFooter.tsx` - 풋터
- Phase 2, 3과 병렬 가능

### Phase 5: Polish (`/homepage-polish`)
- 스크롤 트리거 애니메이션 전체 적용
- 반응형 검증 (375px, 390px, 768px, 1024px, 1280px)
- 접근성 패스 (alt, aria-label, 색상 대비, 키보드)
- reduced-motion 미디어 쿼리
- `tsc --noEmit && npm run build` 빌드 검증

### Phase 6: Report (`/homepage-report`)
- `report/homepage-evaluation.md` 시니어 기획자 관점 평가 보고서

---

## 병렬 실행 가능 구조

```
Phase 0 (Research)
    |
Phase 1 (Design System)
    |
    +--- Phase 2 (Hero + Nav)
    |
    +--- Phase 3 (Features Bento)  -- 병렬
    |
    +--- Phase 4 (Community)       -- 병렬
    |
Phase 5 (Polish)
    |
Phase 6 (Report)
```

---

## 프로젝트 구조

모든 작업은 `homepage/` 폴더 내에서 수행.
`frontend/`에는 변경사항 없음.

```
enpeak/
├── homepage/                  # 독립 Next.js 프로젝트
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.local             # NEXT_PUBLIC_APP_URL
│   ├── references.md          # 디자인 레퍼런스
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # 메인 홈페이지
│   │   ├── components/        # 11개 컴포넌트
│   │   ├── hooks/             # useScrollAnimation, useMediaQuery
│   │   ├── lib/
│   │   │   └── homepage-data.ts
│   │   └── styles/
│   │       └── globals.css
│   └── public/
├── prompts/
│   └── workflow.md            # 이 문서
├── report/
│   └── homepage-evaluation.md
└── .claude/commands/          # 7개 커맨드
```

---

## 디자인 원칙

1. **EN/KO 병행**: 모든 섹션에 영어 + 한국어 텍스트
2. **Coming Soon 뱃지**: 미구현 기능(Q&A, 스터디 그룹)은 UI + 뱃지
3. **메인 앱 링크**: `NEXT_PUBLIC_APP_URL` 환경변수로 메인 앱 연결
4. **접근성**: reduced-motion, semantic HTML, aria-label
5. **반응형**: Mobile-first, 4단계 브레이크포인트

---

## 로컬 실행

```bash
cd homepage
npm install
npm run dev          # localhost:3001 (또는 사용 가능한 포트)
```

## 빌드 검증

```bash
cd homepage
npx tsc --noEmit
npm run build
```
