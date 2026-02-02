# EnPeak Frontend Restructuring Plan

## TL;DR

> **Quick Summary**: Restructure EnPeak from 8-page architecture to unified 3-tab conversation-centric design. Consolidate chat interfaces, eliminate duplicate code, and create a unified Talk page with mode selector.
> 
> **Deliverables**:
> - New `/talk` route with mode selector (자유 대화, 오늘의 표현, 롤플레이)
> - Updated `/cards` route (renamed vocabulary)
> - Updated `/my` route with weekly stats
> - Updated BottomNav (Talk, Cards, My)
> - Extended ChatWindow with mode support
> - TDD infrastructure with vitest
> - Route redirects for backward compatibility
> 
> **Estimated Effort**: Large (15-20 tasks across 5 waves)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 0 → Task 1 → Task 4 → Task 8 → Task 13

---

## Context

### Original Request
Restructure EnPeak frontend from 8 pages to a unified conversation-centric design with 3-4 tabs.

### Interview Summary
**Key Discussions**:
- Navigation: 3 tabs (Talk, Cards, My) - Talk replaces Home
- Community: Merge into Talk's Roleplay mode
- Mode Selector: Top pills [자유 대화] [오늘의 표현] [롤플레이]
- Vocabulary: Separate "Cards" tab only (flashcards)
- Testing: TDD setup with vitest
- Stats: Move weekly stats from Home to My tab
- Mode switching: Clear conversation, start fresh
- Scenario creation: Keep /create route, accessible from Talk > Roleplay

**Research Findings**:
- BottomNav already has only 3 tabs (Home, Community, My)
- ChatWindow (401 lines) handles 2 modes via `practiceExpression` prop
- Community page (798 lines) has 200+ lines of duplicate chat UI
- APIs: /api/chat, /api/roleplay/start|turn, /api/rag/daily-expression
- No test infrastructure exists

### Metis Review
**Identified Gaps** (addressed):
- Weekly stats location → Move to My tab
- Mode switching behavior → Clear and restart
- /create route fate → Keep separate, accessible from roleplay mode
- Old route handling → Redirect to /talk with mode params

---

## Work Objectives

### Core Objective
Create a unified, conversation-centric frontend with 3 tabs (Talk, Cards, My) that consolidates all learning modes into a single Talk interface while maintaining existing functionality.

### Concrete Deliverables
- `/talk/page.tsx` - Unified conversation page with mode selector
- `ModeSelector.tsx` - New component with 3 pill buttons
- Updated `ChatWindow.tsx` - Extended with `mode` prop
- Updated `BottomNav.tsx` - New 3-tab configuration
- Updated `/my/page.tsx` - With weekly stats section
- `/cards/page.tsx` - Renamed from vocabulary
- Route redirects in `middleware.ts`
- Test infrastructure with vitest
- Tests for critical components

### Definition of Done
- [ ] `bun run dev` shows 3 tabs: Talk, Cards, My
- [ ] Talk page displays mode selector with 3 modes
- [ ] Each mode works correctly with appropriate API calls
- [ ] Cards page shows vocabulary flashcards
- [ ] My page shows weekly stats + profile
- [ ] Old routes redirect correctly
- [ ] `bun test` passes all tests
- [ ] No TypeScript errors
- [ ] No console errors in browser

### Must Have
- Mode selector with 3 pills
- ChatWindow extended for roleplay mode
- Unified scenario list (built-in + community)
- Weekly stats in My tab
- Route redirects for backward compatibility
- Test coverage for mode switching

### Must NOT Have (Guardrails)
- No new features beyond consolidation
- No backend API changes
- No parallel chat implementations (reuse ChatWindow)
- No nested routes (/talk/roleplay, /talk/free-chat)
- No redesign of existing UI components (reuse existing styles)
- No data migration or schema changes

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: TDD
- **Framework**: vitest (recommended for Next.js)

