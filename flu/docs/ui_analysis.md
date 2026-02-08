# UI Analysis: EnPeak Web to Flutter

**Purpose**: Definitive reference for pixel-perfect Flutter reimplementation of the EnPeak Next.js web app.

**Source**: Analysis of Next.js codebase at `/Users/chulheewon/development/main_project/chatbot/enpeak/frontend`

**Last Updated**: 2026-02-08

---

## 1. Design System

### 1.1 Color Palette

#### Primary Colors
- **Primary Teal**: `#0D9488` (teal-600)
- **Primary Teal Hover**: `#0F766E` (teal-700)
- **Primary Teal Light**: `#14B8A6` (teal-500)

#### Background Colors
- **App Background**: `#faf9f7` (warm off-white)
- **Surface/Card**: `#ffffff` (white)
- **Input Background**: `#f5f5f5`

#### Text Colors
- **Text Primary**: `#1a1a1a`
- **Text Secondary**: `#8a8a8a`
- **Text Tertiary**: `#c5c5c5`
- **Text Link**: `#666666`

#### Border Colors
- **Border Light**: `#f0f0f0`
- **Border Medium**: `#e5e5e5`
- **Border Default**: `#ebebeb`

#### Accent Colors
- **Accent Coral**: `#F87171` (red-400)
- **Accent Green**: `#10b981` (emerald-500)
- **Accent Orange**: `#f59e0b` (amber-500)
- **Accent Purple**: `#8b5cf6` (violet-500)

#### Quiz Feedback Colors
- **Quiz Correct Background**: `#e8f5e9`
- **Quiz Correct Text**: `#2e7d32`
- **Quiz Correct Border**: `#c8e6c9`
- **Quiz Wrong Background**: `#fce4ec`
- **Quiz Wrong Text**: `#c62828`
- **Quiz Wrong Border**: `#f8bbd0`

#### Level Colors
- **A1**: `#22c55e` (green-500)
- **A2**: `#4ade80` (green-400)
- **B1**: `#eab308` (yellow-500)
- **B2**: `#f59e0b` (orange-500)
- **C1**: `#ef4444` (red-500)
- **C2**: `#a855f7` (purple-500)

#### Difficulty Badge Colors
- **Beginner Background**: `#e8f5e9`
- **Beginner Text**: `#2e7d32`
- **Intermediate Background**: `#fff3e0`
- **Intermediate Text**: `#e65100`
- **Advanced Background**: `#fce4ec`
- **Advanced Text**: `#c62828`

### 1.2 Typography

#### Font Family
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

#### Global Letter Spacing
- **Default**: `-0.01em` (applied globally for tighter, more refined look)

#### Font Sizes
- **10px**: Badges, tiny labels
- **11px**: Section labels, uppercase labels
- **12px**: Small text, captions
- **13px**: Card titles, secondary text
- **14px**: Body text, default
- **15px**: Message text in chat
- **17px**: Expression text
- **20px**: Meaning text, emphasis
- **22px**: Quiz word display, app title
- **30px**: Large display text (flashcard word)

#### Font Weights
- **300**: Light (word display on flashcards)
- **400**: Regular (body text)
- **500**: Medium (labels, buttons)
- **600**: Semibold (headings, emphasis)
- **700**: Bold (strong emphasis)

### 1.3 Spacing

#### Base Unit
- **4px** base unit

#### Common Values
- **2px**: Minimal spacing
- **4px**: Tight spacing
- **6px**: Small spacing
- **8px**: Default small gap
- **12px**: Medium spacing
- **16px**: Default padding
- **20px**: Large padding
- **24px**: Extra large padding
- **32px**: Section spacing
- **96px**: Bottom navigation clearance

### 1.4 Border Radius

- **4px**: Small (sm) - badges, small buttons
- **8px**: Large (lg) - inputs, small cards
- **10px**: Tab buttons
- **12px**: Extra large (xl) - cards
- **16px**: 2xl - large cards
- **24px**: 3xl - flashcards, major cards
- **9999px**: Full (pill shape) - badges, pills

### 1.5 Shadows

#### Card Shadow
```
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
```

#### Medium Shadow
```
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

#### FAB Shadow
```
box-shadow: 0 4px 20px rgba(13, 148, 136, 0.35);
```

### 1.6 Animations

#### Fade In
- **Duration**: 0.4s
- **Easing**: ease-out
- **Transform**: translateY(8px) to translateY(0)
- **Opacity**: 0 to 1

#### Breathe (Idle State)
- **Duration**: 4s
- **Easing**: ease-in-out
- **Iteration**: infinite
- **Transform**: scale(1) to scale(1.05)

#### Pulse Soft
- **Duration**: 3s
- **Easing**: ease-in-out
- **Iteration**: infinite
- **Opacity**: 0.3 to 0.1

#### Slide Up (Bottom Sheet)
- **Duration**: 0.3s
- **Easing**: ease-out
- **Transform**: translateY(100%) to translateY(0)

#### 3D Card Flip
- **Duration**: 500ms
- **Transform**: rotateY(0deg) to rotateY(180deg)
- **Perspective**: 1000px
- **Backface Visibility**: hidden

#### Button Press
- **Active State**: scale(0.95) to scale(0.98)
- **Duration**: instant (no transition)

#### Progress Bar
- **Transition**: all 500ms

#### Score Circle
- **Transition**: all 1000ms ease-out

---

## 2. Shared Components

### 2.1 BottomNav

**File**: `frontend/src/components/BottomNav.tsx`

**Structure**:
- 2 navigation tabs (Home, Stats) + 1 centered FAB
- Fixed position at bottom
- Safe area support (pb-safe)

**Styling**:
- Background: `#faf9f7`
- Border top: `1px solid #f0f0f0`
- Height: Auto with safe area
- Padding: `12px 16px` + safe area bottom

**Tab Styling**:
- Inactive: `#8a8a8a` text, house/chart icons
- Active: `#0D9488` text, filled icons
- Font size: `10px`
- Font weight: `500`
- Layout: Vertical (icon + label)
- Transition: `color 200ms`

**FAB (Floating Action Button)**:
- Size: `72px` diameter
- Background: `#0D9488`
- Icon: Microphone (white)
- Position: Centered between tabs
- Shadow: `0 4px 20px rgba(13, 148, 136, 0.35)`
- Active state: `scale(0.95)`
- Border radius: Full circle

**Behavior**:
- Highlights current route
- FAB navigates to `/talk`
- Tabs navigate to `/` and `/stats`

### 2.2 AppShell

**File**: `frontend/src/components/AppShell.tsx`

**Purpose**: Root layout wrapper with auth routing and loading states

**Structure**:
- SplashScreen (initial load)
- Auth check and routing
- Main content area
- BottomNav (conditional)

**Loading States**:
- Initial: SplashScreen with logo + spinner
- Auth loading: Spinner overlay
- Route transition: Fade animation

**Routing Logic**:
- Unauthenticated: Redirect to `/login`
- Authenticated: Show requested page
- Protected routes: All except `/login`

### 2.3 SplashScreen

**File**: `frontend/src/components/SplashScreen.tsx`

**Structure**:
- Full screen overlay
- Centered logo
- Spinner below logo
- Fade-out animation on dismiss

**Styling**:
- Background: `#faf9f7`
- Logo size: `80px`
- Spinner: Teal color
- Animation: fadeOut 0.5s ease-out

### 2.4 Section Header Pattern

**Usage**: Consistent section headers across app

**Structure**:
```
[Teal Bar] SECTION LABEL
```

**Teal Bar**:
- Width: `4px`
- Height: `16px`
- Background: `#0D9488`
- Border radius: `9999px` (full)

**Label**:
- Font size: `11px`
- Font weight: `500`
- Color: `#8a8a8a`
- Text transform: uppercase
- Letter spacing: `0.05em` (wider)

**Layout**:
- Flexbox horizontal
- Gap: `8px`
- Align items: center

### 2.5 Card Pattern

**Usage**: Standard card component across app

**Styling**:
```css
background: white;
border-radius: 16px;
padding: 20px;
border: 1px solid #ebebeb;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
transition: all 200ms;
```

**Active State**:
```css
transform: scale(0.98);
```

**Variants**:
- **Default**: As above
- **Teal Background**: `background: #0D9488`, white text
- **No Border**: Remove border, keep shadow
- **Flat**: Remove shadow

---

## 3. Page-by-Page Widget Analysis

### 3.1 Home Dashboard (/)

**File**: `frontend/src/app/page.tsx`

**Layout Structure**:
```
SafeAreaSpacer (top)
Header
  - Greeting
  - App Title
  - Avatar
Streak & Session Badges (conditional)
Quick Mode Cards (3-column grid)
Daily Challenge Card
Recent Activity Card
Quick Quiz
Today's Expression Card
Recommended Scenarios (horizontal scroll)
Vocabulary Preview (horizontal scroll)
Weekly Activity Grid
BottomNav
```

#### 3.1.1 Safe Area Spacer

**Purpose**: Push content below notch/status bar

**Styling**:
- Height: `env(safe-area-inset-top)` or `20px` fallback
- Background: `#faf9f7`

#### 3.1.2 Header

**Structure**:
- Greeting text (left)
- App title "Flu" (center)
- Avatar (right)

**Greeting**:
- Font size: `13px`
- Color: `#8a8a8a`
- Text: "안녕하세요, {name}님" or "환영합니다"

**App Title**:
- Font size: `22px`
- Font weight: `600`
- Color: `#1a1a1a`
- Text: "Flu"

**Avatar**:
- Size: `40px` diameter
- Border radius: Full circle
- Guest: Teal background with user icon
- Logged in: Profile image with `1px solid #ebebeb` border

**Layout**:
- Padding: `16px`
- Flexbox: space-between
- Align items: center

#### 3.1.3 Streak & Session Badges

**Conditional**: Only show if user has streak or recent session

**Streak Badge**:
- Background: `#fff3e0`
- Text color: `#e65100`
- Icon: Flame
- Text: "{count}일 연속"
- Font size: `12px`
- Padding: `6px 12px`
- Border radius: `9999px`

