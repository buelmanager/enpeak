# Homepage Bug Report - 최근 수정사항 분석

**Date:** 2026-02-07 18:30
**Tester:** Senior Developer Review
**Focus:** 최근 5개 커밋 (457d90a ~ 9cee47e) 수정사항 집중 검증
**Branch:** main

---

## 분석 대상 커밋

| Commit | Message | 주요 변경 |
|--------|---------|-----------|
| `457d90a` | fix: homepage blog static params, env config, remove hardcoded blog data | 블로그 시스템 마크다운 전환, _placeholder 추가 |
| `894538d` | chore: rename BUG_REPORT.md | 버그 리포트 완료 표시 |
| `02de805` | chore: add remaining frontend features, homepage SEO, reports and docs | SEO, error/robots/sitemap, 문서 |
| `f410617` | chore: add workflow prompt templates | 프롬프트 템플릿 |
| `9cee47e` | feat: add homepage landing page | 홈페이지 전체 구현 (11개 컴포넌트) |

---

## 발견된 버그/이슈 요약

| # | 이슈 | 심각도 | 파일 | 상태 |
|---|------|--------|------|------|
| BUG-001 | marked() 반환 타입 안전성 | Critical | blog.ts:40 | Open |
| BUG-002 | _placeholder 더미 라우트 생성 | Critical | [slug]/page.tsx:13 | Open |
| BUG-003 | SITE_URL 기본값 불일치 (4개 파일) | Critical | layout, slug, robots, sitemap | Open |
| BUG-004 | dangerouslySetInnerHTML 보안 | High | [slug]/page.tsx:128 | Open |
| BUG-005 | 프론트매터 유효성 검증 없음 | High | blog.ts:38-51 | Open |
| BUG-006 | blog/page.tsx 서버 컴포넌트 전환 확인 | High | blog/page.tsx | Verified OK |
| BUG-007 | 읽기 시간 계산 부정확 | Medium | blog.ts:19-23 | Open |
| BUG-008 | 파일 시스템 오류 핸들링 부재 | Medium | blog.ts:28,37 | Open |
| BUG-009 | error.tsx error 파라미터 미사용 | Medium | error.tsx:3-7 | Open |
| BUG-010 | Next.js 14.2.35 버전 경고 | Low | package.json | Open |
| A11Y-001 | 모바일 메뉴 키보드 내비게이션 없음 | Medium | HomepageNav.tsx | Open |
| A11Y-002 | 캐러셀 키보드 접근 불가 | Medium | TestimonialsCarousel.tsx | Open |
| A11Y-003 | DailyChallenge 블러 키보드 미지원 | Medium | DailyChallengePreview.tsx | Open |
| A11Y-004 | 주요 섹션 aria-label 누락 | Medium | 다수 컴포넌트 | Open |

---

## Critical 버그 상세

### BUG-001: `marked()` 반환 타입 안전성 문제

**파일:** `homepage/src/lib/blog.ts` (line 40)

**현상:**
```typescript
const html = marked(content) as string
```

**분석:**
- `marked` v17.0.1의 타입 정의: `marked(src: string, options?: MarkedOptions | null): string | Promise<string>`
- `as string` 캐스팅으로 TypeScript 타입 체크를 우회
- 기본 사용(비동기 확장 없음)에서는 동기적으로 `string`을 반환하므로 현재는 동작함
- 그러나 향후 `marked`에 비동기 확장(walkTokens 등)을 추가하면 `Promise<string>`이 반환되어 `[object Promise]`가 렌더링됨

**수정 방안:**
```typescript
// marked.parse()는 동기 전용 API로 항상 string 반환
const html = marked.parse(content) as string
```

**영향도:** 현재 동작에는 문제 없으나, 타입 안전성과 향후 확장성에서 위험

---

### BUG-002: `_placeholder` 더미 라우트 생성

**파일:** `homepage/src/app/blog/[slug]/page.tsx` (line 9-14)

