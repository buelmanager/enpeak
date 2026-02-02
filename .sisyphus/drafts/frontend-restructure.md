# Draft: EnPeak Frontend Restructuring

## Requirements (confirmed from context)

### Original Request
Restructure EnPeak frontend from 8 pages to a unified conversation-centric design with 3-4 tabs.

### Current State Analysis

**Current 8 Pages:**
| Route | Purpose | Key Components | Lines |
|-------|---------|----------------|-------|
| `/` (Home) | Dashboard, stats, quick actions | BottomNav, AuthContext | 287 |
| `/chat` | Free conversation with AI | ChatWindow (401 lines), VoiceRecorder | 51 |
| `/daily` | Daily expression learning | TTS, BottomNav | 269 |
| `/vocabulary` | A1-C2 flashcards | Flashcard UI, TTS, level selector | 465 |
| `/roleplay` | Pre-built scenarios (6 shown) | BottomNav, scenario list | 148 |
| `/community` | User-generated scenarios + roleplay | Full chat UI (duplicated!), VoiceRecorder | 798 |
| `/my` | Profile, settings | TTSSettingsModal, AuthContext | 280 |
| `/feedback` | Feature requests | Firebase Firestore | 603 |
| `/create` | Scenario creation | (exists but not examined) | - |
| `/login` | Authentication | (exists but not examined) | - |

**Current BottomNav (only 3 items!):**
```typescript
const navItems = [
  { href: '/', label: '홈', icon: 'home' },
  { href: '/community', label: '커뮤니티', icon: 'community' },
  { href: '/my', label: 'My', icon: 'my' },
]
```

### Key Finding: Chat UI Duplication
ChatWindow appears in:
1. `/chat/page.tsx` - uses ChatWindow component directly
2. `/community/page.tsx` - has FULL DUPLICATE chat implementation (lines 580-750)
   - Own message state, recording state, TTS handling
   - Duplicates VoiceRecorder integration
   - Duplicates ConversationSettingsPanel

### ChatWindow Component Analysis (401 lines)
**Props:**
- `practiceExpression?: { expression: string, meaning: string }`

**Mode Detection:**
- If `practiceExpression` exists → Expression practice mode (from /daily)
- If no props → Free chat mode
- NO roleplay mode currently! Community does its own thing

**Key State:**
- messages, input, loading, conversationId
- isRecording, showSettings, shouldAutoRecord
- Uses ConversationSettingsContext

**API Integration:**
- `/api/chat` for free conversation

### Target State (from user)
```
┌─────────────────────────────────────┐
│           EnPeak                    │
├─────────────────────────────────────┤
│    [     통합 대화 화면     ]       │
│                                     │
│    상단: 모드 선택기                │
│    ├── 자유 대화                    │
│    ├── 오늘의 표현 연습             │
│    ├── 단어 → 문장 만들기           │
│    └── 상황 롤플레이                │
│                                     │
├─────────────────────────────────────┤
│  [대화]      [학습카드]      [MY]   │
└─────────────────────────────────────┘
```

## Technical Decisions

### Navigation Structure Decision
**Proposed 3-4 tabs:**
1. **Talk (대화)** - Unified conversation interface
2. **Cards (학습카드)** - Flashcard learning (vocabulary/expressions)
3. **My** - Settings, profile

**Open Question:** Should there be a Home/Dashboard tab, or should Talk BE the home?

### Mode Selector for Talk Page
Modes to consolidate:
1. **자유 대화 (Free Chat)** - Current `/chat` behavior
2. **오늘의 표현 연습 (Daily Expression)** - Expression practice from `/daily`
3. **단어 → 문장 만들기 (Vocabulary Practice)** - New! Use word in sentence
4. **상황 롤플레이 (Roleplay)** - Merge `/roleplay` + `/community` scenarios

### Community/Roleplay Consolidation
**Current confusion:**
- `/roleplay` shows 6 hardcoded scenarios, links to `/roleplay/[id]`
- `/community` shows user scenarios, has inline chat modal

**Proposal:** Merge into single scenario browser in Talk page mode selector

## Research Findings

### From Codebase Analysis:
1. **ChatWindow is MODE-AWARE** - Already handles `practiceExpression` prop
2. **Community has duplicate chat** - 200+ lines of duplicated chat logic
3. **BottomNav already minimal** - Only 3 tabs currently (Home, Community, My)
4. **Vocabulary is self-contained** - Has its own full UI, level selection
5. **Daily fetches from RAG API** - `/api/rag/daily-expression`

### API Endpoints Used:
- `/api/chat` - Free conversation
- `/api/rag/daily-expression` - Daily expression
- `/api/vocabulary/level/{level}` - Vocabulary by level
- `/api/vocabulary/expand` - Word expansion (idioms, sentences)
- `/api/community/scenarios` - Community scenarios
- `/api/community/roleplay/start` - Start roleplay session
- `/api/community/roleplay/turn` - Roleplay conversation turn

## User Decisions (CONFIRMED)

### Q1: Navigation Structure - **DECIDED: A**
**3 tabs: Talk, Cards, My** - Talk replaces Home as entry point

### Q2: Community & Roleplay Fate - **DECIDED: A**
**Merge into Talk's Roleplay mode** - User + built-in scenarios in unified list

### Q3: Mode Selector UI - **DECIDED: A**
**Top pills**: `[자유 대화] [오늘의 표현] [롤플레이]` - Always visible, quick switching

### Q4: Vocabulary Placement - **DECIDED: A**
**Separate "Cards" tab only** - Flashcard-focused learning, passive study

### Q5: Test Strategy - **DECIDED: A**
**TDD Setup** - Install test framework, write tests before implementation

## Scope Boundaries

### INCLUDE (Confirmed):
- Unified Talk page with mode selector
- New navigation with 3-4 tabs
- ChatWindow enhancement for multiple modes
- Remove/hide Community page
- Consolidate roleplay scenarios

### EXCLUDE (Assumed):
- Backend changes (confirmed by user)
- New API endpoints
- Authentication flow changes
- PWA manifest changes

### AMBIGUOUS (Needs clarification):
- Whether to keep Home dashboard
- Fate of vocabulary as separate tab vs. mode
- Whether community scenarios should be accessible
- Feedback page location