### Test Setup Task
- Install: `bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom`
- Config: Create `vitest.config.ts`
- Verify: `bun test --help` shows help
- Example: Create `src/__tests__/example.test.tsx`
- Verify: `bun test` passes

### TDD Flow Per Task
1. **RED**: Write failing test first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping green

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Foundation - Start Immediately):
├── Task 0: Set up vitest test infrastructure
└── Task 1: Create ModeSelector component with tests

Wave 1 (After Wave 0):
├── Task 2: Create TalkContext for mode state management
├── Task 3: Extend ChatWindow with mode prop
└── Task 4: Create unified Talk page structure

Wave 2 (After Wave 1):
├── Task 5: Implement Free Chat mode in Talk
├── Task 6: Implement Expression Practice mode in Talk
├── Task 7: Implement Roleplay mode in Talk
└── Task 8: Merge community scenarios into roleplay mode

Wave 3 (After Wave 2):
├── Task 9: Update BottomNav to 3 tabs
├── Task 10: Rename /vocabulary to /cards
├── Task 11: Add weekly stats to My page
└── Task 12: Create route redirects (middleware)

Wave 4 (After Wave 3):
├── Task 13: Delete deprecated pages
├── Task 14: Update all internal links
└── Task 15: Final integration testing

Critical Path: Task 0 → Task 1 → Task 4 → Task 8 → Task 13
Parallel Speedup: ~45% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 0 | None | 1, 2, 3, 4, 5, 6, 7, 8 | None (foundation) |
| 1 | 0 | 4 | 2, 3 |
| 2 | 0 | 4, 5, 6, 7 | 1, 3 |
| 3 | 0 | 5, 6, 7 | 1, 2 |
| 4 | 1, 2 | 5, 6, 7, 8 | None |
| 5 | 3, 4 | 13 | 6, 7 |
| 6 | 3, 4 | 13 | 5, 7 |
| 7 | 3, 4 | 8 | 5, 6 |
| 8 | 7 | 13 | None |
| 9 | 4 | 13 | 10, 11, 12 |
| 10 | None | 14 | 9, 11, 12 |
| 11 | None | 14 | 9, 10, 12 |
| 12 | 4 | 14 | 9, 10, 11 |
| 13 | 5, 6, 8, 9 | 15 | 14 |
| 14 | 10, 11, 12 | 15 | 13 |
| 15 | 13, 14 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Agents |
|------|-------|--------|
| 0 | 0, 1 | 2 parallel quick tasks |
| 1 | 2, 3, 4 | 3 parallel visual-engineering tasks |
| 2 | 5, 6, 7, 8 | 4 parallel visual-engineering tasks |
| 3 | 9, 10, 11, 12 | 4 parallel quick tasks |
| 4 | 13, 14, 15 | Sequential cleanup |

---

## TODOs

### Wave 0: Foundation

- [ ] 0. Set up vitest test infrastructure

  **What to do**:
  - Install vitest, testing-library/react, jsdom as dev dependencies
  - Create `vitest.config.ts` with React + jsdom setup
  - Create `src/__tests__/setup.ts` for test utilities
  - Create example test to verify setup works
  - Add test script to package.json

  **Must NOT do**:
  - Do not modify existing source code
  - Do not install unnecessary dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple configuration task, no complex logic
  - **Skills**: []
    - No special skills needed for config setup

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation task)
  - **Parallel Group**: Wave 0 (sequential start)
  - **Blocks**: All subsequent tasks
  - **Blocked By**: None

  **References**:
  - `frontend/package.json` - Add dev dependencies and test script
  - `frontend/tsconfig.json` - Reference for TypeScript config
  - vitest docs: https://vitest.dev/guide/

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun test
  # Assert: Output shows "1 test passed" or similar
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `chore(test): set up vitest testing infrastructure`
  - Files: `vitest.config.ts`, `src/__tests__/setup.ts`, `src/__tests__/example.test.tsx`, `package.json`
  - Pre-commit: `bun test`

