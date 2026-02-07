# Fix Korean Setup Phase Response + TTS Settings Cleanup

## TL;DR

> **Quick Summary**: Fix 4 bugs: (1) Backend responds in English during Korean-only setup phase, (2) Korean TTS pitch too high, (3) Settings modal shows device mode that should be removed, (4) Save original prompt as MD file.
> 
> **Deliverables**:
> - Backend `chat.py` respects custom `system_prompt` without wrapping in English prompt template
> - Korean TTS pitch set to 1.0 for natural sound
> - Settings modal simplified to Edge TTS only (no device mode)
> - My page button text updated
> - Original prompt saved to `prompts/` folder
> 
> **Estimated Effort**: Short (1-2 hours)
> **Parallel Execution**: YES - 5 waves, 4 of which run in Wave 1
> **Critical Path**: Tasks 1-4 (parallel) -> Task 5 (build verify) -> Task 6 (save prompt)

---

## Context

### Original Request
User reported that during Talk page -> Free Chat -> situation setup phase, the AI's second response comes back in ENGLISH instead of Korean. Additionally, Korean TTS voice pitch is too high, and the settings page should only show Edge TTS options (remove device voice mode). Finally, save the original prompt as an MD file.

### Interview Summary
**Key Discussions**:
- Root cause analysis provided by user with specific line numbers
- All analysis verified against actual codebase code

**Research Findings**:
- `chat.py` line 66-69: `FREE_CONVERSATION_PROMPT.format()` is ALWAYS used as prompt, even when `request.system_prompt` overrides system prompt. This template hardcodes "Respond in English (CONVERSATION ONLY, no teaching):" at the end.
- `TTSContext.tsx` line 240: `utterance.pitch` uses `settings.pitch` (default 1.2) for ALL languages. Line 238-239 already has `isNonEnglish` variable and special rate handling for non-English.
- `TTSSettingsModal.tsx` has HD/device mode toggle that should be removed.
- `TTSContext.tsx` line 55-61: `DEFAULT_SETTINGS` already has `ttsMode: 'hd'`.
- `completeSituationSetup` at ChatWindow.tsx line 513 also sends custom `system_prompt` and is ALSO affected by the same bug.

### Metis Review
**Identified Gaps** (addressed):
- localStorage migration: Existing users with `ttsMode: 'device'` saved need forced override to `'hd'`
- Dead code cleanup: Removed UI handlers (`handleModeChange`, `handlePitchChange`, `handleVoiceChange`) must be removed
- `completeSituationSetup` also passes custom `system_prompt` and benefits from the same fix
- Firebase sync may restore old `ttsMode: 'device'` - addressed by forcing override on load
- Suggestions/tips sub-calls in chat.py (out of scope for this task)

---

## Work Objectives

### Core Objective
Fix the Korean setup phase to respond in Korean, normalize Korean TTS pitch, and simplify TTS settings to Edge-only mode.

### Concrete Deliverables
- Modified `backend/api/chat.py` with conditional prompt logic
- Modified `frontend/src/contexts/TTSContext.tsx` with pitch fix and localStorage migration
- Modified `frontend/src/components/TTSSettingsModal.tsx` simplified to HD-only
- Modified `frontend/src/app/my/page.tsx` with updated button text
- New `prompts/fix-setup-korean-tts-prompt.md` with original prompt

### Definition of Done
- [ ] Backend returns Korean response when custom `system_prompt` is provided
- [ ] Backend returns English response when no custom `system_prompt` (normal flow unchanged)
- [ ] Korean TTS pitch is 1.0 (natural)
- [ ] Settings modal shows HD voice selection and speed only
- [ ] No "device mode" toggle visible
- [ ] `npm run build` passes with zero errors
- [ ] Prompt file exists in `prompts/`

### Must Have
- Backend conditional: when `system_prompt` is provided, bypass `FREE_CONVERSATION_PROMPT`
- Korean TTS pitch hardcoded to 1.0 for non-English
- Settings modal HD-only (no device mode toggle, no pitch slider, no device voice selection)
- localStorage migration: force `ttsMode: 'hd'` regardless of saved value
- Button text update on my page
- Prompt MD file saved

