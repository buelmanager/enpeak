# Flutter Migration Prompt

## Original Request

```
/Users/chulheewon/development/main_project/chatbot/enpeak 를 분석하여서 flutter 로 신규로 개발하세요.

#리서치 1. /Users/chulheewon/development/main_project/chatbot/enpeak 의 가이드라인, 컨텍스트파일등 md 파일, 코드 파일 확인
#분석 2. md 파일 분석, 코드 파일 분석
# 분석한 내용을 바탕으로 똑같이 flutter 로 신규로 개발하세요. 필요시에는 claude agent와 skill을 만들어서 병렬로 구현하시오
이슈 상황 발생시 docs에 md 파일로 이슈를 남기시오
중요한 내용과 핵심 사항들은 claude.md파일에 업데이트 하세요. 이 프롬프트는 docs/prompts에 남기세요
```

## Follow-up

```
이름은 flu로 하세
```

## Interpretation

1. Analyze the existing EnPeak Next.js + FastAPI English learning PWA
2. Build a complete Flutter app ("flu") replicating 100% of functionality
3. Same backend API (no backend changes needed)
4. Use parallel Claude agents for implementation
5. Document issues in docs/
6. Update CLAUDE.md with key findings
7. Save this prompt in docs/prompts/

## Execution Plan

### Phase 1: Research (COMPLETED)
- Read all MD files, context files, project structure
- Analyze 10 frontend pages, 25+ components, 4 contexts
- Analyze 20+ backend API endpoints
- Research Flutter architecture patterns, speech/TTS, PWA

### Phase 2: Implementation (IN PROGRESS)
Wave 1 (Parallel):
- Agent A: pubspec.yaml, core layer (theme, API client, DI, errors)
- Agent B: All data models, repositories, datasources (8 features)
- Agent C: main.dart, navigation shell, screen scaffolds

Wave 2 (Parallel, after Wave 1):
- Agent D: Talk feature (Chat, Expression, Roleplay) - most complex
- Agent E: Cards feature (vocabulary flashcards)
- Agent F: Home, My, Stats, remaining screens

Wave 3:
- Integration testing
- Build verification
- Documentation



1. User Requests (As-Is)
1. "flu 폴더의 md 파일을 상세하게 읽고 플랜을 계속 진행 하세요." (earlier sessions)
2. "앞으로 진행상황을 plan.md에 스텝마다 업데이트 하세요." (earlier sessions)
3. "Continue if you have next steps" (earlier sessions)
4. "엔픽이 아니고 flu 이고, ios andorid, web, macos, windows 모두 가능하도록 세팅해" (earlier sessions)
5. "모든 개발을 마치면 다음내용을 진행하세요. #리서치 1. 프론트앤드에서 각화면을 자세히 확인하고, 어떠한 UI가 있는지 찾아보세요. #분석 2. 각 화면에 있는 위젯을 상세하게 정리하고 어떠한 기능인지를 상세히 정리하여서 MD로 남기세요. 3. 전체의 톤엔매너와 UI의 스타일을 분석하여서 MD로 정리하세요. 4. 각화면의 위젯 또는 모듈 단위로 상세하게 분석하여서 MD에 정리하세요. #구현 5.정리된 화면에 대한 MD를 확인하여서 화면별로 상세하게 분석된 모듈, 위젯 에 대한 분석 내용을 확인하고 동일하게 개발하고 더 나은 개선사항이 있다면 md로 정리하고 개발하세요. - plan2.md를 생성하고 전체 플랜의


1. "flu 폴더의 md 파일을 상세하게 읽고 플랜을 계속 진행 하세요." (earlier sessions)
2. "앞으로 진행상황을 plan.md에 스텝마다 업데이트 하세요." (earlier sessions)
3. "Continue if you have next steps" (earlier sessions)
4. "엔픽이 아니고 flu 이고, ios andorid, web, macos, windows 모두 가능하도록 세팅해" (earlier sessions)
5. "모든 개발을 마치면 다음내용을 진행하세요. #리서치 1. 프론트앤드에서 각화면을 자세히 확인하고, 어떠한 UI가 있는지 찾아보세요. #분석 2. 각 화면에 있는 위젯을 상세하게 정리하고 어떠한 기능인지를 상세히 정리하여서 MD로 남기세요. 3. 전체의 톤엔매너와 UI의 스타일을 분석하여서 MD로 정리하세요. 4. 각화면의 위젯 또는 모듈 단위로 상세하게 분석하여서 MD에 정리하세요. #구현 5.정리된 화면에 대한 MD를 확인하여서 화면별로 상세하게 분석된 모듈, 위젯 에 대한 분석 내용을 확인하고 동일하게 개발하고 더 나은 개선사항이 있다면 md로 정리하고 개발하세요. - plan2.md를 생성하고 전체 플랜의 상세한 내용을 정리하세요. - 각 단계가 진행될때마다 업데이트 하세요." 
6. 