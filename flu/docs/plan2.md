# Phase 2: Pixel-Perfect UI Implementation Plan

## Overview
Phase 1 (PLAN.md) built the Flutter app foundation with all features working.
Phase 2 reimplements the UI to match the original Next.js app pixel-perfectly, adding missing components and improving where possible.

## Current State
- 124 Dart files, 0 analyze issues
- All 5 platforms: iOS, Android, Web, macOS, Windows
- 8 features registered in DI (GetIt)
- Basic UI implemented for all screens
- Missing: Quiz system, advanced stats charts, splash screen, auth routing, pronunciation practice, word popup, STT confirmation, listening indicator, situation picker, 3D card flip

## Design System Foundation

### Step 1: Design Tokens & Theme (Priority: CRITICAL)
**Goal**: Establish a single source of truth for all design values
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Create `lib/core/theme/app_colors.dart`:
   - Primary: Color(0xFF0D9488) (teal)
   - Primary hover: Color(0xFF0F766E)
   - Primary light: Color(0xFFF0FDFA)
   - Background: Color(0xFFFAF9F7)
   - Surface: Colors.white
   - Text primary: Color(0xFF1A1A1A)
   - Text secondary: Color(0xFF8A8A8A)
   - Text tertiary: Color(0xFFC5C5C5)
   - Text link: Color(0xFF666666)
   - Border: Color(0xFFF0F0F0)
   - Border medium: Color(0xFFE5E5E5)
   - Border card: Color(0xFFEBEBEB)
   - Input bg: Color(0xFFF5F5F5)
   - Accents: coral Color(0xFFF87171), green Color(0xFF10B981), orange Color(0xFFF59E0B), purple Color(0xFF8B5CF6)
   - Quiz correct bg/text/border
   - Quiz wrong bg/text/border
   - Level colors (A1-C2)
   - Difficulty colors (beginner/intermediate/advanced)

2. Create `lib/core/theme/app_typography.dart`:
   - System font family
   - All text styles with exact sizes (10-30px), weights, letter-spacing
   - Named styles: displayLarge (30px), titleLarge (22px), titleMedium (17px), bodyLarge (15px), bodyMedium (14px), bodySmall (13px), labelLarge (12px), labelMedium (11px), labelSmall (10px)

3. Create `lib/core/theme/app_spacing.dart`:
   - Spacing constants: xs(2), sm(4), md(8), lg(12), xl(16), xxl(20), xxxl(24), page(24), cardPadding(20), bottomNavClearance(96)
   - Border radius constants: sm(4), md(8), lg(10), xl(12), xxl(16), xxxl(24), full(9999)

4. Create `lib/core/theme/app_shadows.dart`:
   - cardShadow: BoxShadow(0, 2, 8, rgba(0,0,0,0.04))
   - mediumShadow: BoxShadow(0, 4, 6, rgba(0,0,0,0.1))
   - fabShadow: BoxShadow(0, 4, 20, rgba(13,148,136,0.35))

5. Update `lib/core/theme/app_theme.dart` to use all tokens

**Verification**: All existing widgets compile with new theme, flutter analyze passes

### Step 2: Shared Components (Priority: CRITICAL)
**Goal**: Build reusable components matching original design
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Update `BottomNav`: 2 tabs + 72px teal FAB, safe-area support, active/inactive states
2. Create `SplashScreen`: Logo + spinner + fade-out animation
3. Create `AppShell`: Splash -> auth check -> route protection wrapper
4. Create `SectionHeader` widget: teal bar + uppercase label pattern (reused everywhere)
5. Create `MinimalCard` widget: bg-white rounded-2xl border shadow tap-scale pattern
6. Create `LoadingDots` widget: 3 bouncing dots (teal for TTS, gray for thinking)
7. Create `EmptyState` widget: icon + primary text + secondary text pattern

**Verification**: Widgets render correctly in all screens, flutter analyze passes

## Screen Implementations

### Step 3: Home Dashboard (Priority: HIGH)
**Goal**: Pixel-perfect home page matching original
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Header: greeting text + app title + avatar circle (auth-aware)
2. Streak & session badges (conditional display)
3. 3-column quick mode cards grid
4. Daily challenge card (teal bg, progress bars, goal sub-cards)
5. Recent activity card (icon + title + time ago + "이어하기" pill)
6. Quick quiz widget (word display + 3 answer options + correct/wrong states)
7. Today's expression card (accent bar + text + meaning + chevron)
8. Recommended scenarios horizontal scroll (150px fixed cards, difficulty badges)
9. Vocabulary preview horizontal scroll
10. Weekly activity 7-day grid (teal/gray squares)

**Verification**: Visual comparison with original, all data displayed correctly