**Session Badge**:
- Background: `#e8f5e9`
- Text color: `#2e7d32`
- Icon: Clock
- Text: "오늘 {count}회 학습"
- Font size: `12px`
- Padding: `6px 12px`
- Border radius: `9999px`

**Layout**:
- Horizontal flex
- Gap: `8px`
- Margin: `0 16px 16px`

#### 3.1.4 Quick Mode Cards

**Structure**: 3-column grid

**Grid Styling**:
- Columns: 3 equal
- Gap: `8px`
- Padding: `0 16px`
- Margin bottom: `24px`

**Card Styling**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`
- Active: `scale(0.98)`

**Card Content**:
- Icon container: `40px` square, `#0D9488` background, `12px` border radius
- Icon: White, `20px` size
- Label: `13px`, `500` weight, `#1a1a1a`, margin top `8px`

**Cards**:
1. **Free Chat**: Message circle icon, "자유 대화"
2. **Expression**: Lightbulb icon, "표현 연습"
3. **Roleplay**: Users icon, "롤플레이"

#### 3.1.5 Daily Challenge Card

**Conditional**: Show if daily goals exist

**Card Styling**:
- Background: `#0D9488` (teal)
- Border radius: `16px`
- Padding: `20px`
- Margin: `0 16px 24px`
- Color: White

**Header**:
- Title: "오늘의 도전" (14px, 600 weight)
- Subtitle: "목표를 달성하세요" (12px, opacity 0.9)

**Progress Bars** (3 types):
- Conversation: "대화 {current}/{target}회"
- Vocabulary: "단어 {current}/{target}개"
- Time: "학습 {current}/{target}분"

**Progress Bar Styling**:
- Background: `rgba(255, 255, 255, 0.2)`
- Fill: White
- Height: `6px`
- Border radius: `9999px`
- Transition: `width 500ms`

**Goal Cards** (below progress):
- Background: `rgba(255, 255, 255, 0.15)`
- Border radius: `8px`
- Padding: `12px`
- 3-column grid
- Icon + number + label

#### 3.1.6 Recent Activity Card

**Conditional**: Show if recent activity exists

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Header**:
- Section header pattern
- Label: "최근 활동"

**Activity Item**:
- Icon: `32px` circle, teal background
- Title: `14px`, `500` weight, `#1a1a1a`
- Time: `12px`, `#8a8a8a`, "X분 전"
- Action pill: "이어하기", teal text, `12px`, `#f0f0f0` background, `6px 12px` padding

**Layout**:
- Horizontal flex
- Gap: `12px`
- Align items: center

#### 3.1.7 Quick Quiz

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Accent Bar**:
- Width: `4px`
- Height: `100%`
- Background: `#f59e0b` (orange)
- Position: Absolute left
- Border radius: `9999px 0 0 9999px`

**Word Display**:
- Font size: `22px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `16px`

**Options** (3 buttons):
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Margin bottom: `8px`
- Active: `scale(0.98)`

**Correct State**:
- Background: `#e8f5e9`
- Border: `1px solid #c8e6c9`
- Color: `#2e7d32`

**Wrong State**:
- Background: `#fce4ec`
- Border: `1px solid #f8bbd0`
- Color: `#c62828`

**Next Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Font weight: `500`
- Margin top: `16px`

#### 3.1.8 Today's Expression Card

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Accent Bar**:
- Same as Quick Quiz but `#8b5cf6` (purple)

**Expression Text**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `8px`

**Meaning Text**:
- Font size: `14px`
- Color: `#666666`

**Chevron Icon**:
- Position: Absolute right
- Color: `#c5c5c5`
- Size: `20px`

#### 3.1.9 Recommended Scenarios

**Section Header**:
- Standard section header pattern
- Label: "추천 시나리오"
- Margin: `0 16px 12px`

**Horizontal Scroll**:
- Overflow-x: scroll
- Padding: `0 16px`
- Gap: `12px`
- Scroll snap: x mandatory
- Hide scrollbar

**Scenario Card**:
- Width: `150px` (fixed)
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`
- Scroll snap align: start

**Card Content**:
- Icon: `32px`, teal background, `8px` border radius
- Title: `13px`, `500` weight, `#1a1a1a`, margin top `8px`
- Difficulty badge: `10px`, colored background, `4px 8px` padding, `4px` border radius

#### 3.1.10 Vocabulary Preview

**Section Header**:
- Standard section header pattern
- Label: "단어 미리보기"
- Margin: `0 16px 12px`

**Horizontal Scroll**:
- Same as Recommended Scenarios

**Word Card**:
- Width: `120px` (fixed)
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`

**Card Content**:
- Word: `17px`, `600` weight, `#1a1a1a`
- Level badge: `10px`, colored background, `4px 8px` padding, `4px` border radius, margin top `8px`

#### 3.1.11 Weekly Activity Grid

**Section Header**:
- Standard section header pattern
- Label: "주간 활동"
- Margin: `0 16px 12px`

**Grid**:
- 7 columns (Mon-Sun)
- Gap: `4px`
- Padding: `0 16px`
- Margin bottom: `96px` (bottom nav clearance)

**Day Square**:
- Aspect ratio: 1:1
- Border radius: `4px`
- Background: `#f5f5f5` (inactive) or `#0D9488` (active)
- Label: `10px`, `#8a8a8a` or white, centered

---

### 3.2 Talk Page (/talk)

**File**: `frontend/src/app/talk/page.tsx`

**Layout Structure**:
```
Header (back button + title)
ModeSelector (3 tabs)
Expression Card (conditional, expression mode)
RoleplayPicker (conditional, roleplay mode)
ChatWindow (main component)
```

#### 3.2.1 Header

**Styling**:
- Background: `#faf9f7`
- Border bottom: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area top

**Back Button**:
- Icon: Chevron left
- Size: `24px`
- Color: `#1a1a1a`
- Active: `scale(0.95)`

**Title**:
- Text: "Talk"
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Position: Centered

#### 3.2.2 ModeSelector

**File**: `frontend/src/components/ModeSelector.tsx`

**Structure**: 3-button segmented control

**Container**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `4px`
- Margin: `16px`
- Display: Flex
- Gap: `4px`

**Button**:
- Flex: 1
- Padding: `12px`
- Border radius: `8px`
- Font size: `14px`
- Font weight: `500`
- Transition: all 200ms

**Inactive State**:
- Background: Transparent
- Color: `#8a8a8a`

**Active State**:
- Background: `#0D9488`
- Color: White

**Modes**:
1. "자유 대화" (free)
2. "표현 연습" (expression)
3. "롤플레이" (roleplay)

#### 3.2.3 Expression Card

**Conditional**: Only show in expression mode

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Expression Text**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `8px`

**Meaning Text**:
- Font size: `14px`
- Color: `#666666`
- Margin bottom: `12px`

**Refresh Button**:
- Icon: Refresh
- Size: `20px`
- Color: `#0D9488`
- Position: Absolute top right
- Active: rotate animation

#### 3.2.4 RoleplayPicker

**File**: `frontend/src/components/RoleplayPicker.tsx`

**Conditional**: Only show in roleplay mode

**Container**:
- Margin: `0 16px 16px`

**Filter Pills**:
- Horizontal scroll
- Gap: `8px`
- Margin bottom: `12px`

**Pill Styling**:
- Background: `#f5f5f5` (inactive) or `#0D9488` (active)
- Color: `#666666` (inactive) or white (active)
- Padding: `6px 12px`
- Border radius: `9999px`
- Font size: `12px`
- Font weight: `500`

**Scenario List**:
- Vertical stack
- Gap: `8px`

**Scenario Card**:
- Standard card pattern
- Padding: `16px`

**Card Content**:
- Title: `14px`, `600` weight, `#1a1a1a`
- Description: `12px`, `#666666`, margin top `4px`
- Badges: Difficulty + category, `10px`, margin top `8px`

#### 3.2.5 ChatWindow

**File**: `frontend/src/components/ChatWindow.tsx` (1358 lines - THE CORE COMPONENT)

**Layout Structure**:
```
Situation Label Bar (conditional)
Scenario Progress Bar (conditional)
Word Tip Banner (conditional, dismissible)
Messages Container
  - Empty State (breathing circle)
  - Message Bubbles (user/AI)
  - Message Extras (better expressions, tips, suggestions, translation, word lookup)
  - TTS Playing Indicator
  - AI Thinking Indicator
Input Area
  - Mode Toggle (voice/text)
  - Pronunciation Toggle
  - VoiceRecorder
  - Text Input + Send Button
STT Confirmation Banner
Listening Indicator
Pronunciation Practice Sheet
Word Popup
```

##### 3.2.5.1 Situation Label Bar

**Conditional**: Show in roleplay mode with active scenario

**Styling**:
- Background: `#0D9488`
- Color: White
- Padding: `8px 16px`
- Font size: `12px`
- Font weight: `500`
- Text: "{scenario.title} - Stage {currentStage}/{totalStages}"

##### 3.2.5.2 Scenario Progress Bar

**Conditional**: Show in roleplay mode

**Container**:
- Background: `#f5f5f5`
- Height: `4px`
- Position: Relative

**Fill**:
- Background: `#0D9488`
- Height: `100%`
- Width: `{progress}%`
- Transition: width 500ms

**Stage Markers**:
- Position: Absolute
- Background: White
- Border: `2px solid #0D9488` (completed) or `#e5e5e5` (incomplete)
- Size: `12px`
- Border radius: Full
- Top: `-4px`

##### 3.2.5.3 Word Tip Banner

**Conditional**: Show if learning tip exists, dismissible

**Styling**:
- Background: `#fff3e0`
- Border: `1px solid #f59e0b`
- Border radius: `8px`
- Padding: `12px`
- Margin: `16px`

**Icon**:
- Lightbulb
- Color: `#f59e0b`
- Size: `20px`

**Text**:
- Font size: `13px`
- Color: `#e65100`

**Close Button**:
- Icon: X
- Size: `16px`
- Color: `#e65100`
- Position: Absolute top right

##### 3.2.5.4 Messages Container

**Styling**:
- Flex: 1
- Overflow-y: scroll
- Padding: `16px`
- Background: `#faf9f7`