---

- [ ] 1. Create ModeSelector component with tests

  **What to do**:
  - Create `src/components/ModeSelector.tsx`
  - Three pill buttons: 자유 대화, 오늘의 표현, 롤플레이
  - Props: `currentMode`, `onModeChange`
  - Styling: Match existing Tailwind patterns (pill buttons)
  - Write tests first (TDD)

  **Must NOT do**:
  - Do not add complex animations
  - Do not connect to any API yet

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component creation with styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Crafting pill button UI matching existing design

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 0)
  - **Parallel Group**: Wave 0 (after Task 0)
  - **Blocks**: Task 4
  - **Blocked By**: Task 0

  **References**:
  - `src/app/community/page.tsx:443-461` - Existing pill button pattern (filter tabs)
  - `src/app/vocabulary/page.tsx:237-260` - Mode selector pattern (뜻 가리기/단어 가리기)
  - `src/components/BottomNav.tsx:20-35` - Active state styling pattern

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun test src/__tests__/ModeSelector.test.tsx
  # Assert: All tests pass
  
  # Visual verification via playwright:
  # 1. Import ModeSelector in a test page
  # 2. Screenshot shows 3 pills: [자유 대화] [오늘의 표현] [롤플레이]
  # 3. Click each pill, verify onModeChange called with correct mode
  ```

  **Commit**: YES
  - Message: `feat(talk): add ModeSelector component with pill buttons`
  - Files: `src/components/ModeSelector.tsx`, `src/__tests__/ModeSelector.test.tsx`
  - Pre-commit: `bun test`

---

### Wave 1: Core Infrastructure

- [ ] 2. Create TalkContext for mode state management

  **What to do**:
  - Create `src/contexts/TalkContext.tsx`
  - State: `mode` ('free' | 'expression' | 'roleplay')
  - State: `expressionData` (for expression mode)
  - State: `scenarioData` (for roleplay mode)
  - Actions: `setMode`, `clearConversation`, `setExpression`, `setScenario`
  - Persist mode to sessionStorage (not localStorage - session-only)
  - Write tests first (TDD)

  **Must NOT do**:
  - Do not persist conversation history
  - Do not connect to APIs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Context creation following existing patterns
  - **Skills**: []
    - No special skills - follows existing context patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: Task 0

  **References**:
  - `src/contexts/ConversationSettingsContext.tsx:1-112` - Context pattern to follow
  - `src/contexts/TTSContext.tsx` - Provider pattern reference
  - `src/app/layout.tsx:70-77` - Provider hierarchy

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun test src/__tests__/TalkContext.test.tsx
  # Assert: All tests pass
  # Assert: Mode changes correctly
  # Assert: clearConversation resets state
  ```

  **Commit**: YES
  - Message: `feat(talk): add TalkContext for mode state management`
  - Files: `src/contexts/TalkContext.tsx`, `src/__tests__/TalkContext.test.tsx`
  - Pre-commit: `bun test`

---

