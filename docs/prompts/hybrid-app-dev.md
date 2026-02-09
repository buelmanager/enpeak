# Hybrid App Development Prompt

## 요청 내용

flu 폴더에 하이브리드 앱을 새로 개발하세요.

### 리서치
1. hybrid-plan.md 문서를 참고하세요.

### 분석
2. hybrid-plan.md 내용을 분석하여서 frontend 와 flu 의 개발 내용을 분석 하세요.

### 구현
3. 분석한 내용을 바탕으로 frontend에 필요한 껍데기 앱을 flu 폴더에 개발하세요.
   - hybrid-plan.md 문서를 참고하여 안정성을 최우선으로한 하이브리드 앱을 개발하세요.
   - 주요 내용은 인증, 녹음 입니다.
   - 그리고 개선 내용이 있다면 추가해주세요.
   - 먼저 플랜을 세우고 plan_v1.md 에 저장하세요.
   - 각 스텝별로 진행하고 스텝이 완료되면 문서를 업데이트하세요
   - 업데이트는 [completed] 형태로 문서의 해당 스텝 내용을 수정하여서 저장해주세요.
   - 현재프롬프트를 prompts 폴더에 md 형태로 저장해주세요.

## 참조 문서
- `docs/prompts/hybrid-plan.md` - 하이브리드 아키텍처 기술 스펙 (v3.3)

## 핵심 요구사항
- **Thin Shell, Fat Web** 철학: Flutter는 네이티브 기능(인증, 녹음, TTS)만 담당
- **인증**: 네이티브 Firebase 로그인 → WebView idToken 주입 → 웹 세션 동기화
- **녹음**: 네이티브 마이크 제어 → base64 인코딩 → WebView 전달
- **안정성 최우선**: 메모리 관리, 에러 핸들링, 크로스 플랫폼 호환