**Empty State**:
- Centered content
- Breathing circle animation (scale 1 to 1.05, 4s infinite)
- Circle: `80px`, `#0D9488` with opacity 0.1
- Text: "대화를 시작해보세요", `14px`, `#8a8a8a`, margin top `16px`

##### 3.2.5.5 Message Bubbles

**User Message**:
- Background: `#0D9488`
- Color: White
- Border radius: `16px 16px 4px 16px` (rounded-br-sm)
- Padding: `12px 16px`
- Max width: `80%`
- Align: Right
- Font size: `15px`
- Line height: `1.5`
- Margin bottom: `8px`

**AI Message**:
- Background: White
- Color: `#1a1a1a`
- Border: `1px solid #ebebeb`
- Border radius: `16px 16px 16px 4px` (rounded-bl-sm)
- Padding: `12px 16px`
- Max width: `80%`
- Align: Left
- Font size: `15px`
- Line height: `1.5`
- Margin bottom: `8px`

**Timestamp**:
- Font size: `11px`
- Color: `#c5c5c5`
- Margin top: `4px`

##### 3.2.5.6 Message Extras

**Better Expressions Panel**:
- Background: `#f0fdf4`
- Border: `1px solid #86efac`
- Border radius: `8px`
- Padding: `12px`
- Margin top: `8px`

**Header**:
- Icon: Sparkles
- Text: "더 나은 표현"
- Font size: `12px`
- Font weight: `500`
- Color: `#16a34a`

**Expression Item**:
- Font size: `13px`
- Color: `#166534`
- Padding: `6px 0`
- Border bottom: `1px solid #dcfce7` (except last)

**Learning Tips Panel**:
- Background: `#fef3c7`
- Border: `1px solid #fcd34d`
- Border radius: `8px`
- Padding: `12px`
- Margin top: `8px`

**Header**:
- Icon: Lightbulb
- Text: "학습 팁"
- Font size: `12px`
- Font weight: `500`
- Color: `#d97706`

**Tip Text**:
- Font size: `13px`
- Color: `#92400e`

**Suggestions Panel**:
- Background: `#ede9fe`
- Border: `1px solid #c4b5fd`
- Border radius: `8px`
- Padding: `12px`
- Margin top: `8px`

**Header**:
- Icon: Message square
- Text: "추천 응답"
- Font size: `12px`
- Font weight: `500`
- Color: `#7c3aed`

**Suggestion Button**:
- Background: White
- Border: `1px solid #c4b5fd`
- Border radius: `6px`
- Padding: `8px 12px`
- Font size: `13px`
- Color: `#6d28d9`
- Margin: `4px 0`
- Active: `scale(0.98)`

**Translation Toggle**:
- Font size: `12px`
- Color: `#0D9488`
- Margin top: `8px`
- Icon: Globe
- Text: "번역 보기" / "번역 숨기기"

**Translation Text**:
- Font size: `13px`
- Color: `#666666`
- Font style: italic
- Margin top: `4px`

**Word Lookup**:
- Inline word highlighting
- Color: `#0D9488`
- Text decoration: underline dotted
- Cursor: pointer
- On click: Show WordPopup

##### 3.2.5.7 TTS Playing Indicator

**Conditional**: Show when AI message is being read aloud

**Styling**:
- Background: `#e0f2f1`
- Border radius: `9999px`
- Padding: `6px 12px`
- Display: inline-flex
- Gap: `6px`
- Align items: center

**Dots** (3 bouncing dots):
- Size: `6px`
- Background: `#0D9488`
- Border radius: Full
- Animation: bounce 1.4s infinite ease-in-out
- Delay: 0s, 0.2s, 0.4s

**Text**:
- Font size: `12px`
- Color: `#0D9488`
- Text: "읽는 중..."

##### 3.2.5.8 AI Thinking Indicator

**Conditional**: Show when waiting for AI response

**Styling**:
- Same as TTS indicator but gray
- Background: `#f5f5f5`
- Dots: `#8a8a8a`
- Text: `#8a8a8a`, "생각 중..."

##### 3.2.5.9 Input Area

**Container**:
- Background: White
- Border top: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area bottom

**Mode Toggle** (voice/text):
- 2-button segmented control
- Background: `#f5f5f5`
- Border radius: `8px`
- Padding: `2px`
- Margin bottom: `8px`

**Toggle Button**:
- Padding: `6px 12px`
- Border radius: `6px`
- Font size: `12px`
- Font weight: `500`
- Inactive: Transparent, `#8a8a8a`
- Active: White, `#1a1a1a`

**Pronunciation Toggle**:
- Checkbox with label
- Font size: `12px`
- Color: `#666666`
- Margin bottom: `8px`

**VoiceRecorder** (voice mode):
- Large circular button
- Size: `64px`
- Background: `#0D9488`
- Icon: Microphone (white)
- Active: `scale(0.95)`, pulse animation
- Shadow: `0 4px 20px rgba(13, 148, 136, 0.35)`

**Text Input** (text mode):
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Placeholder: "메시지를 입력하세요..."
- Flex: 1

**Send Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `8px`
- Padding: `12px 16px`
- Font size: `14px`
- Font weight: `500`
- Icon: Send
- Disabled: `#c5c5c5` background

##### 3.2.5.10 STT Confirmation Banner

**File**: Part of ChatWindow.tsx

**Conditional**: Show after voice input, before sending

**Styling**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Margin: `16px`
- Shadow: `0 4px 6px rgba(0, 0, 0, 0.1)`

**Confidence Display**:
- Progress bar
- Background: `#f5f5f5`
- Fill: `#0D9488`
- Height: `4px`
- Border radius: `9999px`
- Margin bottom: `8px`

**Transcribed Text**:
- Font size: `15px`
- Color: `#1a1a1a`
- Margin bottom: `12px`
- Editable: Yes (contenteditable)

**Auto-send Countdown**:
- Font size: `12px`
- Color: `#8a8a8a`
- Text: "자동 전송까지 {seconds}초..."
- Circular progress indicator

**Action Buttons**:
- Edit: Icon button, pencil icon
- Send: Teal button, "전송"
- Cancel: Gray button, "취소"

##### 3.2.5.11 Listening Indicator

**File**: Part of ChatWindow.tsx

**Conditional**: Show during voice recording

**Styling**:
- Position: Fixed center
- Background: White
- Border radius: `16px`
- Padding: `24px`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.15)`

**Soundwave Bars** (5 bars):
- Width: `4px`
- Height: Variable based on audio level
- Background: `#0D9488`
- Border radius: `9999px`
- Gap: `4px`
- Animation: Audio level reactive

**Text**:
- Font size: `14px`
- Color: `#1a1a1a`
- Text: "듣고 있어요..."
- Margin top: `16px`

**Cancel Button**:
- Font size: `13px`
- Color: `#666666`
- Margin top: `8px`

##### 3.2.5.12 Pronunciation Practice Sheet

**File**: Part of ChatWindow.tsx

**Conditional**: Show when pronunciation toggle is on

**Styling**:
- Position: Fixed bottom
- Background: White
- Border radius: `16px 16px 0 0`
- Padding: `24px`
- Shadow: `0 -4px 24px rgba(0, 0, 0, 0.1)`
- Animation: slide-up 0.3s

**Header**:
- Title: "발음 연습"
- Font size: `17px`
- Font weight: `600`
- Close button: X icon, top right

**Mode Toggle** (full/blank):
- 2-button segmented control
- "전체 보기" / "빈칸 채우기"

**Target Sentence**:
- Font size: `17px`
- Color: `#1a1a1a`
- Line height: `1.6`
- Margin: `16px 0`
- Blank mode: Words replaced with underscores

**Your Pronunciation**:
- Font size: `15px`
- Color: `#666666`
- Background: `#f5f5f5`
- Padding: `12px`
- Border radius: `8px`
- Margin bottom: `16px`

**Scoring** (Levenshtein distance):
- Progress bar
- Background: `#f5f5f5`
- Fill: Gradient from red to green based on score
- Height: `8px`
- Border radius: `9999px`
- Percentage: `14px`, `600` weight

**Try Again Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Font weight: `500`
- Full width

##### 3.2.5.13 Word Popup

**File**: Part of ChatWindow.tsx

**Conditional**: Show when user clicks on a word in message

**Styling**:
- Position: Absolute (near clicked word)
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Max width: `280px`

**Word**:
- Font size: `20px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `8px`

**Pronunciation**:
- Font size: `13px`
- Color: `#666666`
- Margin bottom: `4px`

**Meaning**:
- Font size: `14px`
- Color: `#1a1a1a`
- Margin bottom: `12px`

**Example Sentence**:
- Font size: `13px`
- Color: `#666666`
- Font style: italic
- Margin bottom: `12px`

**Save Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `6px`
- Padding: `8px 12px`
- Font size: `13px`
- Font weight: `500`
- Icon: Bookmark
- Full width

**Close Button**:
- Position: Absolute top right
- Icon: X
- Size: `16px`
- Color: `#8a8a8a`

---

### 3.3 Cards/Vocabulary Page (/cards)

**File**: `frontend/src/app/cards/page.tsx`

**Layout Structure**:
```
Header (back + title)
Tab Selector (Practice / Saved)
[Practice Tab]
  - Level Selector (A1-C2)
  - Flashcard Display
  - Action Buttons (모르겠어요 / 알아요)
  - Expand Button
  - Expanded Panel (idioms + sentences)
[Saved Tab]
  - Toggle (Words / Sentences)
  - Stats Summary (3-col grid)
  - Filter/Sort Buttons
  - Word List with Mastery Dots
Quiz System (10 components)
```

#### 3.3.1 Header

**Same as Talk page header**

#### 3.3.2 Tab Selector

**Structure**: 2-tab segmented control

**Container**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `4px`
- Margin: `16px`

**Tab Button**:
- Flex: 1
- Padding: `10px`
- Border radius: `8px`
- Font size: `14px`
- Font weight: `500`
- Inactive: Transparent, `#8a8a8a`
- Active: `#0D9488`, white

**Tabs**:
1. "연습하기" (practice)
2. "저장한 단어" (saved)

#### 3.3.3 Level Selector

**Container**:
- Horizontal scroll
- Padding: `0 16px`
- Gap: `8px`
- Margin bottom: `16px`

