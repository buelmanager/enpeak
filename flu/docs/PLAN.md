# Flu - Flutter Migration Plan Guide

## Overview

EnPeak (Next.js PWA) -> Flu (Flutter) 마이그레이션 계획서.
동일한 FastAPI 백엔드를 사용하며, iOS/Android/Web 크로스플랫폼 앱을 구현한다.

---

## Phase 1: Research & Analysis [COMPLETED]

### 1-1. MD 파일 및 컨텍스트 분석 [COMPLETED]
- `CLAUDE.md`, `docs/project_context.md`, `docs/project_context_rules.md` 읽기
- 프로젝트 규칙: 이모지 금지, 한국어 UI, 영어 학습 콘텐츠
- 디자인 시스템: teal primary (#0D9488), off-white bg (#FAF9F7)

### 1-2. 프론트엔드 코드 분석 [COMPLETED]
- 10개 페이지, 25+ 컴포넌트, 4개 Context 분석
- 주요 파일: ChatWindow.tsx (1,300줄, 가장 복잡), page.tsx (627줄)
- 네비게이션: BottomNav 2탭 + 중앙 Talk FAB

### 1-3. 백엔드 API 분석 [COMPLETED]
- 35+ API 엔드포인트 문서화
- 6개 API 모듈: chat, roleplay, speech, vocabulary, rag, community
- Pydantic 모델 -> Dart 모델 매핑 완료

### 1-4. Flutter 아키텍처 리서치 [COMPLETED]
- Clean Architecture + Feature-first 구조 선정
- Riverpod 상태관리, Dio HTTP, GetIt DI 선정
- speech_to_text, flutter_tts, flutter_card_swiper 등 패키지 선정

---

## Phase 2: Project Foundation [COMPLETED]

### 2-1. Flutter 프로젝트 초기화 [COMPLETED]
- `flutter create --org com.buelmanager --project-name flu` 실행
- iOS, Android, Web 플랫폼 타겟
- Flutter 3.38.4, Dart 3.10.3

### 2-2. Core Layer (Wave 1A) [COMPLETED]
30+ 의존성 설정, 핵심 인프라 구축 완료.

| 파일 | 설명 | 상태 |
|------|------|------|
| `pubspec.yaml` | 30 deps + 5 dev deps | DONE |
| `.env` | API_URL, HF_TOKEN, PRODUCTION | DONE |
| `lib/core/constants/api_endpoints.dart` | 31개 API 엔드포인트 상수 | DONE |
| `lib/core/constants/app_colors.dart` | 14개 색상 상수 | DONE |
| `lib/core/constants/app_typography.dart` | 9개 텍스트 스타일 | DONE |
| `lib/core/constants/app_constants.dart` | 레벨, 사이즈, 시간 상수 | DONE |
| `lib/core/errors/failures.dart` | sealed Failure + 6개 서브타입 | DONE |
| `lib/core/errors/result.dart` | sealed Result<T> (Ok/Err, when, map) | DONE |
| `lib/core/config/env_config.dart` | flutter_dotenv 기반 환경설정 | DONE |
| `lib/core/network/api_client.dart` | Dio 래퍼 (get/post/delete -> Result<T>) | DONE |
| `lib/core/network/api_interceptors.dart` | Auth, Logging, Error, Retry 인터셉터 | DONE |
| `lib/core/theme/app_theme.dart` | Material 3 ThemeData | DONE |
| `lib/core/di/injection.dart` | GetIt DI 설정 | DONE |

### 2-3. Data Layer (Wave 1B) [COMPLETED]
8개 feature의 모든 데이터 모델, 리포지토리 인터페이스, 구현체 생성 완료.

| Feature | Entity | Model | DataSource | Repo Interface | Repo Impl | 상태 |
|---------|--------|-------|------------|----------------|-----------|------|
| chat | message, chat_session | message, chat_request, chat_response | remote | chat_repository | impl | DONE |
| roleplay | scenario, session, report | scenario, session, report | remote | roleplay_repository | impl | DONE |
| speech | voice_info | tts_request, stt_response | remote | speech_repository | impl | DONE |
| vocabulary | word, expansion, evaluate | word, expansion, evaluate | remote + local | vocabulary_repository | impl | DONE |
| rag | search_result, daily_expression | search_result, daily_expression | remote | rag_repository | impl | DONE |
| feedback | grammar_feedback | grammar_feedback | remote | feedback_repository | impl | DONE |
| community | community_scenario | community_scenario | remote | community_repository | impl | DONE |
| auth | user (AppUser) | - | local | auth_repository | impl | DONE |

### 2-4. Navigation & Screen Scaffolds (Wave 1C) [COMPLETED]
메인 진입점, 네비게이션 셸, 10개 화면 스캐폴드 생성 완료.

| 파일 | 설명 | 상태 |
|------|------|------|
| `lib/main.dart` | ProviderScope, dotenv, routes | DONE |
| `navigation/navigation_shell.dart` | BottomAppBar + 72px Talk FAB | DONE |
| `home/home_screen.dart` | 대시보드 (daily card, quick actions) | DONE |
| `talk/talk_screen.dart` | 3모드 탭 (Free/Expression/Roleplay) | DONE |
| `talk/mode_selector.dart` | 세그먼트 컨트롤 위젯 | DONE |
| `stats/stats_screen.dart` | 학습 통계 | DONE |
| `cards/cards_screen.dart` | 단어 카드 | DONE |
| `my/my_screen.dart` | 프로필/설정 | DONE |
| `daily/daily_screen.dart` | 오늘의 표현 | SCAFFOLD |
| `create/create_screen.dart` | 시나리오 생성 | SCAFFOLD |
| `feedback/feedback_screen.dart` | 피드백 | SCAFFOLD |
| `login/login_screen.dart` | 로그인 | SCAFFOLD |
| `roleplay/roleplay_screen.dart` | 롤플레이 | SCAFFOLD |

### 2-5. 통합 검증 [COMPLETED]
- `flutter analyze`: 0 issues
- `flutter pub get`: 성공
- 파일 수: 75 Dart 파일 (core 11 + features 63 + main 1)

---

## Phase 3: Feature Implementation [COMPLETED]

### Context Gathering [COMPLETED - 2026-02-08]
**3개 Explore Agent 병렬 실행 완료:**
1. **Flutter 프로젝트 현황** - 101 Dart 파일, Speech/Chat/RAG 완전 구현, 나머지 scaffold
2. **Next.js 원본 소스** - TTSContext.tsx, ChatWindow.tsx, VoiceRecorder.tsx 등 8개 핵심 파일 분석
3. **Backend API 계약** - 30+ 엔드포인트 request/response JSON 구조 완전 문서화

**핵심 발견사항:**
- Speech feature는 이미 완전 구현됨 (STT/TTS providers, state, widgets scaffold)
- Chat feature는 data/domain 완료, presentation만 필요
- Voice Cycle 로직: TTS 종료 → 500ms 대기 → 자동 녹음 시작
- STT Confidence 처리: ≥0.8 즉시 전송, 0.4-0.8 확인 UI, <0.4 Whisper fallback

### Wave 2 (병렬 실행) - 핵심 기능 구현

#### 3-1. Speech Service Layer [COMPLETED - 2026-02-08]
> 4개 에이전트 병렬 실행 결과: flutter analyze 0 issues, 101 Dart files
> - voice_recorder_button.dart: ConsumerStatefulWidget, pulse animation, STT provider 연동
> - tts_play_button.dart: ConsumerWidget, play/stop/loading 상태, TTS provider 연동
> STT/TTS 서비스는 Talk, Cards 등 여러 feature에서 공유되므로 먼저 구현

**구현 범위:**
- `lib/features/speech/presentation/providers/` - Riverpod providers
  - `tts_provider.dart`: TTS 상태 관리 (로컬 flutter_tts + 백엔드 Edge TTS HD 모드)
  - `stt_provider.dart`: STT 상태 관리 (speech_to_text 네이티브)
- `lib/features/speech/presentation/widgets/`
  - `voice_recorder_button.dart`: 마이크 버튼 (녹음 중 애니메이션)
  - `tts_player_widget.dart`: TTS 재생 버튼

**원본 참조:** `frontend/src/contexts/TTSContext.tsx` (485줄)
- HD 모드 (백엔드 Edge TTS) vs Device 모드 (로컬 Web Speech API) 전환
- 음성 선택 (en-US-AriaNeural 등)
- 재생 큐 관리

**의존성:** core layer (api_client, result)
**선행 조건:** 없음 (core 완료)
**후행 의존:** Talk, Cards, Daily 화면

---

#### 3-2. Talk Feature - Chat/Expression/Roleplay [COMPLETED - 2026-02-08]
> talk_screen.dart (494줄) 완성. ConsumerStatefulWidget으로 3개 모드 완전 통합.
> - Free Chat: ChatWindow + chatProvider 직접 연결
> - Expression: 표현 카드 + Practice 버튼 + ChatWindow
> - Roleplay: ScenarioPicker → 인라인 헤더 (stage progress) + ChatWindow
> - ref.listen으로 에러 SnackBar, 모드 전환 사이드이펙트, AI 메시지 주입 처리
> - TalkMode enum 통합 (mode_selector.dart → talk_provider.dart에서 import)
> - flutter analyze: 0 issues
> 앱의 가장 핵심 기능. 가장 복잡한 구현.

**구현 범위:**

**(A) Riverpod Providers:**
- `lib/features/chat/presentation/providers/`
  - `chat_provider.dart`: 대화 세션 상태, 메시지 목록, 전송/수신
  - `chat_state.dart`: ChatState (messages, isLoading, conversationId, etc.)
- `lib/features/talk/presentation/providers/`
  - `talk_provider.dart`: 현재 모드, 표현 연습 상태
- `lib/features/roleplay/presentation/providers/`
  - `roleplay_provider.dart`: 시나리오 목록, 세션 상태, 스테이지 진행

**(B) Chat Widgets (가장 복잡):**
- `lib/features/chat/presentation/widgets/`
  - `chat_window.dart`: 메시지 리스트 + 입력창 + 음성 입력
  - `message_bubble.dart`: 메시지 말풍선 (AI/User 구분, suggestions 표시)
  - `chat_input_bar.dart`: 텍스트 입력 + 음성 버튼 + 전송 버튼
  - `suggestion_chips.dart`: AI 추천 응답 칩
  - `better_expression_card.dart`: "더 좋은 표현" 카드
  - `learning_tip_card.dart`: 학습 팁 (한국어)

**(C) Roleplay Widgets:**
- `lib/features/roleplay/presentation/widgets/`
  - `scenario_picker.dart`: 시나리오 선택 그리드 (기본 20+ + 커뮤니티)
  - `scenario_card.dart`: 시나리오 카드 (제목, 난이도, 카테고리)
  - `roleplay_header.dart`: 현재 스테이지 진행 표시
  - `roleplay_report_dialog.dart`: 세션 종료 보고서

**(D) Talk Screen 완성:**
- Free Chat 모드: ChatWindow 연결
- Expression 모드: 오늘의 표현 + ChatWindow (표현 시스템 프롬프트)
- Roleplay 모드: ScenarioPicker -> ChatWindow (시나리오 프롬프트)

**원본 참조:**
- `ChatWindow.tsx` (1,300줄) - 메시지, 제안, TTS, STT, 번역 통합
- `RoleplayPicker.tsx` (235줄) - 시나리오 선택 UI
- `TalkContext.tsx` (133줄) - 모드 상태 관리
- `MessageBubble.tsx` - 메시지 표시
- `VoiceRecorder.tsx` - 음성 입력

**의존성:** Speech Service, Chat/Roleplay repositories
**선행 조건:** Speech Service (3-1)
**후행 의존:** 없음 (독립)

---

#### 3-3. Cards Feature - Vocabulary Flashcards [COMPLETED - 2026-02-08]
> cards_state.dart, cards_provider.dart, level_selector.dart, vocabulary_card.dart, card_actions.dart, idiom_expansion.dart + cards_screen.dart 완성
> 단어 학습 카드 UI

**구현 범위:**
- `lib/features/cards/presentation/providers/`
  - `cards_provider.dart`: 레벨 선택, 카드 목록, 현재 카드 인덱스
- `lib/features/cards/presentation/pages/`
  - `cards_screen.dart`: 레벨 선택 -> 카드 뷰 (완성)
- `lib/features/cards/presentation/widgets/`
  - `level_selector.dart`: A1-C2 레벨 선택 칩
  - `vocabulary_card.dart`: 앞면(영어) / 뒷면(한국어) 플립 카드
  - `card_actions.dart`: 뜻 가리기/단어 가리기 모드 전환
  - `idiom_expansion.dart`: 관련 숙어 & 예문 확장 패널

**원본 참조:** `cards/page.tsx` (595줄)
- flutter_card_swiper 활용 (좌/우 스와이프)
- 레벨별 단어 로드 (GET /api/vocabulary/level/{level})
- 숙어/예문 확장 (POST /api/vocabulary/expand)
- TTS 발음 재생

**의존성:** Vocabulary repository, Speech Service
**선행 조건:** Speech Service (3-1)
**후행 의존:** 없음

---

### Wave 3 (병렬 실행) - 보조 기능 구현

#### 3-4. Home Dashboard [COMPLETED - 2026-02-08]
> home_provider.dart, home_screen.dart, daily_expression_card.dart, quick_action_grid.dart, recent_activity_list.dart, weekly_streak_widget.dart 모두 구현 완료
> 대시보드 완성

**구현 범위:**
- `lib/features/home/presentation/providers/`
  - `home_provider.dart`: 오늘의 표현, 최근 활동, 학습 통계
- `lib/features/home/presentation/pages/`
  - `home_screen.dart`: 기존 scaffold -> 완전한 대시보드
- `lib/features/home/presentation/widgets/`
  - `daily_expression_card.dart`: 오늘의 표현 카드 (API 연동)
  - `recent_activity_list.dart`: 최근 학습 활동 목록
  - `weekly_streak_widget.dart`: 주간 스트릭 표시
  - `quick_action_grid.dart`: 빠른 액션 (Cards, Create, Feedback)

**원본 참조:** `app/page.tsx` (627줄)
- 오늘의 표현 (GET /api/rag/daily-expression)
- 학습 기록 (로컬 저장소)
- 주간 통계 요약

**의존성:** RAG repository, 로컬 저장소
**선행 조건:** Wave 2 완료 불필요 (독립)
**후행 의존:** 없음

---

#### 3-5. Stats Feature - Learning Analytics [COMPLETED - 2026-02-08]
> stats_state.dart, stats_provider.dart, stats_screen.dart, weekly_bar_chart.dart, category_pie_chart.dart, streak_calendar.dart, stat_summary_card.dart 모두 구현 완료. fl_chart 연동.
> 학습 통계 차트

**구현 범위:**
- `lib/features/stats/presentation/providers/`
  - `stats_provider.dart`: 학습 데이터 집계, 차트 데이터
- `lib/features/stats/presentation/pages/`
  - `stats_screen.dart`: 완전한 통계 페이지
- `lib/features/stats/presentation/widgets/`
  - `weekly_chart.dart`: 주간 학습 차트 (fl_chart)
  - `streak_calendar.dart`: 연속 학습 캘린더
  - `category_breakdown.dart`: 카테고리별 통계
  - `stat_summary_card.dart`: 요약 카드 (총 단어, 회화 시간 등)

**원본 참조:** `stats/page.tsx`, `components/stats/*.tsx` (11개 차트 컴포넌트)
- fl_chart 활용 (BarChart, LineChart, PieChart)
- 로컬 Hive 저장소에서 학습 기록 조회
- 주간/월간/전체 통계

**의존성:** Hive 로컬 저장소
**선행 조건:** 없음
**후행 의존:** 없음

---

#### 3-6. My Page - Profile & Settings [COMPLETED - 2026-02-08]
> my_provider.dart, my_screen.dart, voice_settings_sheet.dart 구현 완료. TTS 7개 음성 선택, 속도 조절, HD/Device 모드 전환.
> 프로필 및 설정

**구현 범위:**
- `lib/features/my/presentation/providers/`
  - `settings_provider.dart`: 음성 설정, 사용자 정보
- `lib/features/my/presentation/pages/`
  - `my_screen.dart`: 완전한 마이페이지
- `lib/features/my/presentation/widgets/`
  - `profile_header.dart`: 사용자 프로필 (아바타, 이름, 이메일)
  - `voice_settings.dart`: TTS 음성 선택, 속도 조절
  - `settings_list.dart`: 설정 목록 (로그인, 앱 정보 등)
  - `learning_summary.dart`: 학습 요약 (총 단어, 회화 수)

**원본 참조:** `my/page.tsx` (377줄)
- 주간 학습 통계 (학습일, 단어, 회화)
- 연속 스트릭
- 음성 설정 (HD/Device 모드, 음성 선택)
- 앱 업데이트, 로그아웃

**의존성:** Auth repository, SharedPreferences
**선행 조건:** 없음
**후행 의존:** 없음

---

### Wave 4 (병렬 실행) - 부가 기능

#### 3-7. Daily Expression [COMPLETED - 2026-02-08]
> daily_screen.dart (291줄) + daily_provider.dart (59줄) 이전 세션에서 구현 완료.
> TTS 버튼 ttsProvider 연동 추가.

**구현 범위:**
- `daily_screen.dart` 완성 (API 연동, TTS 재생, 예문 표시)

**원본 참조:** `daily/page.tsx`

#### 3-8. Create Scenario [COMPLETED - 2026-02-08]
> create_provider.dart (새 파일) + create_screen.dart (~370줄) 완성.
> CreateState/CreateNotifier, 폼 검증, CommunityRepository.createScenario 연동.
> Basic Info + Difficulty selector + Tags chips UI.

**구현 범위:**
- 시나리오 생성 폼 (title, place, situation, difficulty, tags)
- CommunityRepository.createScenario 연동
- 폼 검증 + 성공/에러 처리

**원본 참조:** `create/page.tsx`

#### 3-9. Feedback / Feature Request [COMPLETED - 2026-02-08]
> feedback_screen.dart (375줄) + feedback_provider.dart (114줄) 이전 세션에서 완전 구현 완료.
> Grammar Check + Feature Request 폼 모두 동작.

**구현 범위:**
- 기능 요청 폼 (Firestore 저장)
- 문법 체크 UI (POST /api/feedback/grammar)

**원본 참조:** `feedback/page.tsx`

#### 3-10. Login Screen [COMPLETED - 2026-02-08]
> login_screen.dart (147줄) + auth_provider.dart (109줄) 이전 세션에서 완전 구현 완료.
> Google Sign-in + Anonymous 로그인 + 에러 처리.

**구현 범위:**
- Firebase Auth 연동 (Google Sign-in, Anonymous)
- 로그인 상태에 따른 UI 분기

**원본 참조:** `login/page.tsx`

---

## Phase 4: Integration & Polish [COMPLETED]

### 4-1. DI & Provider 통합 [COMPLETED - 2026-02-08]
> injection.dart: 8개 feature 전체 등록 (Auth, Chat, Community, Feedback, RAG, Roleplay, Speech, Vocabulary)
> 4개 UnimplementedError provider를 GetIt.instance 패턴으로 통일 (daily, auth, feedback, create)
> main.dart: configureDependencies() 호출 추가
> flutter analyze: 0 issues

### 4-2. 로컬 저장소 통합 [COMPLETED - 2026-02-08]
> SharedPreferences로 학습 기록/스트릭 관리 (Hive 불필요).
> HomeNotifier: LearningRecord 저장/로드, 스트릭 계산 (이미 구현됨)
> StatsNotifier: SharedPreferences에서 실제 학습 데이터 읽도록 수정 (하드코딩 제거)
> weekly data, category breakdown, streak, totals 모두 실데이터 기반으로 전환

### 4-3. UI/UX Polish [COMPLETED - 2026-02-08]
> 공유 위젯 2개 생성:
> - shimmer_loading.dart: ShimmerBox, ShimmerCard, ShimmerList, ShimmerFullScreen
> - error_state.dart: ErrorStateWidget (warning icon + retry), EmptyStateWidget (icon + title + action)
> flutter analyze: 0 issues, 124 Dart files

### 4-4. 빌드 및 테스트 [COMPLETED - 2026-02-08]
> - flutter analyze: 0 issues (124 Dart files)
> - flutter build web: SUCCESS (18.4s, build/web 생성)
> - Wasm 경고: flutter_secure_storage_web, flutter_tts (서드파티 패키지 - 코드 수정 불필요)
> - iOS/Android 빌드: Firebase/Xcode/Android SDK 설정 후 진행 가능

---

## Phase 5: Deployment [COMPLETED]

### 5-1. Firebase & App Setup [COMPLETED - 2026-02-08]
> Firebase.initializeApp() + DefaultFirebaseOptions 연동 완료
> 앱 이름 "EnPeak" -> "Flu" 전체 변경 (manifest.json, index.html, main.dart)
> macOS + Windows 플랫폼 추가 (flutter create --platforms=macos,windows)
> macOS deployment target 10.15 -> 11.0 (speech_to_text 요구사항)
> record 패키지 5.2.1 -> 6.2.0 업그레이드 (iOS 빌드 호환성 수정)

### 5-2. 빌드 검증 [COMPLETED - 2026-02-08]
> - flutter analyze: 0 issues
> - flutter build web: SUCCESS (19.6s)
> - flutter build macos: SUCCESS (108.0MB)
> - flutter build ios --no-codesign: SUCCESS (55.6MB)
> - Windows: 플랫폼 디렉토리 생성 완료 (빌드는 Windows 환경 필요)

### 5-3. 플랫폼 현황

| Platform | Directory | Firebase Config | Build Status |
|----------|-----------|----------------|--------------|
| iOS | ios/ | GoogleService-Info.plist | SUCCESS |
| Android | android/ | google-services.json | 미검증 (Gradle 환경 필요) |
| Web | web/ | firebase_options.dart | SUCCESS |
| macOS | macos/ | firebase_options.dart | SUCCESS |
| Windows | windows/ | firebase_options.dart | 디렉토리 생성 완료 |

---

## Dependency Graph

```
Phase 1 (Research)
    |
    v
Phase 2 (Foundation) -----> flutter analyze: 0 issues
    |
    v
Phase 3 - Wave 2 (병렬):
    |
    +-- [3-1] Speech Service --------+
    |                                |
    +-- [3-2] Talk (Chat/Roleplay) --+-- depends on 3-1
    |                                |
    +-- [3-3] Cards (Flashcards) ----+-- depends on 3-1
    |
    v
Phase 3 - Wave 3 (병렬, Wave 2와 독립):
    |
    +-- [3-4] Home Dashboard (독립)
    +-- [3-5] Stats Charts (독립)
    +-- [3-6] My Page (독립)
    |
    v
Phase 3 - Wave 4 (병렬):
    |
    +-- [3-7] Daily Expression
    +-- [3-8] Create Scenario
    +-- [3-9] Feedback
    +-- [3-10] Login
    |
    v
Phase 4 (통합 & 폴리시)
    |
    v
Phase 5 (배포)
```

---

## Current Status

| Phase | Step | 상태 | 비고 |
|-------|------|------|------|
| Phase 1 | 1-1 ~ 1-4 | COMPLETED | 리서치 완료 |
| Phase 2 | 2-1 ~ 2-5 | COMPLETED | 75 Dart 파일, 0 analyze issues |
| Phase 3 | 3-1 Speech | COMPLETED | Wave 2A 병렬 완료 (2026-02-08) |
| Phase 3 | 3-2 Talk | COMPLETED | talk_screen.dart 완성, 3모드 통합 (2026-02-08) |
| Phase 3 | 3-3 Cards | COMPLETED | cards_screen.dart + 4 widgets 완성 (2026-02-08) |
| Phase 3 | 3-4 Home | COMPLETED | Wave 2A 병렬 완료 (2026-02-08) |
| Phase 3 | 3-5 Stats | COMPLETED | Wave 2A 병렬 완료 (2026-02-08) |
| Phase 3 | 3-6 My | COMPLETED | Wave 2A 병렬 완료 (2026-02-08) |
| Phase 3 | 3-7 Daily | COMPLETED | TTS 연동 완료 (2026-02-08) |
| Phase 3 | 3-8 Create | COMPLETED | 시나리오 생성 위저드 완성 (2026-02-08) |
| Phase 3 | 3-9 Feedback | COMPLETED | 이전 세션에서 완성 (2026-02-08) |
| Phase 3 | 3-10 Login | COMPLETED | 이전 세션에서 완성 (2026-02-08) |
| Phase 4 | 4-1 DI | COMPLETED | GetIt 8 features 등록, provider 통일 (2026-02-08) |
| Phase 4 | 4-2 Storage | COMPLETED | SharedPreferences 기반 학습기록/통계 연동 (2026-02-08) |
| Phase 4 | 4-3 UI Polish | COMPLETED | Shimmer + Error/Empty 공유 위젯 (2026-02-08) |
| Phase 4 | 4-4 Build | COMPLETED | analyze 0 issues, web build SUCCESS (2026-02-08) |
| Phase 5 | 5-1 Firebase/App | COMPLETED | Firebase init, 이름 변경, 5 platforms (2026-02-08) |
| Phase 5 | 5-2 Build | COMPLETED | analyze 0, web/macOS/iOS 빌드 SUCCESS (2026-02-08) |

---

## File Count Summary

| Category | Files | 상태 |
|----------|-------|------|
| Core (config, constants, errors, network, theme, DI) | 11 | DONE |
| Data Models (entities + models) | 26 | DONE |
| Data Sources | 9 | DONE |
| Repository Interfaces | 8 | DONE |
| Repository Implementations | 8 | DONE |
| Presentation (pages + widgets + providers) | 46 | DONE |
| Core widgets (shimmer, error/empty) | 2 | DONE |
| main.dart + firebase_options | 2 | DONE |
| **Total** | **124** | - |

---

## Agent Delegation Strategy

| Step | Agent Category | Skills | 병렬 여부 |
|------|---------------|--------|-----------|
| 3-1 Speech | unspecified-high | flutter-clean-architecture | 독립 실행 |
| 3-2 Talk | unspecified-high | flutter-clean-architecture, frontend-ui-ux | 3-1 후 실행 |
| 3-3 Cards | unspecified-high | flutter-clean-architecture, frontend-ui-ux | 3-1 후 실행 |
| 3-4 Home | unspecified-high | flutter-clean-architecture, frontend-ui-ux | 독립 실행 |
| 3-5 Stats | visual-engineering | flutter-clean-architecture, frontend-ui-ux | 독립 실행 |
| 3-6 My | unspecified-high | flutter-clean-architecture | 독립 실행 |
| 3-7~3-10 | quick ~ unspecified-low | flutter-clean-architecture | 병렬 실행 |

---

## Original Source -> Flutter Mapping

| Original (Next.js) | Lines | Flutter Target | Complexity |
|---------------------|-------|---------------|------------|
| `ChatWindow.tsx` | 1,300+ | chat/presentation/widgets/* | HIGH |
| `page.tsx` (home) | 627 | home/presentation/* | MEDIUM |
| `cards/page.tsx` | 595 | cards/presentation/* | MEDIUM |
| `TTSContext.tsx` | 485 | speech/presentation/providers/* | HIGH |
| `my/page.tsx` | 377 | my/presentation/* | LOW |
| `talk/page.tsx` | 270 | talk/presentation/* | LOW |
| `RoleplayPicker.tsx` | 235 | roleplay/presentation/widgets/* | MEDIUM |
| `stats/page.tsx` | 200+ | stats/presentation/* | MEDIUM |
| `AuthContext.tsx` | 140 | auth/presentation/providers/* | LOW |
| `TalkContext.tsx` | 133 | talk/presentation/providers/* | LOW |
| `BottomNav.tsx` | 116 | navigation/presentation/* | DONE |
| `ModeSelector.tsx` | 33 | talk/presentation/widgets/* | DONE |