### Must NOT Have (Guardrails)
- DO NOT change `FREE_CONVERSATION_PROMPT` text content in `prompts.py`
- DO NOT remove `pitch` or `ttsMode` from `TTSSettings` interface (backward compat)
- DO NOT modify `speakWithCallback` routing logic (lines 414-425 of TTSContext.tsx)
- DO NOT modify HD TTS fallback logic (lines 357-401 of TTSContext.tsx)
- DO NOT touch `generate_suggestions`, `generate_better_expressions`, or `generate_learning_tip` in chat.py
- DO NOT change any backend files other than `chat.py`
- DO NOT add new features, refactor adjacent code, or restructure components
- DO NOT modify `completeSituationSetup` in ChatWindow.tsx (it will automatically benefit from the backend fix)

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES (Vitest configured in frontend)
- **Automated tests**: NO (per user request - verify and self-check instead)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY - ALL tasks)

All verification is executed by the agent using tools (curl, grep, bash). No human action required.

---

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| Task 1 | None | Backend fix - independent |
| Task 2 | None | TTS pitch fix - independent |
| Task 3 | None | Modal UI cleanup - independent |
| Task 4 | None | Text change - independent |
| Task 5 | Tasks 1, 2, 3, 4 | Build verification requires all code changes complete |
| Task 6 | None | File creation - independent |

## Parallel Execution Graph

```
Wave 1 (Start immediately - ALL independent):
├── Task 1: Backend chat.py fix (system_prompt conditional)
├── Task 2: TTSContext.tsx pitch fix + localStorage migration
├── Task 3: TTSSettingsModal.tsx HD-only cleanup
├── Task 4: my/page.tsx button text update
└── Task 6: Save prompt MD file

Wave 2 (After Wave 1 completes):
└── Task 5: Build verification + integration test

Critical Path: Any Wave 1 task → Task 5 (build verify)
Parallel Speedup: ~80% faster than sequential (5 tasks parallel)
```

## Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 5 | 2, 3, 4, 6 |
| 2 | None | 5 | 1, 3, 4, 6 |
| 3 | None | 5 | 1, 2, 4, 6 |
| 4 | None | 5 | 1, 2, 3, 6 |
| 5 | 1, 2, 3, 4 | None | 6 (if 6 done early) |
| 6 | None | None | 1, 2, 3, 4, 5 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3, 4, 6 | dispatch all 5 in parallel |
| 2 | 5 | single agent for build verification |

---

## TODOs