**Level Button**:
- Padding: `8px 16px`
- Border radius: `9999px`
- Font size: `13px`
- Font weight: `500`
- Border: `1px solid #e5e5e5`
- Inactive: White background, `#666666` text
- Active: Colored background (level color), white text

**Levels**:
- A1: `#22c55e`
- A2: `#4ade80`
- B1: `#eab308`
- B2: `#f59e0b`
- C1: `#ef4444`
- C2: `#a855f7`

#### 3.3.4 Flashcard Display

**Container**:
- Min height: `280px`
- Margin: `0 16px 24px`
- Perspective: `1000px`

**Card**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `24px`
- Padding: `32px`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.08)`
- Transform style: preserve-3d
- Transition: transform 500ms

**Front Face**:
- Word: `30px`, `300` weight (light), `#1a1a1a`, centered
- Speaker button: `32px` circle, `#f5f5f5` background, volume icon, bottom right

**Back Face**:
- Transform: rotateY(180deg)
- Backface visibility: hidden
- Meaning: `20px`, `500` weight, `#1a1a1a`, centered
- Level badge: Top right, colored, `10px`

**Flip Animation**:
- On click: rotateY(180deg)
- Duration: 500ms
- Easing: ease-in-out

**Hidden/Revealed State**:
- Hidden: Blur filter, "탭하여 확인"
- Revealed: No blur

#### 3.3.5 Action Buttons

**Container**:
- Flex horizontal
- Gap: `12px`
- Padding: `0 16px`
- Margin bottom: `16px`

**모르겠어요 Button**:
- Flex: 1
- Background: `#f5f5f5`
- Color: `#666666`
- Border: `1px solid #e5e5e5`
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Active: `scale(0.98)`

**알아요 Button**:
- Flex: 1
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Active: `scale(0.98)`

#### 3.3.6 Expand Button

**Styling**:
- Background: White
- Border: `2px solid #0D9488`
- Border radius: `12px`
- Padding: `12px`
- Margin: `0 16px 16px`
- Font size: `14px`
- Font weight: `500`
- Color: `#0D9488`
- Icon: Zap (lightning)
- Text: "숙어 & 예문 확장"
- Active: `scale(0.98)`

#### 3.3.7 Expanded Panel

**Conditional**: Show after expand button clicked

**Container**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `16px`
- Padding: `20px`
- Margin: `0 16px 24px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`

**Section Header**:
- Standard section header pattern
- Labels: "관련 숙어" / "예문"

**Idiom Item**:
- Font size: `14px`
- Color: `#1a1a1a`
- Padding: `12px 0`
- Border bottom: `1px solid #f0f0f0` (except last)

**Idiom Text**:
- Font weight: `500`
- Margin bottom: `4px`

**Idiom Meaning**:
- Font size: `13px`
- Color: `#666666`

**Sentence Item**:
- Same as idiom item
- English sentence + Korean translation

#### 3.3.8 Saved Words Tab

**Toggle** (Words / Sentences):
- 2-button segmented control
- Same styling as tab selector

**Stats Summary**:
- 3-column grid
- Gap: `12px`
- Padding: `16px`
- Margin bottom: `16px`

**Stat Card**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Text align: center

**Stat Number**:
- Font size: `24px`
- Font weight: `600`
- Color: `#0D9488`

**Stat Label**:
- Font size: `12px`
- Color: `#8a8a8a`
- Margin top: `4px`

**Stats**:
1. Total words
2. Mastered (100% mastery)
3. Learning (< 100% mastery)

**Filter/Sort Buttons**:
- Horizontal flex
- Gap: `8px`
- Padding: `0 16px`
- Margin bottom: `16px`

**Filter Button**:
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `8px 12px`
- Font size: `13px`
- Color: `#666666`
- Icon: Filter
- Active: Teal background, white text

**Sort Dropdown**:
- Same styling as filter button
- Icon: Arrow up/down
- Options: Date, Alphabetical, Mastery

**Word List**:
- Vertical stack
- Gap: `8px`
- Padding: `0 16px`

**Word List Item**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`
- Active: `scale(0.98)`

**Word**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`

**Meaning**:
- Font size: `14px`
- Color: `#666666`
- Margin top: `4px`

**Mastery Dots** (5 dots):
- Size: `8px`
- Border radius: Full
- Gap: `4px`
- Filled: `#0D9488`
- Empty: `#e5e5e5`
- Margin top: `8px`

#### 3.3.9 Quiz System (10 Components)

**Files**: `frontend/src/components/quiz/*.tsx`

##### 3.3.9.1 QuizModeSelector

**File**: `QuizModeSelector.tsx`

**Type**: Bottom sheet modal

**Container**:
- Position: Fixed bottom
- Background: White
- Border radius: `16px 16px 0 0`
- Padding: `24px`
- Shadow: `0 -4px 24px rgba(0, 0, 0, 0.1)`
- Animation: slide-up 0.3s

**Header**:
- Title: "퀴즈 모드 선택"
- Font size: `20px`
- Font weight: `600`
- Close button: X icon

**Mode Grid**:
- 2-column grid
- Gap: `12px`
- Margin top: `16px`

**Mode Card**:
- Background: White
- Border: `2px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Active: `scale(0.98)`, border `#0D9488`

**Icon**:
- Size: `32px`
- Color: `#0D9488`
- Margin bottom: `8px`

**Title**:
- Font size: `14px`
- Font weight: `600`
- Color: `#1a1a1a`

**Description**:
- Font size: `12px`
- Color: `#8a8a8a`
- Margin top: `4px`

**Modes**:
1. Flashcard (card icon)
2. Multiple Choice (list icon)
3. Spelling (keyboard icon)
4. Listening (headphones icon)
5. Gap Fill (text icon)
6. Translation (globe icon)

##### 3.3.9.2 WordQuizOverlay

**File**: `WordQuizOverlay.tsx`

**Type**: Full screen overlay

**Container**:
- Position: Fixed full screen
- Background: `#faf9f7`
- Z-index: 50

**Header**:
- Background: White
- Border bottom: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area top

**Close Button**:
- Icon: X
- Size: `24px`
- Color: `#1a1a1a`
- Position: Left

**Progress**:
- Text: "{current}/{total}"
- Font size: `14px`
- Color: `#666666`
- Position: Center

**Progress Bar**:
- Background: `#f0f0f0`
- Fill: `#0D9488`
- Height: `4px`
- Transition: width 500ms

**Quiz Content Area**:
- Flex: 1
- Padding: `16px`
- Overflow: scroll

**Results Screen**:
- Centered content
- Score circle: `120px`, stroke `#0D9488`, transition 1000ms
- Score text: `30px`, `600` weight
- Message: `17px`, `#666666`
- Retry button: Teal, full width
- Back button: Gray, full width

##### 3.3.9.3 FlashcardQuiz

**File**: `FlashcardQuiz.tsx`

**Card**:
- Same as main flashcard display
- 3D flip animation
- Min height: `320px`

**Rating Buttons** (4 buttons):
- Horizontal flex
- Gap: `8px`
- Margin top: `24px`

**Button Styling**:
- Flex: 1
- Padding: `12px`
- Border radius: `8px`
- Font size: `13px`
- Font weight: `500`
- Active: `scale(0.98)`

**Ratings**:
1. "다시" - Red background `#ef4444`
2. "어려움" - Orange background `#f59e0b`
3. "보통" - Yellow background `#eab308`
4. "쉬움" - Green background `#22c55e`

##### 3.3.9.4 MultipleChoiceQuiz

**File**: `MultipleChoiceQuiz.tsx`

**Question Card**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `16px`
- Padding: `24px`
- Margin bottom: `24px`

**Word**:
- Font size: `22px`
- Font weight: `600`
- Color: `#1a1a1a`
- Text align: center
- Margin bottom: `24px`

**Options** (4 buttons):
- Vertical stack
- Gap: `12px`

**Option Button**:
- Background: `#f5f5f5`
- Border: `2px solid #e5e5e5`
- Border radius: `12px`
- Padding: `16px`
- Font size: `14px`
- Text align: left
- Active: `scale(0.98)`

**Correct State**:
- Background: `#e8f5e9`
- Border: `2px solid #c8e6c9`
- Color: `#2e7d32`
- Icon: Check circle (green)

**Wrong State**:
- Background: `#fce4ec`
- Border: `2px solid #f8bbd0`
- Color: `#c62828`
- Icon: X circle (red)

**Next Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Full width
- Margin top: `16px`

##### 3.3.9.5 SpellingQuiz

**File**: `SpellingQuiz.tsx`

**Question Card**:
- Same as MultipleChoiceQuiz

**Meaning Display**:
- Font size: `17px`
- Color: `#1a1a1a`
- Text align: center
- Margin bottom: `24px`

**Speaker Button**:
- Size: `48px` circle
- Background: `#0D9488`
- Icon: Volume (white)
- Margin: `0 auto 24px`
- Active: `scale(0.95)`

**Input Field**:
- Background: `#f5f5f5`
- Border: `2px solid #e5e5e5`
- Border radius: `12px`
- Padding: `16px`
- Font size: `17px`
- Text align: center
- Margin bottom: `16px`

**Correct State**:
- Border: `2px solid #c8e6c9`
- Background: `#e8f5e9`

**Wrong State**:
- Border: `2px solid #f8bbd0`
- Background: `#fce4ec`

**Feedback Text**:
- Font size: `14px`
- Color: `#2e7d32` (correct) or `#c62828` (wrong)
- Text align: center
- Margin bottom: `16px`

**Check Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Full width

##### 3.3.9.6 ListeningQuiz

**File**: `ListeningQuiz.tsx`

**Same as SpellingQuiz but**:
- No meaning display
- Larger speaker button: `64px`
- Instruction text: "단어를 듣고 입력하세요"
- Font size: `14px`, `#666666`

##### 3.3.9.7 GapFillQuiz

**File**: `GapFillQuiz.tsx`

**Question Card**:
- Same as MultipleChoiceQuiz

**Sentence Display**:
- Font size: `17px`
- Color: `#1a1a1a`
- Line height: `1.6`
- Margin bottom: `24px`