- [ ] 3. Extend ChatWindow with mode prop

  **What to do**:
  - Add `mode` prop to ChatWindow: `'free' | 'expression' | 'roleplay'`
  - Add `onReset` prop for conversation reset callback
  - Add `scenarioId` prop for roleplay mode
  - Modify API call logic based on mode:
    - free: POST /api/chat
    - expression: POST /api/chat (with practiceExpression)
    - roleplay: POST /api/roleplay/start, /api/roleplay/turn
  - Keep backward compatibility (mode defaults to 'free')
  - Write tests for mode switching

  **Must NOT do**:
  - Do not modify existing free chat behavior
  - Do not break practiceExpression prop
  - Do not add new UI elements (just logic)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Modifying core component with API integration
  - **Skills**: [`vercel-react-best-practices`]
    - `vercel-react-best-practices`: Performance patterns for state management

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: Task 0

  **References**:
  - `src/components/ChatWindow.tsx:67-71` - Current props interface
  - `src/components/ChatWindow.tsx:156-225` - sendMessage function to modify
  - `src/app/community/page.tsx:270-310` - Roleplay API call pattern
  - `backend/api/roleplay.py:45-80` - Roleplay API response structure

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun test src/__tests__/ChatWindow.test.tsx
  # Assert: mode='free' uses /api/chat
  # Assert: mode='expression' uses /api/chat with practiceExpression
  # Assert: mode='roleplay' uses /api/roleplay/start then /api/roleplay/turn
  # Assert: Existing tests still pass
  ```

  **Commit**: YES
  - Message: `feat(chat): extend ChatWindow with mode prop for unified conversation`
  - Files: `src/components/ChatWindow.tsx`, `src/__tests__/ChatWindow.test.tsx`
  - Pre-commit: `bun test`

---

- [ ] 4. Create unified Talk page structure

  **What to do**:
  - Create `src/app/talk/page.tsx`
  - Layout: ModeSelector at top, ChatWindow below
  - Wrap in TalkProvider
  - Handle URL params: `?mode=expression&expression=X&meaning=Y`
  - Handle URL params: `?mode=roleplay&scenario=X`
  - Default to 'free' mode
  - Write integration tests

  **Must NOT do**:
  - Do not implement mode-specific logic (done in Tasks 5-8)
  - Do not add stats or other dashboard elements

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Page creation with component integration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Page layout and component composition

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (after Tasks 1, 2)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/app/chat/page.tsx:1-51` - Existing chat page structure
  - `src/components/ModeSelector.tsx` - Mode selector (from Task 1)
  - `src/contexts/TalkContext.tsx` - Talk context (from Task 2)
  - `src/app/community/page.tsx:403-410` - Safe area and layout patterns

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Assert: ModeSelector visible with 3 pills
  # 3. Assert: ChatWindow visible below
  # 4. Navigate to /talk?mode=expression&expression=break%20the%20ice&meaning=test
  # 5. Assert: Expression mode active
  # Screenshot: .sisyphus/evidence/task-4-talk-page.png
  ```

  **Commit**: YES
  - Message: `feat(talk): create unified Talk page with mode selector`
  - Files: `src/app/talk/page.tsx`, `src/__tests__/talk.test.tsx`
  - Pre-commit: `bun test`

---

### Wave 2: Mode Implementation

- [ ] 5. Implement Free Chat mode in Talk

  **What to do**:
  - Wire up 자유 대화 mode to ChatWindow
  - Use existing /api/chat endpoint
  - Show default suggestions: "Hello!", "How are you?", etc.
  - Ensure conversation resets when switching TO this mode
  - Write mode-specific tests

  **Must NOT do**:
  - Do not modify the ChatWindow component
  - Do not change API response handling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Mode integration with existing components
  - **Skills**: []
    - No special skills - straightforward integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `src/components/ChatWindow.tsx:276-307` - Empty state with suggestions
  - `src/app/talk/page.tsx` - Talk page (from Task 4)
  - `src/contexts/TalkContext.tsx` - Mode state

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Assert: 자유 대화 pill is active (default)
  # 3. Type "Hello" and send
  # 4. Assert: API call to /api/chat observed
  # 5. Assert: AI response appears
  # Screenshot: .sisyphus/evidence/task-5-free-chat.png
  ```

  **Commit**: YES
  - Message: `feat(talk): implement free chat mode`
  - Files: `src/app/talk/page.tsx` (update)
  - Pre-commit: `bun test`

---