- [ ] 1. Fix Backend chat.py - Respect custom system_prompt

  **What to do**:
  - In `backend/api/chat.py`, modify lines 65-69 to add a conditional
  - When `request.system_prompt` is provided (not None), use user message directly with context instead of wrapping in `FREE_CONVERSATION_PROMPT`
  - When `request.system_prompt` is None, keep existing behavior (use `FREE_CONVERSATION_PROMPT.format()`)
  - The exact change:

  ```python
  # BEFORE (line 65-69):
  prompt = FREE_CONVERSATION_PROMPT.format(
      context=context if context else "This is the start of the conversation.",
      user_message=request.message
  )

  # AFTER:
  if request.system_prompt:
      # Custom system_prompt provided (e.g., Korean setup phase)
      # Use user message directly without English-only FREE_CONVERSATION_PROMPT wrapper
      prompt = f"Previous conversation:\n{context}\n\nUser: {request.message}" if context else request.message
  else:
      prompt = FREE_CONVERSATION_PROMPT.format(
          context=context if context else "This is the start of the conversation.",
          user_message=request.message
      )
  ```

  **Must NOT do**:
  - Do NOT change `FREE_CONVERSATION_PROMPT` text in `prompts.py`
  - Do NOT modify `generate_suggestions`, `generate_better_expressions`, or `generate_learning_tip`
  - Do NOT change the `system_prompt=request.system_prompt or SYSTEM_PROMPT_ENGLISH_TUTOR` line (line 74)
  - Do NOT change any other backend files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, single conditional change, clear and simple
  - **Skills**: [`python-patterns`, `backend-patterns`]
    - `python-patterns`: Python code style and idioms for the conditional
    - `backend-patterns`: FastAPI request handling patterns
  - **Skills Evaluated but Omitted**:
    - `coding-standards`: Overlaps with python-patterns for this simple task
    - `security-review`: No auth/input handling changes, just prompt routing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 6)
  - **Blocks**: Task 5 (build verification)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `backend/api/chat.py:60-77` - Current prompt construction and LLM call flow. Lines 60-63 build context from history. Lines 66-69 wrap in FREE_CONVERSATION_PROMPT. Line 74 applies system_prompt override. The fix intercepts between context build (63) and prompt construction (66).

  **API/Type References**:
  - `backend/api/chat.py:18-23` - `ChatRequest` model showing `system_prompt: Optional[str]` field
  - `backend/core/prompts.py:32-48` - `FREE_CONVERSATION_PROMPT` template text (DO NOT modify this, understand its structure)

  **Test References**:
  - `frontend/src/components/ChatWindow.tsx:470-479` - Frontend `sendSetupMessage` that sends `system_prompt` override (shows what the backend receives)
  - `frontend/src/components/ChatWindow.tsx:525-534` - Frontend `completeSituationSetup` also sends custom `system_prompt` (second affected code path)

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Custom system_prompt gets Korean-only response
    Tool: Bash (curl)
    Preconditions: Backend running on localhost:7860
    Steps:
      1. curl -s -X POST http://localhost:7860/api/chat \
           -H "Content-Type: application/json" \
           -d '{"message": "카페에서 주문하는 상황이야", "system_prompt": "너는 한국어로만 대화하는 도우미야. 영어를 절대 사용하지 마. 사용자가 설명한 내용을 짧게 확인하고 물어봐."}'
      2. Parse response JSON, extract `message` field
      3. Assert: response message does NOT contain English sentences (may contain short English words like "OK" which is fine)
      4. Assert: response message contains Korean characters
    Expected Result: AI responds in Korean, not English
    Evidence: curl response body saved

  Scenario: Normal chat (no system_prompt) still responds in English
    Tool: Bash (curl)
    Preconditions: Backend running on localhost:7860
    Steps:
      1. curl -s -X POST http://localhost:7860/api/chat \
           -H "Content-Type: application/json" \
           -d '{"message": "Hello, how are you today?"}'
      2. Parse response JSON, extract `message` field
      3. Assert: response message contains English text
    Expected Result: AI responds in English as before
    Evidence: curl response body saved
  ```

  **Commit**: YES (groups with Tasks 2, 3, 4)
  - Message: `fix(chat): respect custom system_prompt by bypassing English prompt template`
  - Files: `backend/api/chat.py`
  - Pre-commit: `cd frontend && npm run build`

---

- [ ] 2. Fix Korean TTS Pitch + localStorage Migration

  **What to do**:
  - In `frontend/src/contexts/TTSContext.tsx`, modify line 240 to set pitch to 1.0 for non-English:

  ```typescript
  // BEFORE (line 240):
  utterance.pitch = Number.isFinite(settings.pitch) ? settings.pitch : DEFAULT_SETTINGS.pitch

  // AFTER:
  utterance.pitch = isNonEnglish ? 1.0 : (Number.isFinite(settings.pitch) ? settings.pitch : DEFAULT_SETTINGS.pitch)
  ```

  - In the same file, modify the localStorage loading path (lines 168-172) to force `ttsMode: 'hd'`:

  ```typescript
  // BEFORE (line 168-172):
  setSettingsState({
    ...DEFAULT_SETTINGS,
    ...parsed,
    selectedVoice: savedVoice || englishVoices[0] || null,
  })

  // AFTER:
  setSettingsState({
    ...DEFAULT_SETTINGS,
    ...parsed,
    selectedVoice: savedVoice || englishVoices[0] || null,
    ttsMode: 'hd',  // Force HD mode (device mode removed from UI)
  })
  ```

  **Must NOT do**:
  - Do NOT remove `pitch` or `ttsMode` from `TTSSettings` interface
  - Do NOT modify `speakWithCallback` routing logic (lines 414-425)
  - Do NOT modify HD TTS fallback logic (lines 357-401)
  - Do NOT change `DEFAULT_SETTINGS` (it already has `ttsMode: 'hd'` and `pitch: 1.2` which is still used for English device fallback)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two small changes in one file, very precise edits
  - **Skills**: [`frontend-patterns`, `coding-standards`]
    - `frontend-patterns`: React context and state management patterns
    - `coding-standards`: TypeScript best practices
  - **Skills Evaluated but Omitted**:
    - `pwa-update-guide`: Not related to service worker or cache
    - `react-perf-triage`: No performance concern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 6)
  - **Blocks**: Task 5 (build verification)
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `frontend/src/contexts/TTSContext.tsx:234-278` - `createUtterance` function. Line 238 defines `isNonEnglish`. Line 239 already uses `isNonEnglish` for rate. Line 240 is the target for pitch fix. Follow the EXACT same pattern as line 239.
  - `frontend/src/contexts/TTSContext.tsx:161-178` - localStorage loading block. Line 162 reads from `localStorage.getItem('tts-settings')`. Lines 168-172 apply parsed settings. This is where `ttsMode: 'hd'` override goes.

  **API/Type References**:
  - `frontend/src/contexts/TTSContext.tsx:20-26` - `TTSSettings` interface definition (DO NOT modify)
  - `frontend/src/contexts/TTSContext.tsx:55-61` - `DEFAULT_SETTINGS` constant (DO NOT modify)

  **Acceptance Criteria**:

  ```
  Scenario: Verify pitch fix applied correctly in code
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -n "utterance.pitch" frontend/src/contexts/TTSContext.tsx
      2. Assert: line contains "isNonEnglish ? 1.0"
    Expected Result: Pitch uses isNonEnglish conditional
    Evidence: grep output captured

  Scenario: Verify localStorage migration forces HD mode
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -A5 "...parsed," frontend/src/contexts/TTSContext.tsx
      2. Assert: contains "ttsMode: 'hd'"
    Expected Result: ttsMode forced to 'hd' on load
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Tasks 1, 3, 4)
  - Message: `fix(tts): set Korean pitch to 1.0 and force HD mode on load`
  - Files: `frontend/src/contexts/TTSContext.tsx`