**Gap** (blank):
- Display: inline-block
- Min width: `80px`
- Border bottom: `2px solid #0D9488`
- Padding: `0 8px`
- Margin: `0 4px`

**Input Field**:
- Same as SpellingQuiz

**Hint Button**:
- Background: `#fff3e0`
- Border: `1px solid #f59e0b`
- Border radius: `8px`
- Padding: `8px 12px`
- Font size: `13px`
- Color: `#e65100`
- Icon: Lightbulb
- Margin bottom: `16px`

##### 3.3.9.8 TranslationQuiz

**File**: `TranslationQuiz.tsx`

**Question Card**:
- Same as MultipleChoiceQuiz

**English Sentence**:
- Font size: `17px`
- Color: `#1a1a1a`
- Line height: `1.6`
- Margin bottom: `24px`

**Textarea**:
- Background: `#f5f5f5`
- Border: `2px solid #e5e5e5`
- Border radius: `12px`
- Padding: `16px`
- Font size: `15px`
- Min height: `120px`
- Resize: vertical
- Margin bottom: `16px`

**Reference Answer** (after submit):
- Background: `#f0fdf4`
- Border: `1px solid #86efac`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Color: `#166534`
- Margin bottom: `16px`

##### 3.3.9.9 SentenceFlashcardQuiz

**File**: `SentenceFlashcardQuiz.tsx`

**Same as FlashcardQuiz but**:
- Front: English sentence (17px)
- Back: Korean translation (15px)
- Min height: `240px`
- Speaker button on front

##### 3.3.9.10 SentenceQuizOverlay

**File**: `SentenceQuizOverlay.tsx`

**Same as WordQuizOverlay but**:
- Title: "문장 퀴즈"
- Supports sentence-specific quiz modes
- Results show sentence count instead of word count

---

### 3.4 Stats Page (/stats)

**File**: `frontend/src/app/stats/page.tsx`

**Layout Structure**:
```
Header (title only)
InsightCard
StreakHero
DailyGoals
WeeklyBarChart
MonthlyHeatmap
TypeDonutChart
HourlyPatternChart
LevelRadarChart
WeekComparisonCard
RecentTimeline
AchievementBadges
```

#### 3.4.1 Header

**Styling**:
- Padding: `24px 16px 16px`
- Background: `#faf9f7`

**Title**:
- Text: "통계"
- Font size: `24px` (2xl)
- Font weight: `700` (bold)
- Color: `#1a1a1a`

#### 3.4.2 InsightCard

**File**: `frontend/src/components/stats/InsightCard.tsx`

**Card Styling**:
- Background: Linear gradient `#0D9488` to `#0F766E`
- Border radius: `16px`
- Padding: `20px`
- Margin: `0 16px 16px`
- Color: White

**Icon**:
- Size: `32px`
- Sparkles icon
- Margin bottom: `12px`

**Title**:
- Font size: `14px`
- Font weight: `600`
- Margin bottom: `8px`

**Insight Text**:
- Font size: `13px`
- Line height: `1.5`
- Opacity: `0.95`

**Examples**:
- "이번 주 학습 시간이 지난 주보다 30% 증가했어요"
- "B1 레벨 단어 학습률이 80%를 넘었어요"
- "롤플레이 모드를 가장 많이 사용하고 있어요"

#### 3.4.3 StreakHero

**File**: `frontend/src/components/stats/StreakHero.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Flame Icon**:
- Size: `48px`
- Color: `#f59e0b`
- Centered
- Margin bottom: `12px`

**Streak Number**:
- Font size: `30px`
- Font weight: `700`
- Color: `#1a1a1a`
- Text align: center

**Label**:
- Font size: `14px`
- Color: `#666666`
- Text: "일 연속 학습"
- Text align: center
- Margin top: `4px`

**Best Streak**:
- Font size: `12px`
- Color: `#8a8a8a`
- Text: "최고 기록: {best}일"
- Text align: center
- Margin top: `8px`

#### 3.4.4 DailyGoals

**File**: `frontend/src/components/stats/DailyGoals.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "오늘의 목표"

**Goal Items** (3 items):
- Vertical stack
- Gap: `16px`
- Margin top: `16px`

**Goal Item**:
- Flex horizontal
- Align items: center
- Gap: `12px`

**Icon**:
- Size: `32px` circle
- Background: `#f0fdf4` (green), `#fef3c7` (yellow), `#ede9fe` (purple)
- Icon color: `#16a34a`, `#d97706`, `#7c3aed`

**Content**:
- Flex: 1

**Label**:
- Font size: `13px`
- Color: `#666666`

**Progress Text**:
- Font size: `14px`
- Font weight: `600`
- Color: `#1a1a1a`
- Text: "{current}/{target}"

**Progress Bar**:
- Background: `#f0f0f0`
- Fill: `#0D9488`
- Height: `6px`
- Border radius: `9999px`
- Margin top: `8px`
- Transition: width 500ms

**Goals**:
1. Conversation: "대화 {current}/{target}회"
2. Vocabulary: "단어 {current}/{target}개"
3. Time: "학습 {current}/{target}분"

#### 3.4.5 WeeklyBarChart

**File**: `frontend/src/components/stats/WeeklyBarChart.tsx`

**Library**: Recharts

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "주간 학습 시간"

**Chart Container**:
- Height: `200px`
- Margin top: `16px`

**Chart Config**:
- Type: BarChart
- Data: 7 days (Mon-Sun)
- X-axis: Day labels (월, 화, 수, 목, 금, 토, 일)
- Y-axis: Minutes
- Bar color: `#0D9488`
- Bar radius: `[4, 4, 0, 0]`
- Grid: Horizontal, `#f0f0f0`
- Tooltip: White background, border `#ebebeb`

#### 3.4.6 MonthlyHeatmap

**File**: `frontend/src/components/stats/MonthlyHeatmap.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "월간 활동"

**Heatmap Grid**:
- 7 columns (days of week)
- Variable rows (weeks in month)
- Gap: `4px`
- Margin top: `16px`

**Day Cell**:
- Aspect ratio: 1:1
- Border radius: `4px`
- Background: Intensity-based
  - Level 0: `#f5f5f5` (no activity)
  - Level 1: `#c7f0ed` (light)
  - Level 2: `#7dd3c0` (medium)
  - Level 3: `#0D9488` (high)
  - Level 4: `#0F766E` (very high)

**Legend**:
- Horizontal flex
- Gap: `4px`
- Margin top: `12px`
- Labels: "적음" to "많음"
- Font size: `11px`
- Color: `#8a8a8a`

#### 3.4.7 TypeDonutChart

**File**: `frontend/src/components/stats/TypeDonutChart.tsx`

**Library**: Recharts

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "학습 유형 분포"

**Chart Container**:
- Height: `240px`
- Margin top: `16px`

**Chart Config**:
- Type: PieChart with innerRadius (donut)
- Data: 3 types (Free Chat, Expression, Roleplay)
- Colors: `#0D9488`, `#f59e0b`, `#8b5cf6`
- Inner radius: `60%`
- Outer radius: `80%`
- Label: Percentage
- Tooltip: White background, border `#ebebeb`

**Legend**:
- Vertical stack
- Gap: `8px`
- Margin top: `16px`

**Legend Item**:
- Flex horizontal
- Align items: center
- Gap: `8px`

**Color Dot**:
- Size: `12px`
- Border radius: Full
- Background: Type color

**Label**:
- Font size: `13px`
- Color: `#666666`

**Value**:
- Font size: `14px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin left: auto

#### 3.4.8 HourlyPatternChart

**File**: `frontend/src/components/stats/HourlyPatternChart.tsx`

**Library**: Recharts

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "시간대별 학습 패턴"

**Chart Container**:
- Height: `200px`
- Margin top: `16px`

**Chart Config**:
- Type: AreaChart
- Data: 24 hours (0-23)
- X-axis: Hour labels (0시, 6시, 12시, 18시, 24시)
- Y-axis: Activity count
- Area color: `#0D9488` with gradient
- Gradient: `#0D9488` (opacity 0.3) to transparent
- Stroke: `#0D9488`, width 2
- Grid: Horizontal, `#f0f0f0`
- Tooltip: White background, border `#ebebeb`

#### 3.4.9 LevelRadarChart

**File**: `frontend/src/components/stats/LevelRadarChart.tsx`

**Library**: Recharts

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "레벨별 학습 현황"

**Chart Container**:
- Height: `280px`
- Margin top: `16px`

**Chart Config**:
- Type: RadarChart
- Data: 6 levels (A1-C2)
- Radar color: `#0D9488` with opacity 0.3
- Stroke: `#0D9488`, width 2
- Grid: Polar, `#f0f0f0`
- Labels: Level names with colors
- Tooltip: White background, border `#ebebeb`

#### 3.4.10 WeekComparisonCard

**File**: `frontend/src/components/stats/WeekComparisonCard.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "주간 비교"

**Comparison Items** (3 items):
- Vertical stack
- Gap: `16px`
- Margin top: `16px`

**Item**:
- Flex horizontal
- Align items: center
- Gap: `12px`

**Icon**:
- Size: `32px` circle
- Background: `#f0fdf4`, `#fef3c7`, `#ede9fe`
- Icon color: `#16a34a`, `#d97706`, `#7c3aed`

**Content**:
- Flex: 1

**Label**:
- Font size: `13px`
- Color: `#666666`

**Value**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`

**Change Badge**:
- Font size: `12px`
- Padding: `4px 8px`
- Border radius: `4px`
- Background: `#e8f5e9` (positive) or `#fce4ec` (negative)
- Color: `#2e7d32` (positive) or `#c62828` (negative)
- Icon: Arrow up/down
- Text: "+X%" or "-X%"

**Items**:
1. "학습 시간"
2. "대화 횟수"
3. "새 단어"

#### 3.4.11 RecentTimeline

**File**: `frontend/src/components/stats/RecentTimeline.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 16px`

**Header**:
- Standard section header pattern
- Label: "최근 활동"

**Timeline Items**:
- Vertical stack
- Gap: `16px`
- Margin top: `16px`

**Item**:
- Flex horizontal
- Gap: `12px`

**Time Indicator**:
- Width: `4px`
- Background: `#0D9488`
- Border radius: `9999px`
- Flex shrink: 0