- [ ] 6. Implement Expression Practice mode in Talk

  **What to do**:
  - Wire up 오늘의 표현 mode to ChatWindow
  - Fetch daily expression from /api/rag/daily-expression
  - Pass expression to ChatWindow via `practiceExpression` prop
  - Show learning tip with expression meaning
  - Allow user to refresh for new expression
  - Write mode-specific tests

  **Must NOT do**:
  - Do not duplicate daily page logic - reuse ChatWindow
  - Do not show full daily page UI (just conversation)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: API integration and UI state management
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `src/app/daily/page.tsx:105-126` - Daily expression fetch logic
  - `src/app/daily/page.tsx:32-103` - Fallback expressions
  - `src/components/ChatWindow.tsx:109-131` - practiceExpression handling

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Click 오늘의 표현 pill
  # 3. Assert: API call to /api/rag/daily-expression observed
  # 4. Assert: ChatWindow shows expression practice mode
  # 5. Assert: Learning tip visible with expression meaning
  # Screenshot: .sisyphus/evidence/task-6-expression-mode.png
  ```

  **Commit**: YES
  - Message: `feat(talk): implement expression practice mode`
  - Files: `src/app/talk/page.tsx` (update)
  - Pre-commit: `bun test`

---

- [ ] 7. Implement Roleplay mode in Talk (built-in scenarios)

  **What to do**:
  - Wire up 롤플레이 mode to show scenario selector
  - Display 6 built-in scenarios from /api/roleplay/scenarios
  - On scenario select, call /api/roleplay/start
  - Pass session to ChatWindow for roleplay conversation
  - Show stage progress (Stage X/Y)
  - Write mode-specific tests

  **Must NOT do**:
  - Do not add community scenarios yet (Task 8)
  - Do not duplicate community page chat logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex mode with scenario selection + chat
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Scenario selection UI design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `src/app/roleplay/page.tsx:6-55` - Built-in scenario list
  - `src/app/community/page.tsx:207-268` - startRoleplay function
  - `src/app/community/page.tsx:270-310` - sendMessage for roleplay
  - `backend/api/roleplay.py` - API structure

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Click 롤플레이 pill
  # 3. Assert: Scenario list visible (6 scenarios)
  # 4. Click "카페 주문" scenario
  # 5. Assert: API call to /api/roleplay/start observed
  # 6. Assert: ChatWindow shows roleplay conversation
  # 7. Assert: Stage indicator visible (Stage 1/X)
  # Screenshot: .sisyphus/evidence/task-7-roleplay-mode.png
  ```

  **Commit**: YES
  - Message: `feat(talk): implement roleplay mode with built-in scenarios`
  - Files: `src/app/talk/page.tsx` (update), `src/components/ScenarioSelector.tsx`
  - Pre-commit: `bun test`

---