---

- [ ] 3. Simplify TTSSettingsModal to Edge TTS Only

  **What to do**:
  - In `frontend/src/components/TTSSettingsModal.tsx`:
    1. **Remove** mode toggle section (lines 82-106): the `<div>` containing "음성 품질" label and HD/기기 toggle buttons
    2. **Remove** device voice selection section (lines 139-224): the entire `else` branch with `femaleVoices`, `maleVoices`, `otherVoices` rendering
    3. **Remove** the conditional `{isHD ? (` wrapper around HD voice section - make HD voice section always rendered
    4. **Remove** pitch slider section (lines 248-270): the "음높이" slider
    5. **Remove** dead code:
       - `handleModeChange` function (line 19-21)
       - `handlePitchChange` function (line 38-40)
       - `handleVoiceChange` function (line 27-32)
       - `isHD` variable (line 17)
       - `femaleVoices`, `maleVoices`, `otherVoices` variables (lines 60-62)
    6. **Keep**: HD voice selection UI, speed slider, test button, header, footer
    7. **Remove** `voices` and `isLoaded` from the useTTS() destructuring (line 12) since they're no longer needed in this component

  **Must NOT do**:
  - Do NOT restructure or refactor the modal layout beyond removing sections
  - Do NOT change the HD voice selection UI or behavior
  - Do NOT change the speed slider
  - Do NOT change the test button

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Deletion-heavy task with clear boundaries, no new code creation
  - **Skills**: [`frontend-patterns`, `coding-standards`]
    - `frontend-patterns`: React component patterns
    - `coding-standards`: TypeScript cleanup
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No new UI design needed, just removal
    - `frontend-design`: No new visual elements

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 6)
  - **Blocks**: Task 5 (build verification)
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `frontend/src/components/TTSSettingsModal.tsx:1-289` - Entire file. Lines 82-106 (mode toggle to remove), lines 109-138 (HD voice section to KEEP but unwrap from conditional), lines 139-224 (device voice section to REMOVE), lines 248-270 (pitch slider to REMOVE).
  - `frontend/src/contexts/TTSContext.tsx:28-38` - `TTSContextType` interface showing what `useTTS()` returns. After cleanup, modal only needs `hdVoices`, `settings`, `setSettings`, `speak` from useTTS().

  **API/Type References**:
  - `frontend/src/contexts/TTSContext.tsx:44-52` - `HD_VOICES` array (referenced by the HD voice selection UI that we're keeping)
  - `frontend/src/contexts/TTSContext.tsx:6-18` - `TTSVoice` and `HDVoice` types. After cleanup, `TTSVoice` import can be removed from the modal if not used.

  **Acceptance Criteria**:

  ```
  Scenario: Verify device mode toggle removed
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -c "기기 음성" frontend/src/components/TTSSettingsModal.tsx
      2. Assert: count is 0
    Expected Result: No "기기 음성" text in modal
    Evidence: grep output

  Scenario: Verify pitch slider removed
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -c "음높이" frontend/src/components/TTSSettingsModal.tsx
      2. Assert: count is 0
    Expected Result: No pitch slider text in modal
    Evidence: grep output

  Scenario: Verify dead handlers removed
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -c "handleModeChange\|handlePitchChange\|handleVoiceChange" frontend/src/components/TTSSettingsModal.tsx
      2. Assert: count is 0
    Expected Result: No dead handlers remain
    Evidence: grep output

  Scenario: Verify HD voice selection preserved
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -c "handleHDVoiceChange\|HD 음성 선택" frontend/src/components/TTSSettingsModal.tsx
      2. Assert: count >= 2 (function + label)
    Expected Result: HD voice UI preserved
    Evidence: grep output

  Scenario: Verify speed slider preserved
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep -c "handleRateChange\|속도" frontend/src/components/TTSSettingsModal.tsx
      2. Assert: count >= 2
    Expected Result: Speed slider preserved
    Evidence: grep output
  ```

  **Commit**: YES (groups with Tasks 1, 2, 4)
  - Message: `refactor(tts-settings): simplify to Edge TTS only, remove device mode`
  - Files: `frontend/src/components/TTSSettingsModal.tsx`

---

- [ ] 4. Update my/page.tsx Settings Button Text

  **What to do**:
  - In `frontend/src/app/my/page.tsx`, line 162:

  ```typescript
  // BEFORE:
  <p className="text-xs text-[#8a8a8a]">TTS 음성, 속도, 높낮이 설정</p>

  // AFTER:
  <p className="text-xs text-[#8a8a8a]">HD 음성, 속도 설정</p>
  ```

  **Must NOT do**:
  - Do NOT change anything else on this page
  - Do NOT change the button behavior or icon

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single line text change
  - **Skills**: [`frontend-patterns`]
    - `frontend-patterns`: Understanding component text patterns
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI design change
    - `coding-standards`: Overkill for text change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 6)
  - **Blocks**: Task 5 (build verification)
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `frontend/src/app/my/page.tsx:149-168` - The settings button block. Line 161 has the main label "음성 설정" (keep unchanged). Line 162 has the subtitle text to change.

  **Acceptance Criteria**:

  ```
  Scenario: Verify button text updated
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. grep "HD 음성, 속도 설정" frontend/src/app/my/page.tsx
      2. Assert: match found
      3. grep -c "높낮이" frontend/src/app/my/page.tsx
      4. Assert: count is 0
    Expected Result: Updated text present, old text removed
    Evidence: grep output
  ```

  **Commit**: YES (groups with Tasks 1, 2, 3)
  - Message: `fix(my): update TTS settings description to HD-only`
  - Files: `frontend/src/app/my/page.tsx`