**Content**:
- Flex: 1

**Time**:
- Font size: `11px`
- Color: `#8a8a8a`
- Margin bottom: `4px`

**Activity**:
- Font size: `14px`
- Color: `#1a1a1a`
- Font weight: `500`

**Detail**:
- Font size: `13px`
- Color: `#666666`
- Margin top: `2px`

#### 3.4.12 AchievementBadges

**File**: `frontend/src/components/stats/AchievementBadges.tsx`

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 96px` (bottom nav clearance)

**Header**:
- Standard section header pattern
- Label: "업적"

**Badge Grid**:
- 3-column grid
- Gap: `12px`
- Margin top: `16px`

**Badge Item**:
- Background: `#f5f5f5` (locked) or white (unlocked)
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `16px`
- Text align: center

**Icon**:
- Size: `32px`
- Color: `#c5c5c5` (locked) or `#0D9488` (unlocked)
- Margin bottom: `8px`

**Title**:
- Font size: `12px`
- Font weight: `600`
- Color: `#8a8a8a` (locked) or `#1a1a1a` (unlocked)

**Description**:
- Font size: `11px`
- Color: `#c5c5c5` (locked) or `#666666` (unlocked)
- Margin top: `4px`

**Examples**:
- "첫 대화" - 첫 AI 대화 완료
- "일주일 연속" - 7일 연속 학습
- "단어 마스터" - 100개 단어 학습
- "롤플레이 전문가" - 10개 시나리오 완료

---

### 3.5 My Page (/my)

**File**: `frontend/src/app/my/page.tsx`

**Layout Structure**:
```
Header (title only)
Profile Card
Settings Section
  - Voice Settings
  - App Install
  - Update Check
Feedback Link
App Info
  - Version
  - Build Date
  - Release Notes (collapsible)
Logout Button
```

#### 3.5.1 Header

**Same as Stats page header**
- Title: "마이페이지"

#### 3.5.2 Profile Card

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Avatar**:
- Size: `64px`
- Border radius: Full
- Border: `2px solid #ebebeb`
- Centered
- Margin bottom: `12px`

**Name**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Text align: center

**Email**:
- Font size: `13px`
- Color: `#666666`
- Text align: center
- Margin top: `4px`

#### 3.5.3 Settings Section

**Section Header**:
- Standard section header pattern
- Label: "설정"
- Margin: `0 16px 12px`

**Settings List**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `16px`
- Margin: `0 16px 24px`
- Overflow: hidden

**Setting Item**:
- Padding: `16px`
- Border bottom: `1px solid #f0f0f0` (except last)
- Flex horizontal
- Align items: center
- Gap: `12px`
- Active: Background `#faf9f7`

**Icon**:
- Size: `20px`
- Color: `#0D9488`

**Label**:
- Font size: `14px`
- Color: `#1a1a1a`
- Flex: 1

**Value/Action**:
- Font size: `13px`
- Color: `#666666`

**Chevron**:
- Size: `16px`
- Color: `#c5c5c5`

**Items**:
1. **Voice Settings**: Volume icon, "음성 설정", chevron
2. **App Install**: Download icon, "앱 설치", chevron
3. **Update Check**: Refresh icon, "업데이트 확인", "최신 버전"

#### 3.5.4 Feedback Link

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`
- Active: `scale(0.98)`

**Icon**:
- Message square
- Size: `20px`
- Color: `#0D9488`

**Text**:
- Font size: `14px`
- Color: `#1a1a1a`
- Flex: 1

**Chevron**:
- Size: `16px`
- Color: `#c5c5c5`

#### 3.5.5 App Info

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Info Items**:
- Vertical stack
- Gap: `12px`

**Info Item**:
- Flex horizontal
- Align items: center

**Label**:
- Font size: `13px`
- Color: `#666666`
- Flex: 1

**Value**:
- Font size: `14px`
- Color: `#1a1a1a`
- Font weight: `500`

**Items**:
1. "버전": "1.0.0"
2. "빌드 날짜": "2026-02-02"

**Release Notes**:
- Collapsible section
- Header: "릴리스 노트", chevron icon
- Content: Markdown-style list
- Font size: `13px`
- Color: `#666666`
- Line height: `1.6`
- Padding: `12px 0`

#### 3.5.6 Logout Button

**Styling**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `12px`
- Padding: `14px`
- Margin: `0 16px 96px` (bottom nav clearance)
- Font size: `14px`
- Font weight: `500`
- Color: `#c62828` (red)
- Text align: center
- Active: `scale(0.98)`

---

### 3.6 Daily Expression Page (/daily)

**File**: `frontend/src/app/daily/page.tsx`

**Layout Structure**:
```
Header (back + title + refresh)
Expression Card
Example Card
Practice CTA Button
```

#### 3.6.1 Header

**Styling**:
- Background: `#faf9f7`
- Border bottom: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area top

**Back Button**:
- Icon: Chevron left
- Size: `24px`
- Color: `#1a1a1a`
- Position: Left

**Title**:
- Text: "오늘의 표현"
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Position: Center

**Refresh Button**:
- Icon: Refresh
- Size: `24px`
- Color: `#0D9488`
- Position: Right
- Active: Rotate animation

#### 3.6.2 Expression Card

**Card Styling**:
- Standard card pattern
- Margin: `16px 16px 24px`

**Expression Text**:
- Font size: `24px` (2xl)
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `12px`

**Meaning Section**:
- Collapsible
- Header: "뜻", chevron icon
- Font size: `13px`
- Color: `#666666`
- Font weight: `500`

**Meaning Text**:
- Font size: `20px`
- Color: `#666666`
- Margin top: `8px`
- Line height: `1.5`

#### 3.6.3 Example Card

**Card Styling**:
- Standard card pattern
- Margin: `0 16px 24px`

**Example Text**:
- Font size: `18px` (lg)
- Color: `#1a1a1a`
- Line height: `1.6`
- Margin bottom: `12px`

**Translation Section**:
- Collapsible
- Header: "번역", chevron icon
- Font size: `13px`
- Color: `#666666`
- Font weight: `500`

**Translation Text**:
- Font size: `15px`
- Color: `#666666`
- Margin top: `8px`
- Line height: `1.5`
- Font style: italic

#### 3.6.4 Practice CTA Button

**Styling**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `16px`
- Margin: `0 16px 96px` (bottom nav clearance)
- Font size: `15px`
- Font weight: `600`
- Text align: center
- Active: `scale(0.98)`
- Text: "이 표현으로 연습하기"

---

### 3.7 Create Scenario Page (/create)

**File**: `frontend/src/app/create/page.tsx`

**Layout Structure**:
```
Header (back + title)
Step Indicator (1/2/3)
[Step 1: Context]
  - Place Selection
  - Time Selection
  - Situation Input
  - Suggestion Pills
  - Next Button
[Step 2: Chat]
  - Chat Interface (AI refinement)
  - Confirm Button
[Step 3: Review]
  - Preview Card
  - Title Input
  - Publish Button
```

#### 3.7.1 Header

**Same as Daily page header**
- Title: "시나리오 만들기"

#### 3.7.2 Step Indicator

**Container**:
- Flex horizontal
- Gap: `8px`
- Padding: `16px`
- Justify: center

**Step Dot**:
- Size: `8px`
- Border radius: Full
- Background: `#e5e5e5` (inactive) or `#0D9488` (active)
- Transition: background 300ms

#### 3.7.3 Step 1: Context

**Section Headers**:
- Standard section header pattern
- Labels: "장소", "시간", "상황"

**Place Selection**:
- Horizontal scroll
- Gap: `8px`
- Padding: `0 16px`
- Margin bottom: `24px`

**Place Button**:
- Background: White
- Border: `2px solid #ebebeb`
- Border radius: `12px`
- Padding: `12px 16px`
- Font size: `14px`
- Active: Border `#0D9488`, background `#f0fdf4`

**Places**:
- "카페", "레스토랑", "호텔", "공항", "병원", "은행", "쇼핑몰", "기타"

**Time Selection**:
- Same as Place Selection
- Times: "아침", "점심", "저녁", "밤"

**Situation Input**:
- Background: `#f5f5f5`
- Border: `2px solid #e5e5e5`
- Border radius: `12px`
- Padding: `16px`
- Font size: `14px`
- Min height: `120px`
- Resize: vertical
- Placeholder: "어떤 상황인가요? 예: 커피를 주문하고 싶어요"
- Margin: `0 16px 16px`

**Suggestion Pills**:
- Horizontal scroll
- Gap: `8px`
- Padding: `0 16px`
- Margin bottom: `24px`

**Pill**:
- Background: `#f0fdf4`
- Border: `1px solid #86efac`
- Border radius: `9999px`
- Padding: `6px 12px`
- Font size: `12px`
- Color: `#166534`
- Active: `scale(0.98)`

**Next Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Margin: `0 16px 96px`
- Font size: `14px`
- Font weight: `500`
- Full width
- Disabled: `#c5c5c5` background

#### 3.7.4 Step 2: Chat

**Chat Interface**:
- Same as ChatWindow component
- AI helps refine scenario details
- User can ask questions and make adjustments

**Confirm Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Margin: `0 16px 96px`
- Font size: `14px`
- Font weight: `500`
- Full width
- Text: "확인 및 다음"

#### 3.7.5 Step 3: Review

**Preview Card**:
- Standard card pattern
- Margin: `16px 16px 24px`

**Scenario Title**:
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `12px`

**Scenario Details**:
- Font size: `14px`
- Color: `#666666`
- Line height: `1.6`

**Title Input**:
- Background: `#f5f5f5`
- Border: `2px solid #e5e5e5`
- Border radius: `12px`
- Padding: `16px`
- Font size: `14px`
- Placeholder: "시나리오 제목을 입력하세요"
- Margin: `0 16px 24px`

**Publish Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Margin: `0 16px 96px`
- Font size: `14px`
- Font weight: `500`
- Full width
- Text: "커뮤니티에 공유하기"

---

### 3.8 Feedback Page (/feedback)

**File**: `frontend/src/app/feedback/page.tsx`

**Layout Structure**:
```
Header (back + title + write button)
Filter Pills (categories)
Sort Dropdown
Post Cards
Write Modal (bottom sheet)
Detail Modal (full screen)
```

