# Project Context

이 파일은 이 프로젝트에서 Claude가 참조하는 프로젝트 전용 가이드라인이다.

**별칭**: 프로젝트 컨텍스트, project_context, 프로젝트 컨텍스트 파일

---

## 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트 이름 | EnPeak |
| 설명 | AI 기반 영어 학습 PWA 앱 (Speak과 유사) |
| 기술 스택 | Next.js 14, FastAPI, Groq/Mistral LLM, ChromaDB |
| 생성일 | 2026-01-31 |
| 버전 | 0.2.8 |

---

## 아키텍처

```
사용자 음성/텍스트 입력
    -> Web Speech API (STT)
    -> FastAPI 백엔드
    -> LLM 응답 생성 (Mistral/Groq)
    -> gTTS (TTS)
    -> 음성/텍스트 출력
```

---

## 폴더 구조

```
enpeak/
├── backend/              # FastAPI 백엔드
│   ├── main.py
│   ├── api/              # API 엔드포인트
│   ├── core/             # LLM, 프롬프트
│   └── scenarios/
├── frontend/             # Next.js 프론트엔드
│   ├── src/app/          # 페이지
│   └── src/components/   # 컴포넌트
├── data/                 # 데이터 파일
│   ├── scenarios/        # 롤플레이 시나리오
│   ├── collected/        # 수집된 원본 데이터
│   └── rag_chunks/       # RAG용 청크 데이터
├── scripts/              # 데이터 처리 스크립트
├── vectordb/             # ChromaDB 벡터 DB
└── docs/                 # 프로젝트 문서
```

---

## 배포 환경

| 환경 | 서비스 | URL |
|------|--------|-----|
| 프론트엔드 | Firebase Hosting | https://enpeak.web.app |
| 백엔드 | HuggingFace Spaces | https://wonchulhee-enpeak.hf.space |
| 포트 | HF Spaces 표준 | 7860 |

---

## 이 프로젝트의 규칙

### 코딩 컨벤션
- 이모티콘 사용 금지 (코드, 주석, UI 텍스트 모두)
- 명확하고 간결한 한국어/영어 텍스트 사용

### 백엔드 규칙
- Python 3.11+, 타입 힌트 사용
- FastAPI + Pydantic 모델
- 무료 API 우선 (Groq)

### 프론트엔드 규칙
- Next.js 14 App Router
- TypeScript 필수
- 모바일 앱 스타일 UI (PWA)
- Web Speech API 우선 사용

### 음성 처리
- 프론트엔드 Web Speech API 우선 (무료, 빠름)
- 백엔드는 폴백용 (Groq Whisper, gTTS)

---

## 핵심 기능

1. **자유 회화 (Free Conversation)**: AI와 자유롭게 영어로 대화
2. **상황별 롤플레이 (Roleplay)**: 카페 주문, 호텔 체크인, 면접 등
3. **단어 학습**: 레벨별 단어 연습 (A1-C2)
4. **RAG 검색**: 5,375개 청크 (단어, 숙어, 대화, 표현)

---

## 환경 변수

```bash
# LLM API (하나 이상 필수)
MISTRAL_API_KEY=your_mistral_key
GROQ_API_KEY=your_groq_key

# 앱 설정
EMBEDDINGS_MODEL_NAME=intfloat/multilingual-e5-base
CHROMADB_PATH=./vectordb
DEBUG=false

# CORS
ALLOWED_ORIGINS=https://enpeak.web.app,http://localhost:3000
```

---

## 룰 관리 (메타 룰)

### 사용자 요청 시
사용자가 "이거 프로젝트컨텍스트에 넣어줘" 또는 유사한 요청을 하면:

1. **분석**: 어떤 행동에 대한 룰인지 파악
2. **판단**: `project_context_rules.md` 기준에 부합하는지 확인
3. **실행**:
   - 새로운 행동 -> `rules/[행동명].md` 생성
   - 기존 행동 -> 해당 룰 파일 업데이트
4. **참조 추가**: 아래 "행동별 룰 참조" 섹션에 추가

### 작업 완료 후 자동 판단
Claude는 작업 완료 후 스스로 판단한다:

1. **판단**: 이 작업 내용이 어디에 들어갈 만한가?
   - 모든 프로젝트 공통 -> `root_context`에 제안
   - 이 프로젝트만 해당 -> `project_context`에 제안
2. **제안**: 기준 충족 시 사용자에게 제안
   > "이 내용을 project_context에 추가할까요?"
3. **사용자 동의 시**:
   - 룰/가이드 필요 -> `rules/[행동명].md` 생성 또는 수정
   - 핵심 내용 -> `project_context.md`에 기록
   - 테이블에 참조 추가
4. **미충족 시**: 제안하지 않음

---

## 행동별 룰 참조

| 행동 | 룰 파일 | 설명 |
|------|---------|------|
| (추후 추가) | `rules/[name].md` | (설명) |

---

## 참고

- **공통 룰**: `/Users/chulheewon/development/claude/docs/root_context.md`
- **작성 규칙**: `project_context_rules.md`
- **상세 문서**: `CLAUDE.md` (프로젝트 루트)