### Step 4: Talk Page & ChatWindow (Priority: HIGH)
**Goal**: Match the complex chat interface exactly
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Talk page layout: header + mode selector + expression card + chat area
2. ModeSelector: 3-button segmented control (teal/white, rounded-xl)
3. ChatWindow shell: situation bar + progress bar + word tip + messages + input
4. Empty state: breathing circle animation + CTA buttons
5. Message bubbles: User (teal, rounded-br-sm) + AI (white bordered, rounded-bl-sm)
6. Message content: 15px text, better expressions chips, learning tips, suggestions
7. AI message actions: speak, translate, pronunciation, bookmark buttons
8. TTS playing indicator (teal bouncing dots)
9. AI thinking indicator (gray bouncing dots)
10. Input area: voice/text mode toggle + pronunciation toggle
11. Voice input integration with VoiceRecorder
12. Text input with send button (12x12 teal circle)
13. STTConfirmationBanner: confidence bar, countdown, edit mode
14. ListeningIndicator: soundwave bars
15. SituationPicker: preset situations + custom input
16. Scenario progress bar (roleplay mode)

**Verification**: All 3 modes work, voice cycle functions, messages render correctly

### Step 5: Cards/Vocabulary (Priority: HIGH)
**Goal**: Full vocabulary page with quiz system
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Level selector (A1-C2 colored horizontal scroll)
2. Flashcard display: min-h-280px, rounded-3xl, 3D flip animation
3. Word display: 30px font-light + speaker button
4. Hidden/revealed meaning transition
5. Know/Don't Know action buttons
6. Expand button + expanded panel (idioms + sentences)
7. Saved words tab: toggle (words/sentences), stats grid, filter/sort, word list with mastery dots
8. QuizModeSelector: bottom sheet with mode cards, count selector, review toggle
9. WordQuizOverlay: progress bar, score circle with animation
10. FlashcardQuiz: 3D flip + 3 rating buttons
11. MultipleChoiceQuiz: 4 options with correct/wrong visual feedback
12. SpellingQuiz: text input with letter-by-letter check
13. ListeningQuiz: audio-only with input
14. GapFillQuiz: sentence with blank
15. TranslationQuiz: Korean to English
16. SentenceFlashcardQuiz + SentenceQuizOverlay

**Verification**: All quiz modes work, 3D flip smooth, level filtering works

### Step 6: Stats Dashboard (Priority: MEDIUM)
**Goal**: Rich statistics page with charts
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. InsightCard: dynamic messages based on stats
2. StreakHero: current + best streak display
3. DailyGoals: progress indicators for today
4. WeeklyBarChart: bar chart (use fl_chart or custom painter)
5. MonthlyHeatmap: calendar heatmap
6. TypeDonutChart: donut chart for learning types
7. HourlyPatternChart: hourly distribution chart
8. LevelRadarChart: radar chart for CEFR levels
9. WeekComparisonCard: this week vs last week with changes
10. RecentTimeline: chronological activity list
11. AchievementBadges: badge grid with locked/unlocked states

**Verification**: All 11 chart components render, data displays correctly

### Step 7: My Page (Priority: MEDIUM)
**Goal**: Complete settings and profile page
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Profile card: avatar + name + email (auth-aware)
2. Voice settings button -> TTSSettingsModal
3. App install button -> PWA guide (web only)
4. Update check button with loading/result states
5. Feedback link
6. App info section: version, build date
7. Release notes (collapsible list)
8. Logout button (red, conditional)

**Verification**: Settings work, modals open correctly

### Step 8: Other Pages (Priority: MEDIUM)
**Goal**: Complete remaining pages
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Daily expression page: expression card + example + collapsible sections + practice CTA
2. Create scenario: 3-step wizard (context -> chat -> review)
3. Feedback page: post list + write modal + detail modal + comments
4. Login page: Google OAuth + email form + toggle signup/signin

**Verification**: All pages render and function correctly

## Polish & Improvements

### Step 9: Animations & Micro-interactions (Priority: MEDIUM)
**Goal**: Match all animations from original
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Card tap scale animations (0.95-0.98)
2. Page transitions (fadeIn with translateY)
3. Bottom sheet slide-up animation
4. 3D card flip (perspective 1000px, rotateY)
5. Breathing circle animation (empty state)
6. Progress bar smooth transitions
7. Score circle animation (strokeDashoffset)
8. Bouncing dots loading animation
9. Skeleton loading (shimmer)
10. Collapsible section expand/collapse

**Verification**: Animations smooth at 60fps on all platforms

### Step 10: Improvements Documentation & Implementation (Priority: LOW)
**Goal**: Document and implement improvements over original
**Status**: [x] Complete (2026-02-08)

**Tasks**:
1. Create docs/improvements.md documenting:
   - Haptic feedback on interactions (Flutter advantage)
   - Platform-adaptive UI (Cupertino on iOS, Material on Android)
   - Offline mode with local caching (Flutter advantage)
   - Native-feeling page transitions
   - Better performance (no web overhead)
2. Implement approved improvements

**Verification**: Improvements documented and working

## Completion Criteria
- [x] All screens match original design (visual comparison)
- [x] All missing features implemented (quiz, stats, splash, etc.)
- [x] flutter analyze: 0 issues
- [x] flutter build web: SUCCESS (29.8s)
- [x] flutter build ios --no-codesign: SUCCESS (29.2s, 205.2MB)
- [x] flutter build macos: SUCCESS (108.5MB)
- [x] plan2.md updated after each step