- [ ] 8. Merge community scenarios into roleplay mode

  **What to do**:
  - Extend scenario selector to include community scenarios
  - Fetch from /api/community/scenarios
  - Tab or filter: "기본 시나리오" vs "커뮤니티 시나리오"
  - Use /api/community/roleplay/start|turn for community scenarios
  - Add "+ 시나리오 만들기" button linking to /create
  - Write tests for merged scenario list

  **Must NOT do**:
  - Do not duplicate community page's 200+ line chat UI
  - Do not modify backend APIs

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI extension with API integration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Merged scenario list design

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 7)
  - **Blocks**: Task 13
  - **Blocked By**: Task 7

  **References**:
  - `src/app/community/page.tsx:53-107` - Community scenario structure
  - `src/app/community/page.tsx:142-160` - Fetch community scenarios
  - `src/app/community/page.tsx:214-268` - Community roleplay start
  - `src/components/ScenarioSelector.tsx` - From Task 7

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Click 롤플레이 pill
  # 3. Assert: Both built-in and community scenarios visible
  # 4. Assert: Filter/tabs work (기본 vs 커뮤니티)
  # 5. Click a community scenario
  # 6. Assert: API call to /api/community/roleplay/start observed
  # 7. Assert: "+ 시나리오 만들기" button visible
  # 8. Click button, assert: navigates to /create
  # Screenshot: .sisyphus/evidence/task-8-merged-scenarios.png
  ```

  **Commit**: YES
  - Message: `feat(talk): merge community scenarios into roleplay mode`
  - Files: `src/components/ScenarioSelector.tsx` (update)
  - Pre-commit: `bun test`

---

### Wave 3: Navigation & Pages

- [ ] 9. Update BottomNav to 3 tabs (Talk, Cards, My)

  **What to do**:
  - Modify navItems array: Talk, Cards, My
  - Update icons for each tab
  - Update active state logic for /talk, /cards, /my
  - Write tests for navigation

  **Must NOT do**:
  - Do not change styling/layout
  - Do not add new navigation features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple array modification
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12)
  - **Blocks**: Task 13
  - **Blocked By**: Task 4

  **References**:
  - `src/components/BottomNav.tsx:6-10` - navItems array to modify
  - `src/components/BottomNav.tsx:15-18` - isActive function

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/talk
  # 2. Assert: BottomNav shows 3 tabs: Talk, Cards, My
  # 3. Assert: Talk tab is active
  # 4. Click Cards tab
  # 5. Assert: Navigates to /cards
  # 6. Assert: Cards tab is active
  # Screenshot: .sisyphus/evidence/task-9-bottomnav.png
  ```

  **Commit**: YES
  - Message: `feat(nav): update BottomNav to Talk, Cards, My tabs`
  - Files: `src/components/BottomNav.tsx`
  - Pre-commit: `bun test`

---

- [ ] 10. Rename /vocabulary to /cards

  **What to do**:
  - Move `src/app/vocabulary/page.tsx` to `src/app/cards/page.tsx`
  - Update any internal imports
  - Keep all existing functionality unchanged
  - Write test for route

  **Must NOT do**:
  - Do not modify page functionality
  - Do not change UI

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File rename only
  - **Skills**: [`git-master`]
    - `git-master`: Proper git mv for file rename

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 11, 12)
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `src/app/vocabulary/page.tsx` - Source file to move
  - `src/lib/learningHistory.ts:113-123` - May reference vocabulary

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/cards
  # 2. Assert: Vocabulary page loads correctly
  # 3. Assert: All features work (level selection, flashcards, TTS)
  # Screenshot: .sisyphus/evidence/task-10-cards.png
  ```

  **Commit**: YES
  - Message: `refactor(routes): rename /vocabulary to /cards`
  - Files: `src/app/cards/page.tsx` (new), `src/app/vocabulary/` (delete)
  - Pre-commit: `bun test`

---

- [ ] 11. Add weekly stats to My page

  **What to do**:
  - Extract WeeklyStatsSection from Home page
  - Add to My page above settings
  - Include: weekly activity graph, today's stats, streak
  - Reuse existing `learningHistory` lib functions
  - Write tests for stats display

  **Must NOT do**:
  - Do not redesign stats UI
  - Do not add new stats features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Component extraction and integration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Stats section layout

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 12)
  - **Blocks**: Task 14
  - **Blocked By**: None

  **References**:
  - `src/app/page.tsx:112-280` - Weekly stats UI to extract
  - `src/lib/learningHistory.ts` - Stats functions
  - `src/app/my/page.tsx:68-269` - My page structure

  **Acceptance Criteria**:
  ```bash
  # Agent runs via playwright:
  # 1. Navigate to http://localhost:3000/my
  # 2. Assert: Weekly stats section visible at top
  # 3. Assert: 7-day activity graph visible
  # 4. Assert: Today's stats visible (sessions, streak, words)
  # Screenshot: .sisyphus/evidence/task-11-my-stats.png
  ```

  **Commit**: YES
  - Message: `feat(my): add weekly stats section from home page`
  - Files: `src/app/my/page.tsx`, `src/components/WeeklyStats.tsx`
  - Pre-commit: `bun test`

---

- [ ] 12. Create route redirects (middleware)

  **What to do**:
  - Create `src/middleware.ts` for Next.js route handling
  - Redirect /chat → /talk
  - Redirect /chat?expression=X → /talk?mode=expression&expression=X
  - Redirect /daily → /talk?mode=expression
  - Redirect /roleplay → /talk?mode=roleplay
  - Redirect /community → /talk?mode=roleplay
  - Redirect / → /talk
  - Write tests for redirects

  **Must NOT do**:
  - Do not redirect /login, /my, /cards, /create, /feedback
  - Do not add complex logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple middleware configuration
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Task 14
  - **Blocked By**: Task 4

  **References**:
  - Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
  - `src/app/chat/page.tsx:9-14` - Current URL param handling

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  curl -I http://localhost:3000/chat
  # Assert: 307 redirect to /talk
  
  curl -I "http://localhost:3000/chat?expression=test&meaning=test"
  # Assert: 307 redirect to /talk?mode=expression&expression=test&meaning=test
  
  curl -I http://localhost:3000/daily
  # Assert: 307 redirect to /talk?mode=expression
  
  curl -I http://localhost:3000/
  # Assert: 307 redirect to /talk
  ```

  **Commit**: YES
  - Message: `feat(routes): add middleware for backward-compatible redirects`
  - Files: `src/middleware.ts`
  - Pre-commit: `bun test`