#### 3.8.1 Header

**Styling**:
- Background: `#faf9f7`
- Border bottom: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area top

**Back Button**:
- Icon: Chevron left
- Size: `24px`
- Color: `#1a1a1a`
- Position: Left

**Title**:
- Text: "기능 요청"
- Font size: `17px`
- Font weight: `600`
- Color: `#1a1a1a`
- Position: Center

**Write Button**:
- Icon: Plus
- Size: `24px`
- Color: `#0D9488`
- Position: Right

#### 3.8.2 Filter Pills

**Container**:
- Horizontal scroll
- Gap: `8px`
- Padding: `16px`
- Margin bottom: `8px`

**Pill**:
- Background: `#f5f5f5` (inactive) or `#0D9488` (active)
- Color: `#666666` (inactive) or white (active)
- Padding: `6px 12px`
- Border radius: `9999px`
- Font size: `12px`
- Font weight: `500`

**Categories**:
- "전체", "기능", "버그", "개선", "기타"

#### 3.8.3 Sort Dropdown

**Container**:
- Padding: `0 16px`
- Margin bottom: `16px`

**Dropdown Button**:
- Background: White
- Border: `1px solid #ebebeb`
- Border radius: `8px`
- Padding: `8px 12px`
- Font size: `13px`
- Color: `#666666`
- Icon: Chevron down
- Width: `120px`

**Options**:
- "최신순", "인기순", "댓글순"

#### 3.8.4 Post Cards

**Container**:
- Vertical stack
- Gap: `12px`
- Padding: `0 16px`
- Margin bottom: `96px`

**Post Card**:
- Standard card pattern
- Padding: `16px`
- Active: `scale(0.98)`

**Header**:
- Flex horizontal
- Align items: center
- Gap: `8px`
- Margin bottom: `8px`

**Category Badge**:
- Background: `#f0fdf4` (feature), `#fce4ec` (bug), `#fff3e0` (improvement)
- Color: `#16a34a`, `#c62828`, `#e65100`
- Padding: `4px 8px`
- Border radius: `4px`
- Font size: `11px`
- Font weight: `500`

**Status Badge**:
- Background: `#f5f5f5` (pending), `#e0f2f1` (in progress), `#e8f5e9` (completed)
- Color: `#666666`, `#0D9488`, `#2e7d32`
- Padding: `4px 8px`
- Border radius: `4px`
- Font size: `11px`
- Font weight: `500`

**Title**:
- Font size: `14px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `8px`

**Description**:
- Font size: `13px`
- Color: `#666666`
- Line height: `1.5`
- Max lines: 2
- Overflow: ellipsis

**Footer**:
- Flex horizontal
- Align items: center
- Gap: `12px`
- Margin top: `12px`

**Like Button**:
- Flex horizontal
- Align items: center
- Gap: `4px`
- Font size: `12px`
- Color: `#666666`
- Icon: Heart (outline or filled)
- Active: Color `#F87171`

**Comment Count**:
- Flex horizontal
- Align items: center
- Gap: `4px`
- Font size: `12px`
- Color: `#666666`
- Icon: Message circle

#### 3.8.5 Write Modal

**Type**: Bottom sheet

**Container**:
- Position: Fixed bottom
- Background: White
- Border radius: `16px 16px 0 0`
- Padding: `24px`
- Shadow: `0 -4px 24px rgba(0, 0, 0, 0.1)`
- Animation: slide-up 0.3s

**Header**:
- Title: "기능 요청 작성"
- Font size: `17px`
- Font weight: `600`
- Close button: X icon

**Category Select**:
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Margin bottom: `16px`

**Title Input**:
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Placeholder: "제목을 입력하세요"
- Margin bottom: `16px`

**Description Textarea**:
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Min height: `120px`
- Resize: vertical
- Placeholder: "자세한 설명을 입력하세요"
- Margin bottom: `16px`

**Submit Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Font weight: `500`
- Full width

#### 3.8.6 Detail Modal

**Type**: Full screen

**Container**:
- Position: Fixed full screen
- Background: `#faf9f7`
- Z-index: 50

**Header**:
- Background: White
- Border bottom: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area top

**Back Button**:
- Icon: Chevron left
- Size: `24px`
- Color: `#1a1a1a`

**Content**:
- Padding: `16px`

**Post Card**:
- Standard card pattern
- Margin bottom: `16px`

**Post Header**:
- Same as post card header

**Post Title**:
- Font size: `20px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `12px`

**Post Description**:
- Font size: `14px`
- Color: `#666666`
- Line height: `1.6`
- Margin bottom: `16px`

**Post Footer**:
- Same as post card footer

**Comments Section**:
- Standard card pattern

**Comments Header**:
- Font size: `14px`
- Font weight: `600`
- Color: `#1a1a1a`
- Margin bottom: `16px`

**Comment Item**:
- Padding: `12px 0`
- Border bottom: `1px solid #f0f0f0` (except last)

**Comment Author**:
- Font size: `13px`
- Font weight: `500`
- Color: `#1a1a1a`

**Comment Time**:
- Font size: `11px`
- Color: `#8a8a8a`
- Margin left: `8px`

**Comment Text**:
- Font size: `13px`
- Color: `#666666`
- Line height: `1.5`
- Margin top: `4px`

**Comment Input**:
- Position: Fixed bottom
- Background: White
- Border top: `1px solid #f0f0f0`
- Padding: `12px 16px`
- Safe area bottom

**Input Field**:
- Background: `#f5f5f5`
- Border: `1px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Flex: 1

**Send Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `8px`
- Padding: `12px 16px`
- Font size: `14px`
- Font weight: `500`
- Icon: Send

---

### 3.9 Login Page (/login)

**File**: `frontend/src/app/login/page.tsx`

**Layout Structure**:
```
Logo
Welcome Text
Google OAuth Button
Divider
Email/Password Form
Toggle (Signup/Signin)
```

#### 3.9.1 Logo

**Styling**:
- Size: `80px`
- Centered
- Margin bottom: `24px`

#### 3.9.2 Welcome Text

**Title**:
- Font size: `24px`
- Font weight: `700`
- Color: `#1a1a1a`
- Text align: center
- Margin bottom: `8px`

**Subtitle**:
- Font size: `14px`
- Color: `#666666`
- Text align: center
- Text transform: uppercase
- Letter spacing: `0.05em`
- Margin bottom: `32px`

#### 3.9.3 Google OAuth Button

**Styling**:
- Background: White
- Border: `2px solid #0D9488`
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Color: `#1a1a1a`
- Icon: Google logo
- Full width
- Margin: `0 16px 24px`
- Active: Background `#f0fdf4`

#### 3.9.4 Divider

**Container**:
- Flex horizontal
- Align items: center
- Gap: `12px`
- Padding: `0 16px`
- Margin bottom: `24px`

**Line**:
- Flex: 1
- Height: `1px`
- Background: `#e5e5e5`

**Text**:
- Font size: `12px`
- Color: `#8a8a8a`
- Text: "Or"

#### 3.9.5 Email/Password Form

**Container**:
- Padding: `0 16px`

**Label**:
- Font size: `12px`
- Font weight: `500`
- Color: `#666666`
- Text transform: uppercase
- Letter spacing: `0.05em`
- Margin bottom: `8px`

**Input**:
- Background: White
- Border: `2px solid #e5e5e5`
- Border radius: `8px`
- Padding: `12px`
- Font size: `14px`
- Margin bottom: `16px`
- Focus: Border `#0D9488`

**Submit Button**:
- Background: `#0D9488`
- Color: White
- Border radius: `12px`
- Padding: `14px`
- Font size: `14px`
- Font weight: `500`
- Full width
- Margin top: `8px`
- Active: `scale(0.98)`

#### 3.9.6 Toggle (Signup/Signin)

**Container**:
- Text align: center
- Margin top: `24px`

**Text**:
- Font size: `13px`
- Color: `#666666`

**Link**:
- Font size: `13px`
- Color: `#0D9488`
- Font weight: `500`
- Margin left: `4px`
- Text decoration: underline

---

## 4. Gap Analysis: Flutter vs Original