**현상:**
```typescript
export const dynamicParams = false

export function generateStaticParams() {
  const slugs = getAllSlugs()
  if (slugs.length === 0) return [{ slug: '_placeholder' }]
  return slugs.map((slug) => ({ slug }))
}
```

**분석:**
- `dynamicParams = false`는 미리 생성되지 않은 슬러그 접근 시 404를 반환
- 블로그 글이 없으면 `_placeholder` 슬러그로 정적 페이지가 생성됨
- `/blog/_placeholder/` 라우트가 실제 존재하지만 `getArticleBySlug('_placeholder')`가 `null`을 반환하여 `notFound()` 호출
- 검색엔진이 이 불필요한 라우트를 크롤링할 수 있음
- 빌드 시 `_placeholder.html` 정적 파일이 생성되어 배포 크기 증가

**수정 방안:**
```typescript
export function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}
```
- 빈 배열 반환 시 Next.js 14는 동적 라우트 페이지를 생성하지 않음
- `dynamicParams = false`와 함께 사용하면 모든 미등록 슬러그에 대해 404 반환

---

### BUG-003: SITE_URL 기본값 불일치

**관련 파일 및 현재 값:**

| 파일 | 변수 선언 | 기본값 |
|------|-----------|--------|
| `layout.tsx:4` | `process.env.NEXT_PUBLIC_SITE_URL \|\| ''` | `''` (빈 문자열) |
| `[slug]/page.tsx:7` | `process.env.NEXT_PUBLIC_SITE_URL \|\| ''` | `''` (빈 문자열) |
| `robots.ts:3` | `process.env.NEXT_PUBLIC_SITE_URL \|\| 'https://enpeak.example.com'` | `'https://enpeak.example.com'` |
| `sitemap.ts:4` | `process.env.NEXT_PUBLIC_SITE_URL \|\| 'https://enpeak.example.com'` | `'https://enpeak.example.com'` |

**영향:**
1. `.env` 미설정 시 `layout.tsx`의 `metadataBase`가 `undefined`
2. OG URL이 `/blog/slug` (상대 경로)로 생성되어 소셜 미디어 공유 시 깨짐
3. `robots.ts`와 `sitemap.ts`는 `enpeak.example.com`으로 기본 설정되어 실제 도메인과 불일치

**수정 방안:**
- 공통 상수 파일에서 SITE_URL 정의:
```typescript
// homepage/src/lib/constants.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://enpeak.example.com'
```
- 모든 파일에서 이 상수를 import하여 사용

---

## High 버그 상세

### BUG-004: `dangerouslySetInnerHTML` HTML 삽입 위험

**파일:** `homepage/src/app/blog/[slug]/page.tsx` (line 126-129)

**현상:**
```tsx
<div
  className="prose"
  dangerouslySetInnerHTML={{ __html: article.content }}
/>
```

**분석:**
- `marked()`가 마크다운 내 raw HTML을 그대로 출력
- 현재 블로그 글은 내부 작성 (`blog/release/*.md`)이므로 즉각적 위험은 낮음
- 향후 외부 기여자가 블로그 글을 작성하거나, CMS 연동 시 XSS 위험 발생

**수정 방안:**
- marked 설정에서 HTML 태그 이스케이프:
```typescript
marked.setOptions({ async: false })
// 또는 marked 설정에서 renderer 커스텀
```
- 또는 DOMPurify (서버사이드 호환 가능) 추가

---

### BUG-005: 프론트매터 유효성 검증 없음

**파일:** `homepage/src/lib/blog.ts` (line 38-51)

**현상:**
```typescript
const { data, content } = matter(raw)
return {
  slug,
  title: data.title || slug,
  date: data.date || '',
  tags: data.tags || [],     // data.tags가 string이면 배열이 아님
  description: data.description || '',
  featured: data.featured === true,
  // ...
}
```

**시나리오별 영향:**