---

- [ ] 5. Build Verification + Integration Check

  **What to do**:
  - Run `cd frontend && npm run build` and verify exit code 0
  - Verify no TypeScript errors from the changes
  - Check that imports are clean (no unused imports after Task 3 cleanup)

  **Must NOT do**:
  - Do NOT fix unrelated build errors (report them if found)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Build command execution and verification
  - **Skills**: [`frontend-patterns`, `verification-before-completion`]
    - `frontend-patterns`: Understanding Next.js build process
    - `verification-before-completion`: Ensuring evidence-based verification
  - **Skills Evaluated but Omitted**:
    - `coding-standards`: Build verification, not code writing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential, after Wave 1)
  - **Blocks**: None (final gate)
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References** (CRITICAL):

  **Documentation References**:
  - `frontend/package.json` - Build script configuration

  **Acceptance Criteria**:

  ```
  Scenario: Frontend builds successfully
    Tool: Bash
    Preconditions: All code changes from Tasks 1-4 applied
    Steps:
      1. cd frontend && npm run build
      2. Assert: exit code 0
      3. Assert: no TypeScript errors in output
    Expected Result: Clean build with zero errors
    Evidence: Build output captured

  Scenario: No unused imports after cleanup
    Tool: Bash (grep)
    Preconditions: Build passes
    Steps:
      1. Check TTSSettingsModal.tsx doesn't import TTSVoice if unused
      2. Check no unused variables warnings in build output
    Expected Result: Clean imports
    Evidence: Build output / grep results
  ```

  **Commit**: NO (verification only)