| Feature | Original (Next.js) | Flutter Current | Status | Priority |
|---------|-------------------|-----------------|--------|----------|
| **Core Pages** |
| Home Dashboard | Full implementation with 11 widgets | Basic layout only | PARTIAL | HIGH |
| Talk Page | Full with 3 modes + ChatWindow (1358 lines) | Basic ChatWindow | PARTIAL | HIGH |
| Cards/Vocabulary | Full with flashcards + quiz system (10 components) | Basic flashcards only | PARTIAL | HIGH |
| Stats Page | 11 chart components (Recharts) | 4 basic stats only | PARTIAL | MEDIUM |
| My Page | Full settings + profile | Basic layout | PARTIAL | LOW |
| Daily Expression | Full implementation | NOT IMPLEMENTED | MISSING | MEDIUM |
| Create Scenario | 3-step wizard with AI chat | NOT IMPLEMENTED | MISSING | LOW |
| Feedback | Full CRUD with comments | NOT IMPLEMENTED | MISSING | LOW |
| Login | OAuth + email/password | NOT IMPLEMENTED | MISSING | HIGH |
| **Shared Components** |
| BottomNav | 2 tabs + FAB | Basic 2 tabs only | PARTIAL | HIGH |
| AppShell | Auth routing + loading states | NOT IMPLEMENTED | MISSING | HIGH |
| SplashScreen | Logo + fade animation | NOT IMPLEMENTED | MISSING | MEDIUM |
| Section Header Pattern | Teal bar + uppercase label | NOT IMPLEMENTED | MISSING | LOW |
| Card Pattern | Consistent styling | Inconsistent | PARTIAL | MEDIUM |
| **ChatWindow Features** |
| Basic Chat | User/AI messages | IMPLEMENTED | COMPLETE | - |
| Message Extras | Better expressions, tips, suggestions, translation, word lookup | NOT IMPLEMENTED | MISSING | HIGH |
| TTS Playing Indicator | 3 bouncing dots + "읽는 중..." | NOT IMPLEMENTED | MISSING | MEDIUM |
| AI Thinking Indicator | 3 bouncing dots + "생각 중..." | NOT IMPLEMENTED | MISSING | MEDIUM |
| STT Confirmation Banner | Confidence + auto-send countdown + edit | NOT IMPLEMENTED | MISSING | HIGH |
| Listening Indicator | Soundwave bars with audio level | NOT IMPLEMENTED | MISSING | MEDIUM |
| Pronunciation Practice Sheet | Full/blank mode + Levenshtein scoring | NOT IMPLEMENTED | MISSING | MEDIUM |
| Word Popup | Floating word lookup with save | NOT IMPLEMENTED | MISSING | MEDIUM |
| Situation Label Bar | Roleplay scenario info | NOT IMPLEMENTED | MISSING | LOW |
| Scenario Progress Bar | Stage markers + progress | NOT IMPLEMENTED | MISSING | LOW |
| Word Tip Banner | Dismissible learning tips | NOT IMPLEMENTED | MISSING | LOW |
| **Talk Page Features** |
| ModeSelector | 3-button segmented control | NOT IMPLEMENTED | MISSING | HIGH |
| Expression Card | Current expression + refresh | NOT IMPLEMENTED | MISSING | MEDIUM |
| RoleplayPicker | Scenario selection with filters | NOT IMPLEMENTED | MISSING | MEDIUM |
| **Home Dashboard Widgets** |
| Header | Greeting + title + avatar | Basic only | PARTIAL | MEDIUM |
| Streak & Session Badges | Conditional badges | NOT IMPLEMENTED | MISSING | LOW |
| Quick Mode Cards | 3-column grid | NOT IMPLEMENTED | MISSING | MEDIUM |
| Daily Challenge Card | Teal card with progress bars | NOT IMPLEMENTED | MISSING | MEDIUM |
| Recent Activity Card | Last activity + "이어하기" | NOT IMPLEMENTED | MISSING | LOW |
| Quick Quiz | 3-option quiz with feedback | NOT IMPLEMENTED | MISSING | MEDIUM |
| Today's Expression Card | Expression preview | NOT IMPLEMENTED | MISSING | LOW |
| Recommended Scenarios | Horizontal scroll cards | NOT IMPLEMENTED | MISSING | LOW |
| Vocabulary Preview | Horizontal scroll word cards | NOT IMPLEMENTED | MISSING | LOW |
| Weekly Activity Grid | 7-day grid | NOT IMPLEMENTED | MISSING | LOW |
| **Quiz System** |
| QuizModeSelector | Bottom sheet with 6 modes | NOT IMPLEMENTED | MISSING | HIGH |
| WordQuizOverlay | Progress + results screen | NOT IMPLEMENTED | MISSING | HIGH |
| FlashcardQuiz | 3D flip + 4-level rating | NOT IMPLEMENTED | MISSING | HIGH |
| MultipleChoiceQuiz | 4 options with feedback | NOT IMPLEMENTED | MISSING | HIGH |
| SpellingQuiz | Type the word | NOT IMPLEMENTED | MISSING | HIGH |
| ListeningQuiz | Listen and type | NOT IMPLEMENTED | MISSING | HIGH |
| GapFillQuiz | Fill in the blank | NOT IMPLEMENTED | MISSING | MEDIUM |
| TranslationQuiz | Translate sentence | NOT IMPLEMENTED | MISSING | MEDIUM |
| SentenceFlashcardQuiz | Sentence flashcards | NOT IMPLEMENTED | MISSING | MEDIUM |
| SentenceQuizOverlay | Sentence quiz wrapper | NOT IMPLEMENTED | MISSING | MEDIUM |
| **Stats Components** |
| InsightCard | AI-generated insights | NOT IMPLEMENTED | MISSING | LOW |
| StreakHero | Flame icon + streak count | BASIC | PARTIAL | MEDIUM |
| DailyGoals | 3 progress bars | BASIC | PARTIAL | MEDIUM |
| WeeklyBarChart | Recharts bar chart | NOT IMPLEMENTED | MISSING | MEDIUM |
| MonthlyHeatmap | GitHub-style heatmap | NOT IMPLEMENTED | MISSING | LOW |
| TypeDonutChart | Recharts donut chart | NOT IMPLEMENTED | MISSING | LOW |
| HourlyPatternChart | Recharts area chart | NOT IMPLEMENTED | MISSING | LOW |
| LevelRadarChart | Recharts radar chart | NOT IMPLEMENTED | MISSING | LOW |
| WeekComparisonCard | Week-over-week comparison | NOT IMPLEMENTED | MISSING | LOW |
| RecentTimeline | Activity timeline | NOT IMPLEMENTED | MISSING | LOW |
| AchievementBadges | Unlockable badges | NOT IMPLEMENTED | MISSING | LOW |
| **Vocabulary Features** |
| Level Selector | A1-C2 horizontal scroll | BASIC | PARTIAL | MEDIUM |
| Flashcard Display | 3D flip animation | 2D only | PARTIAL | HIGH |
| Action Buttons | 모르겠어요 / 알아요 | BASIC | PARTIAL | MEDIUM |
| Expand Button | Load idioms/sentences | NOT IMPLEMENTED | MISSING | MEDIUM |
| Expanded Panel | Idioms + sentences display | NOT IMPLEMENTED | MISSING | MEDIUM |
| Saved Words Tab | Toggle + stats + filter/sort | NOT IMPLEMENTED | MISSING | MEDIUM |
| Mastery Dots | 5-dot progress indicator | NOT IMPLEMENTED | MISSING | LOW |
| **Animations** |
| Fade In | 0.4s translateY + opacity | NOT IMPLEMENTED | MISSING | LOW |
| Breathe | 4s scale infinite | NOT IMPLEMENTED | MISSING | LOW |
| Pulse Soft | 3s opacity infinite | NOT IMPLEMENTED | MISSING | LOW |
| Slide Up | 0.3s bottom sheet | BASIC | PARTIAL | MEDIUM |
| 3D Card Flip | 500ms rotateY with perspective | NOT IMPLEMENTED | MISSING | HIGH |
| Button Press | scale(0.95-0.98) | BASIC | PARTIAL | LOW |
| Progress Bar | 500ms transition | BASIC | PARTIAL | LOW |
| Score Circle | 1000ms ease-out | NOT IMPLEMENTED | MISSING | LOW |
| **Context/State** |
| TalkContext | Mode + expression + scenario state | NOT IMPLEMENTED | MISSING | HIGH |
| ConversationSettings | Roleplay settings context | NOT IMPLEMENTED | MISSING | MEDIUM |
| AuthContext | User auth state | NOT IMPLEMENTED | MISSING | HIGH |
| VocabularyContext | Saved words state | NOT IMPLEMENTED | MISSING | MEDIUM |

**Summary**:
- **Total Features**: 95
- **Complete**: 1 (1%)
- **Partial**: 15 (16%)
- **Missing**: 79 (83%)

**Priority Breakdown**:
- **HIGH Priority**: 23 features (24%)
- **MEDIUM Priority**: 38 features (40%)
- **LOW Priority**: 34 features (36%)

---

## 5. Tone and Manner Summary

### 5.1 Design Philosophy

**Minimal, Clean, Apple-Inspired**:
- Emphasis on whitespace and breathing room
- Subtle, almost invisible borders and shadows
- Single primary accent color (teal) used sparingly
- System fonts only - no custom typography
- Warm background (#faf9f7) instead of pure white for softer feel

### 5.2 Color Usage

**Restrained Palette**:
- Teal (#0D9488) as the ONLY primary action color
- Very light borders (#ebebeb, #f0f0f0) - barely visible
- Subtle shadows (0.04 opacity) - just enough for depth
- Accent colors (coral, green, orange, purple) only for specific contexts (quiz feedback, level badges)
- Background warmth (#faf9f7) creates softer, less clinical feel than pure white

### 5.3 Typography

**System Font Stack**:
- No custom fonts - relies on system defaults
- Global letter-spacing: -0.01em for tighter, more refined look
- Font weights: 300 (light for display), 400 (regular), 500 (medium for labels), 600 (semibold for headings), 700 (bold for emphasis)
- Sizes range from 10px (tiny badges) to 30px (large display)

### 5.4 Language

**Korean for Chrome, English for Content**:
- App UI labels: Korean ("대화", "단어", "통계")
- Learning content: English (words, expressions, sentences)
- Mixed: Korean explanations for English content

### 5.5 Interactions

**Mobile-First Touch Interactions**:
- Scale-down on tap (0.95-0.98) - NOT hover effects
- No hover states (mobile app)
- Touch targets: Minimum 44px for accessibility
- Horizontal scrolling for content overflow (scenarios, word cards)
- Bottom sheets for modals (slide-up animation)
- Safe area support for notch/home indicator

### 5.6 Loading States

**Bouncing Dots, Not Spinners**:
- Content loading: 3 bouncing dots (teal or gray)
- Action loading: Spinner only for buttons
- Empty states: Breathing circle animation (scale 1 to 1.05)
- Skeleton screens: NOT used (prefer empty states)

### 5.7 Progressive Disclosure

**Show More, Not All**:
- Collapsible sections (meaning, translation, release notes)
- Conditional rendering (badges, tips, extras)
- Expandable panels (idioms, sentences)
- Bottom sheets for secondary actions
- Full screen modals for deep dives

### 5.8 Feedback

**Immediate Visual Feedback**:
- Quiz answers: Instant color change (green/red)
- Button press: Instant scale-down
- Progress bars: Smooth 500ms transition
- Success/error: Color-coded backgrounds with icons
- No toast notifications - inline feedback preferred

### 5.9 Consistency

**Patterns Over Components**:
- Section header pattern: Teal bar + uppercase label
- Card pattern: White bg, subtle border, minimal shadow
- Button pattern: Teal primary, gray secondary, red danger
- Badge pattern: Colored background, small text, pill shape
- Input pattern: Light gray background, border on focus

### 5.10 Accessibility

**Readable and Touchable**:
- Minimum font size: 10px (only for badges)
- Body text: 14px minimum
- Touch targets: 44px minimum
- Color contrast: WCAG AA compliant
- Focus states: Teal border on inputs
- Safe area support: iOS notch/home indicator

---

**End of Document**