---

### Wave 4: Cleanup & Finalization

- [ ] 13. Delete deprecated pages

  **What to do**:
  - Delete `src/app/page.tsx` (home - replaced by Talk)
  - Delete `src/app/chat/page.tsx` (replaced by Talk)
  - Delete `src/app/daily/page.tsx` (replaced by Talk expression mode)
  - Delete `src/app/roleplay/page.tsx` (replaced by Talk roleplay mode)
  - Delete `src/app/community/page.tsx` (merged into Talk)
  - Delete `src/app/vocabulary/page.tsx` if not already (renamed to cards)
  - Verify no import errors
  - Run full test suite

  **Must NOT do**:
  - Do not delete /login, /my, /cards, /create, /feedback
  - Do not delete until redirects are working

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletion only
  - **Skills**: [`git-master`]
    - `git-master`: Proper git rm for file deletion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 14)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 5, 6, 8, 9

  **References**:
  - All deprecated page files listed above
  - `src/middleware.ts` - Redirects must be working first

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun run build
  # Assert: Build succeeds with no errors
  # Assert: No "Module not found" errors
  
  ls src/app/
  # Assert: Only contains: talk/, cards/, my/, login/, create/, feedback/, layout.tsx, etc.
  ```

  **Commit**: YES
  - Message: `refactor(cleanup): remove deprecated pages (home, chat, daily, roleplay, community)`
  - Files: Multiple deletions
  - Pre-commit: `bun run build && bun test`

---

- [ ] 14. Update all internal links

  **What to do**:
  - Search codebase for links to deprecated routes
  - Update Link hrefs: /chat → /talk, etc.
  - Update router.push calls
  - Update any hardcoded URLs
  - Write test to verify no broken links

  **Must NOT do**:
  - Do not modify external URLs
  - Do not change link styling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Search and replace task
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 13)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 10, 11, 12

  **References**:
  - `src/app/my/page.tsx` - Links to /feedback
  - `src/components/ScenarioSelector.tsx` - Link to /create
  - Search: `grep -r "href=" src/` to find all links

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  grep -r "href=\"/(chat|daily|roleplay|community|vocabulary)" frontend/src/
  # Assert: No results (all deprecated links updated)
  
  grep -r "router.push.*/(chat|daily|roleplay|community|vocabulary)" frontend/src/
  # Assert: No results
  ```

  **Commit**: YES
  - Message: `refactor(links): update all internal links to new routes`
  - Files: Multiple files with link updates
  - Pre-commit: `bun test`

---

