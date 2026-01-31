# Project Context

이 파일은 EnPeak 프로젝트에서 Claude가 참조하는 프로젝트 전용 가이드라인이다.

**별칭**: 프로젝트 컨텍스트, project_context, 프로젝트 컨텍스트 파일

---

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트 이름 | EnPeak |
| 설명 | AI 기반 영어 학습 PWA 웹앱 |
| 기술 스택 | Next.js 14, TypeScript, Tailwind CSS, FastAPI, Firebase |
| 생성일 | 2026-01-31 |
| 버전 | 1.0.1 |

---

## 폴더 구조

### Clean Architecture 구조 (2026-01-31 적용)

```
frontend/src/
├── app/                      # Next.js App Router (프레임워크)
│   ├── page.tsx              # 홈 대시보드
│   ├── chat/                 # 자유 회화
│   ├── vocabulary/           # 단어 연습
│   ├── conversations/        # 상황별 회화
│   └── expressions/          # 오늘의 표현
│
├── domain/                   # 핵심 비즈니스 로직
│   ├── entities/             # 엔티티 정의
│   │   ├── Message.ts        # 채팅 메시지
│   │   ├── Vocabulary.ts     # 단어 및 관련 콘텐츠
│   │   ├── LearningRecord.ts # 학습 기록, 통계
│   │   └── User.ts           # 사용자 정보
│   └── repositories/         # 레포지토리 인터페이스
│       ├── IChatRepository.ts
│       ├── IVocabularyRepository.ts
│       └── ILearningHistoryRepository.ts
│
├── application/              # 유스케이스
│   └── useCases/
│       ├── chat/
│       │   └── SendMessageUseCase.ts
│       ├── vocabulary/
│       │   ├── FetchWordsUseCase.ts
│       │   ├── CheckAnswerUseCase.ts
│       │   └── ExpandWordUseCase.ts
│       └── learning/
│           └── AddLearningRecordUseCase.ts
│
├── infrastructure/           # 외부 시스템 연동
│   ├── api/                  # API 클라이언트
│   │   ├── baseApi.ts        # 기본 HTTP 클라이언트
│   │   ├── chatApi.ts        # 채팅 API
│   │   └── vocabularyApi.ts  # 단어 API
│   ├── repositories/         # 레포지토리 구현체
│   │   ├── ChatRepository.ts
│   │   ├── VocabularyRepository.ts
│   │   └── LearningHistoryRepository.ts
│   └── firebase/             # Firebase 관련 (예정)
│
├── presentation/             # UI 계층
│   ├── components/           # UI 컴포넌트 (예정)
│   └── hooks/                # 프레젠테이션 훅
│       ├── useChat.ts        # 채팅 상태 관리
│       ├── useVocabulary.ts  # 단어 학습 상태 관리
│       └── useLearningStats.ts # 학습 통계 훅
│
├── shared/                   # 공유 유틸리티
│   ├── types/
│   │   └── Result.ts         # Result<T, E> 타입
│   └── constants/
│       ├── api.ts            # API 상수
│       └── levels.ts         # 레벨 상수 (A1-C2)
│
└── config/                   # 설정
    └── container.ts          # DI Container
```

---

## 이 프로젝트의 규칙

### 코딩 컨벤션
- 이모티콘 사용 금지 (코드, 주석, UI 텍스트 모두)
- TypeScript 필수, strict 모드 사용
- Result 타입으로 에러 처리 (`ok`, `err` 패턴)

### 네이밍 규칙
- 엔티티: PascalCase (Message, Vocabulary)
- 레포지토리 인터페이스: I 접두사 (IChatRepository)
- 유스케이스: ~UseCase 접미사 (SendMessageUseCase)
- 훅: use 접두사 (useChat, useVocabulary)

### Path Alias
```json
{
  "@/*": ["./src/*"],
  "@domain/*": ["./src/domain/*"],
  "@application/*": ["./src/application/*"],
  "@infrastructure/*": ["./src/infrastructure/*"],
  "@presentation/*": ["./src/presentation/*"],
  "@shared/*": ["./src/shared/*"],
  "@config/*": ["./src/config/*"]
}
```

---

## 버그 수정 기록

### 2026-01-31: PWA 및 로그인 버그 수정

#### 버그 1: PWA 버전 롤백 현상
**증상**: 업데이트 후에도 이전 버전이 표시됨

**원인**:
- `version.json`이 `1.0.0`이었으나 `lib/version.ts`는 `1.0.1`
- 서비스 워커가 캐시된 오래된 버전을 반환

**수정**:
- `public/version.json` 버전을 `1.0.1`로 동기화

#### 버그 2: 업데이트 팝업 지속 현상
**증상**: 업데이트 버튼을 눌러도 팝업이 사라지지 않음

**원인**:
- 서비스 워커 등록 해제 없이 캐시만 삭제
- `version.json`이 계속 캐시되어 버전 불일치 지속

**수정 (`components/VersionCheck.tsx`)**:
```typescript
const handleUpdate = async () => {
  // 1. 서비스 워커 등록 해제
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
  }
  // 2. 모든 캐시 삭제
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
  }
  // 3. 강제 새로고침
  window.location.reload()
}
```