---

- [ ] 6. Save Original Prompt as MD File

  **What to do**:
  - Create `prompts/fix-setup-korean-tts-prompt.md` with the complete original prompt/request that was provided by the user
  - Include all sections: problem description, required changes, root cause analysis, files to modify, constraints

  **Must NOT do**:
  - Do NOT modify any existing files in `prompts/`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation with provided content
  - **Skills**: [`writing`]
    - `writing`: Documentation writing
  - **Skills Evaluated but Omitted**:
    - `tech-readme`: Not a README, just a prompt archive

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References**:
  - `prompts/bugreport_prompt.md` - Existing prompt file format for reference

  **Acceptance Criteria**:

  ```
  Scenario: Prompt file exists
    Tool: Bash (ls)
    Preconditions: File created
    Steps:
      1. ls -la prompts/fix-setup-korean-tts-prompt.md
      2. Assert: file exists and is non-empty
    Expected Result: File exists
    Evidence: ls output
  ```

  **Commit**: YES
  - Message: `docs(prompts): save fix-setup-korean-tts prompt`
  - Files: `prompts/fix-setup-korean-tts-prompt.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1, 2, 3, 4 (grouped) | `fix: Korean setup response, TTS pitch, HD-only settings` | `backend/api/chat.py`, `frontend/src/contexts/TTSContext.tsx`, `frontend/src/components/TTSSettingsModal.tsx`, `frontend/src/app/my/page.tsx` | `cd frontend && npm run build` |
| 6 | `docs(prompts): save fix-setup-korean-tts prompt` | `prompts/fix-setup-korean-tts-prompt.md` | File exists |

---

## Success Criteria

### Verification Commands
```bash
# 1. Build check
cd frontend && npm run build  # Expected: exit code 0

# 2. Backend fix verification (requires backend running)
curl -s -X POST http://localhost:7860/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "카페에서 주문하는 상황이야", "system_prompt": "너는 한국어로만 대화하는 도우미야."}' | python3 -c "import sys,json; print(json.load(sys.stdin)['message'])"
# Expected: Korean response

# 3. Code-level verifications
grep -c "기기 음성" frontend/src/components/TTSSettingsModal.tsx   # Expected: 0
grep -c "음높이" frontend/src/components/TTSSettingsModal.tsx       # Expected: 0
grep "isNonEnglish ? 1.0" frontend/src/contexts/TTSContext.tsx      # Expected: match
grep "HD 음성, 속도 설정" frontend/src/app/my/page.tsx              # Expected: match
grep "ttsMode: 'hd'" frontend/src/contexts/TTSContext.tsx           # Expected: match in localStorage load
ls prompts/fix-setup-korean-tts-prompt.md                           # Expected: file exists
```

### Final Checklist
- [ ] Backend respects custom system_prompt (Korean setup gets Korean response)
- [ ] Normal chat (no system_prompt) still works in English
- [ ] Korean TTS pitch is 1.0
- [ ] Settings modal is HD-only (no device mode, no pitch slider)
- [ ] localStorage loads force ttsMode to 'hd'
- [ ] my/page.tsx button text updated
- [ ] Prompt MD file saved
- [ ] `npm run build` passes cleanly