- [ ] 15. Final integration testing

  **What to do**:
  - Run full test suite
  - Manual testing of all user flows:
    - Talk > Free chat flow
    - Talk > Expression practice flow
    - Talk > Roleplay flow (built-in + community)
    - Cards > Vocabulary flashcards
    - My > Stats + Settings
    - Navigation between all tabs
  - Test redirects from old URLs
  - Test mobile responsiveness
  - Fix any remaining issues

  **Must NOT do**:
  - Do not add new features
  - Do not make cosmetic changes

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Comprehensive testing with browser automation
  - **Skills**: [`playwright`, `dev-browser`]
    - `playwright`: Browser automation for testing
    - `dev-browser`: Navigation and interaction testing

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Parallel Group**: Wave 4 (sequential, after 13, 14)
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 13, 14

  **References**:
  - All previous task acceptance criteria
  - `frontend/package.json` - scripts

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cd frontend && bun test
  # Assert: All tests pass
  
  cd frontend && bun run build
  # Assert: Build succeeds
  
  # Agent runs via playwright (full flow test):
  # 1. Open http://localhost:3000/talk
  # 2. Test free chat (send message, receive response)
  # 3. Switch to expression mode (verify expression loads)
  # 4. Switch to roleplay mode (verify scenarios load)
  # 5. Select scenario, verify chat works
  # 6. Navigate to Cards, verify flashcards work
  # 7. Navigate to My, verify stats + settings
  # 8. Test old URL redirects
  # All flows pass → DONE
  ```

  **Commit**: YES
  - Message: `test(integration): verify all user flows after restructuring`
  - Files: `src/__tests__/integration.test.tsx`
  - Pre-commit: `bun test`

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 0 | `chore(test): set up vitest testing infrastructure` | vitest.config.ts, setup.ts | bun test |
| 1 | `feat(talk): add ModeSelector component` | ModeSelector.tsx | bun test |
| 2 | `feat(talk): add TalkContext for mode state` | TalkContext.tsx | bun test |
| 3 | `feat(chat): extend ChatWindow with mode prop` | ChatWindow.tsx | bun test |
| 4 | `feat(talk): create unified Talk page` | talk/page.tsx | bun test |
| 5 | `feat(talk): implement free chat mode` | talk/page.tsx | bun test |
| 6 | `feat(talk): implement expression practice mode` | talk/page.tsx | bun test |
| 7 | `feat(talk): implement roleplay mode` | talk/page.tsx, ScenarioSelector.tsx | bun test |
| 8 | `feat(talk): merge community scenarios` | ScenarioSelector.tsx | bun test |
| 9 | `feat(nav): update BottomNav to 3 tabs` | BottomNav.tsx | bun test |
| 10 | `refactor(routes): rename /vocabulary to /cards` | cards/page.tsx | bun test |
| 11 | `feat(my): add weekly stats section` | my/page.tsx, WeeklyStats.tsx | bun test |
| 12 | `feat(routes): add redirect middleware` | middleware.ts | bun test |
| 13 | `refactor(cleanup): remove deprecated pages` | deletions | bun run build |
| 14 | `refactor(links): update internal links` | multiple | bun test |
| 15 | `test(integration): full flow verification` | integration.test.tsx | bun test |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
cd frontend && bun test

# Build succeeds
cd frontend && bun run build

# Dev server starts
cd frontend && bun run dev

# No TypeScript errors
cd frontend && bun run type-check
```

### Final Checklist
- [ ] 3 tabs visible: Talk, Cards, My
- [ ] Talk page has mode selector with 3 modes
- [ ] Free chat mode works (API calls, responses)
- [ ] Expression mode works (fetches expression, practice flow)
- [ ] Roleplay mode works (built-in + community scenarios)
- [ ] Cards page works (flashcards, levels)
- [ ] My page has weekly stats
- [ ] Old routes redirect correctly
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile responsive