| 프론트매터 이상 | 결과 |
|----------------|------|
| `tags: "single-string"` | 문자열이 그대로 전달, `.map()` 호출 시 에러 |
| `date: "invalid"` | `formatDate()`에서 "NaN년 NaN월 NaN일" 표시 |
| `title` 누락 | slug이 제목으로 표시 (의도적이지만 UX 불량) |
| YAML 문법 오류 | `gray-matter`가 에러를 throw, 빌드 실패 |

**수정 방안:**
- 수동 검증 함수 추가:
```typescript
function validateFrontmatter(data: Record<string, unknown>, slug: string) {
  const title = typeof data.title === 'string' ? data.title : slug
  const date = typeof data.date === 'string' ? data.date : ''
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : []
  // ...
}
```

---

### BUG-006: blog/page.tsx 서버 컴포넌트 전환 확인

**파일:** `homepage/src/app/blog/page.tsx`

**현상:**
- 린터에 의해 `'use client'` 디렉티브가 제거됨
- `getAllArticles()`는 `fs` 모듈을 사용하므로 서버 컴포넌트에서만 실행 가능

**검증 결과:** PASS
- `'use client'` 제거 후 서버 컴포넌트로 동작
- `getAllArticles()`가 빌드 타임에 실행되어 정적 HTML 생성
- `fs` 모듈은 서버 사이드에서만 사용 가능하므로 서버 컴포넌트가 올바른 선택
- 기존 `BLOG_POSTS` -> `getAllArticles()` 변경도 함께 이루어져 정상

---

## Medium 버그 상세

### BUG-007: 읽기 시간 계산 부정확

**파일:** `homepage/src/lib/blog.ts` (line 19-23)

**현상:**
```typescript
function calculateReadTime(text: string): string {
  const charCount = text.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.ceil(charCount / 500))
  return `${minutes}분`
}
```

**분석:**
- 공백을 제거한 문자 수를 500으로 나눔
- 마크다운 문법 문자 (`#`, `*`, `-`, `>`, `[`, `]` 등)가 카운트에 포함
- 한국어(500자/분)와 영어(200단어/분) 읽기 속도가 다름
- 매직 넘버 500이 상수로 정의되지 않음

**수정 방안:**
- 마크다운 문법 제거 후 계산
- 한국어 문자와 영어 단어를 분리 카운트
- 상수 정의: `CHARS_PER_MINUTE_KO = 500`, `WORDS_PER_MINUTE_EN = 200`

---

### BUG-008: 파일 시스템 오류 핸들링 부재

**파일:** `homepage/src/lib/blog.ts` (line 28, 37)

**현상:**
```typescript
// getAllSlugs - line 28
return fs.readdirSync(BLOG_DIR)...

// getArticleBySlug - line 37
const raw = fs.readFileSync(filePath, 'utf-8')
```

**분석:**
- `existsSync` 체크 후 읽기를 수행하지만, TOCTOU (Time of check to time of use) 레이스 조건 존재
- 파일 권한 문제, 디스크 오류 등에 대한 핸들링 없음
- 빌드 시 에러가 발생하면 스택 트레이스만 표시되어 디버깅 어려움

**수정 방안:**
- try-catch 래핑으로 빌드 실패 메시지 개선

---

### BUG-009: error.tsx error 파라미터 미사용

**파일:** `homepage/src/app/error.tsx` (line 3-7)

**현상:**
```typescript
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }  // 타입에 선언됨
  reset: () => void
}) {
```

**분석:**
- `error` 매개변수가 타입에는 정의되었지만, 구조분해에서 캡처되지 않음
- 에러 정보를 로깅하거나 사용자에게 표시할 수 없음
- Next.js 에러 바운더리 규약에 따라 `error` 파라미터를 받도록 설계됨

**수정 방안:**
```typescript
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // console.error(error) 등으로 로깅 가능
```

---

## 접근성(a11y) 이슈 상세

### A11Y-001: 모바일 메뉴 키보드 내비게이션

**파일:** `homepage/src/components/HomepageNav.tsx`

**이슈:**
- 햄버거 메뉴 토글 버튼에 `aria-expanded` 속성 없음
- 메뉴 열린 상태에서 Escape 키로 닫을 수 없음
- 메뉴 컨테이너에 `role="dialog"` 또는 `role="menu"` 없음
- 포커스 트래핑 미구현 (메뉴 밖으로 탭 이동 가능)