**수정 (`public/sw.js`)**:
```javascript
// version.json은 항상 네트워크에서 가져옴
if (event.request.url.includes('version.json')) {
  event.respondWith(fetch(event.request));
  return;
}

// skipWaiting 메시지 리스너
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
```

**수정 (`components/ServiceWorkerRegister.tsx`)**:
```typescript
// 업데이트 감지 및 자동 적용
registration.addEventListener('updatefound', () => {
  const newWorker = registration.installing
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        newWorker.postMessage('skipWaiting')
      }
    })
  }
})

// 컨트롤러 변경 시 자동 새로고침
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true
    window.location.reload()
  }
})
```

#### 버그 3: 로그인 상태 유지 안됨
**증상**: 로그인해도 계속 로그아웃됨

**원인**:
- Firebase Auth가 `indexedDBLocalPersistence` 사용
- 서비스 워커 업데이트 시 IndexedDB가 영향받을 수 있음

**수정 (`lib/firebase.ts`)**:
```typescript
// browserLocalPersistence로 변경 (더 안정적)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Auth persistence set to localStorage'))
    .catch(console.error)
}
```

---

## 품질 개선 & 리팩토링 계획

### 현재 기술 부채 (Tech Debt)

| 위치 | 문제점 | 우선순위 | 상태 |
|------|--------|----------|------|
| components/ChatWindow.tsx | 로직과 UI 혼재 | MEDIUM | 진행중 |
| app/vocabulary/page.tsx | 비즈니스 로직이 컴포넌트에 있음 | MEDIUM | 진행중 |
| contexts/ | presentation/contexts/로 이동 필요 | LOW | 미해결 |

### 적용할 패턴

| 패턴 | 적용 대상 | 이유 | 상태 |
|------|----------|------|------|
| Clean Architecture | 전체 프론트엔드 | 관심사 분리, 테스트 용이성 | 진행중 |
| Repository Pattern | 데이터 접근 | 외부 시스템 추상화 | 완료 |
| Use Case Pattern | 비즈니스 로직 | 로직 재사용, 단일 책임 | 완료 |
| Result Type | 에러 처리 | 명시적 에러 핸들링 | 완료 |

### 리팩토링 로그

| 날짜 | 작업 | 영향 범위 | 결과 |
|------|------|----------|------|
| 2026-01-31 | Clean Architecture 구조 생성 | 전체 프론트엔드 | 디렉토리 및 기반 파일 생성 완료 |
| 2026-01-31 | Domain 계층 정의 | domain/ | 엔티티, 레포지토리 인터페이스 생성 |
| 2026-01-31 | Infrastructure 계층 구현 | infrastructure/ | API 클라이언트, 레포지토리 구현체 생성 |
| 2026-01-31 | Application 계층 구현 | application/ | 유스케이스 생성 |
| 2026-01-31 | Presentation 훅 생성 | presentation/hooks/ | useChat, useVocabulary, useLearningStats |
| 2026-01-31 | PWA 버그 수정 | public/, components/ | 버전 동기화, SW 업데이트 로직 개선 |
| 2026-01-31 | 로그인 버그 수정 | lib/firebase.ts | persistence를 localStorage로 변경 |

---

## 마이그레이션 상태

### Clean Architecture 마이그레이션

| 단계 | 상태 | 설명 |
|------|------|------|
| 1. 디렉토리 구조 생성 | 완료 | domain, application, infrastructure, presentation |
| 2. 공통 타입 정의 | 완료 | Result.ts, levels.ts, api.ts |
| 3. Domain 계층 | 완료 | 엔티티, 레포지토리 인터페이스 |
| 4. Infrastructure 계층 | 완료 | API 클라이언트, 레포지토리 구현체 |
| 5. Application 계층 | 완료 | 유스케이스 |
| 6. Presentation 훅 | 완료 | useChat, useVocabulary, useLearningStats |
| 7. 기존 컴포넌트 마이그레이션 | 미완료 | ChatWindow, vocabulary/page 등 |
| 8. Context 이동 | 미완료 | contexts/ -> presentation/contexts/ |

### 다음 작업

1. **기존 컴포넌트 마이그레이션**
   - `components/ChatWindow.tsx` -> 새 훅 사용
   - `app/vocabulary/page.tsx` -> useVocabulary 훅 사용
   - `app/chat/page.tsx` -> useChat 훅 사용

2. **Context 이동**
   - `contexts/AuthContext.tsx` -> `presentation/contexts/`
   - `contexts/TTSContext.tsx` -> `presentation/contexts/`

3. **UI 컴포넌트 분리**
   - `presentation/components/chat/` 생성
   - `presentation/components/vocabulary/` 생성

---

## 행동별 룰 참조

| 행동 | 룰 파일 | 설명 |
|------|---------|------|
| Clean Architecture 마이그레이션 | `/Users/chulheewon/development/claude/docs/rules/clean_architecture_migration.md` | 클린 아키텍처 마이그레이션 가이드 |

---

## 참고

- **공통 룰**: `/Users/chulheewon/development/claude/docs/root_context.md`
- **CLAUDE.md**: `/Users/chulheewon/development/proj/enpeak/CLAUDE.md`
- **마이그레이션 계획**: `/Users/chulheewon/.claude/plans/compressed-coalescing-map.md`