**수정 방안:**
- 버튼에 `aria-expanded={isMenuOpen}` 추가
- `useEffect`에서 Escape 키 이벤트 리스너 추가
- 메뉴에 `role="dialog" aria-modal="true"` 추가

---

### A11Y-002: 테스티모니얼 캐러셀 키보드 접근

**파일:** `homepage/src/components/TestimonialsCarousel.tsx`

**이슈:**
- 수평 스크롤 캐러셀이 키보드로 접근 불가
- `overflow-x-auto` 영역에 `tabindex`, `role` 없음
- 화살표 키 네비게이션 미구현
- 스크린 리더에서 캐러셀 구조 인식 불가

**수정 방안:**
- 스크롤 컨테이너에 `role="region" aria-label="학습자 후기"` 추가
- `tabindex="0"` 추가하여 포커스 가능하게
- 좌/우 화살표 버튼 UI 추가

---

### A11Y-003: DailyChallenge 블러 효과

**파일:** `homepage/src/components/DailyChallengePreview.tsx`

**이슈:**
- 뜻 텍스트에 `blur-[2px] hover:blur-none` 적용
- 마우스 호버 전용 인터랙션 (키보드/터치 미지원)
- "마우스를 올려 뜻을 확인하세요" - 마우스 전제 안내 텍스트

**수정 방안:**
- `focus:blur-none` 추가하여 키보드 접근 지원
- `tabindex="0"` 추가
- 안내 텍스트: "마우스를 올리거나 탭하여 뜻을 확인하세요"

---

### A11Y-004: 주요 섹션 aria-label 누락

**관련 파일:**

| 컴포넌트 | 현재 | 권장 |
|----------|------|------|
| FeaturesBento | `<section id="features">` | `aria-label="주요 기능"` 추가 |
| CommunityHighlights | `<section id="community">` | `aria-label="커뮤니티"` 추가 |
| LeaderboardTeaser | `<section>` (id 없음) | `aria-label="주간 학습 순위"` 추가 |
| TestimonialsCarousel | `<section>` (id 없음) | `aria-label="학습자 후기"` 추가 |
| DailyChallengePreview | `<section id="challenge">` | `aria-label="오늘의 챌린지"` 추가 |

---

## 데스크톱 브라우저 테스트 결과 (이전 세션)

### 정상 동작 확인

| 항목 | 결과 |
|------|------|
| localhost:3001 로드 | PASS |
| 스크롤 애니메이션 (전 섹션) | PASS |
| 네비게이션 앵커 링크 (#features, #community, #challenge) | PASS |
| CTA 버튼 -> localhost:3000/talk 이동 | PASS |
| 블로그 목록 페이지 (/blog) | PASS |
| 블로그 글 상세 (/blog/test-post/) | PASS (test-post.md 추가 후) |
| 통계 카운터 애니메이션 | PASS |
| 테스티모니얼 캐러셀 | PASS |
| 리더보드 표시 | PASS |
| 푸터 링크 | PASS |

### 콘솔 에러

- React DevTools 안내 메시지 (INFO, 무시 가능)
- HMR 시 `app/error.js` 청크 로드 실패 1건 (error.tsx 추가로 해결됨)
- Next.js 14.2.35 버전 경고 배너

---

## 권장 수정 우선순위

```
즉시 수정 (Critical):
1. BUG-001: marked() -> marked.parse()
2. BUG-002: _placeholder 제거
3. BUG-003: SITE_URL 기본값 통일

빠른 수정 (High):
4. BUG-005: 프론트매터 검증 추가
5. BUG-009: error.tsx error 파라미터

안정성 개선 (Medium):
6. BUG-007: 읽기 시간 계산 개선
7. BUG-008: try-catch 추가
8. A11Y-001~004: 접근성 개선

모니터링 (Low):
9. BUG-010: Next.js 업데이트 검토
```
