# EnPeak - AI 영어 학습 웹앱

## 프로젝트 개요

Speak과 유사한 AI 기반 영어 학습 PWA 앱.
사용자가 AI와 음성으로 대화하며 영어 회화 실력을 향상시킨다.

---

## 아키텍처

```
사용자 음성/텍스트 입력
    → Web Speech API (STT)
    → FastAPI 백엔드
    → LLM 응답 생성 (Mistral/Groq)
    → gTTS (TTS)
    → 음성/텍스트 출력
```

---

## 기술 스택

### 서버 인프라
- **배포 플랫폼**: HuggingFace Spaces (Docker) + Vercel (프론트엔드)
- **포트**: 7860 (HF Spaces 표준)

### AI 모델
- **LLM**: Groq API (llama-3.1-70b) 또는 Mistral API (open-mixtral-8x7b)
- **STT**: Web Speech API (프론트엔드) / Groq Whisper (백엔드 폴백)
- **TTS**: Web Speech API (프론트엔드) / gTTS (백엔드 폴백)

### 프론트엔드
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (스타일링)
- **PWA** (manifest.json, 앱 설치 가능)

### 백엔드
- **FastAPI** (Python 3.11)
- **포트 7860** 통합 서빙

---

## 핵심 기능

### 1. 자유 회화 (Free Conversation)
- AI와 자유롭게 영어로 대화
- 실시간 문법 피드백
- 음성 입력/출력 지원

### 2. 상황별 롤플레이 (Roleplay)
- 카페 주문, 호텔 체크인, 면접 등
- 단계별 가이드 및 힌트
- 세션 완료 후 리포트

---

## 프로젝트 구조

```
enpeak/
├── CLAUDE.md                      # 프로젝트 문서
├── backend/
│   ├── main.py                    # FastAPI 앱
│   ├── requirements.txt
│   ├── api/
│   │   ├── chat.py                # 자유 회화 API
│   │   ├── roleplay.py            # 롤플레이 API
│   │   ├── speech.py              # STT/TTS API
│   │   ├── feedback.py            # 문법 피드백 API
│   │   ├── vocabulary.py          # 단어 학습 API
│   │   └── rag.py                 # RAG 검색 API
│   ├── core/
│   │   ├── llm.py                 # LLM 매니저 (Mistral/Groq)
│   │   └── prompts.py             # 영어 튜터 프롬프트
│   └── scenarios/
│       └── scenario_engine.py
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── public/
│   │   └── manifest.json          # PWA 설정
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # 홈
│       │   ├── chat/              # 자유 회화
│       │   └── roleplay/          # 롤플레이
│       └── components/
│           ├── ChatWindow.tsx
│           ├── VoiceRecorder.tsx
│           └── MessageBubble.tsx
├── data/
│   ├── scenarios/                 # 롤플레이 시나리오 JSON (14개)
│   ├── collected/                 # 수집된 원본 데이터
│   │   ├── vocabulary/            # 단어 데이터 (2,648개)
│   │   ├── idioms/                # 숙어 데이터
│   │   └── tatoeba/               # 예문 데이터
│   └── rag_chunks/                # RAG용 청크 데이터
│       ├── all_chunks.json        # 통합 데이터 (5,375개)
│       ├── dialogsum_chunks.json  # 대화 데이터
│       ├── expressions_chunks.json # 표현 데이터
│       ├── patterns_chunks.json   # 문법 패턴
│       └── vocabulary_chunks.json # 단어 청크
├── scripts/                       # 데이터 수집/처리 스크립트
│   ├── download_datasets.py       # 오픈소스 데이터 다운로드
│   ├── expand_vocabulary.py       # 단어 확장 (A1-C2)
│   ├── generate_expressions.py    # 표현 생성
│   ├── generate_patterns.py       # 문법 패턴 생성
│   ├── generate_more_idioms.py    # 숙어 생성
│   ├── final_merge.py             # 데이터 통합
│   └── index_to_chromadb.py       # ChromaDB 인덱싱
├── vectordb/                      # ChromaDB 벡터 DB
│   └── chroma.sqlite3             # 인덱스 파일 (6MB)
├── venv/                          # Python 가상환경
├── Dockerfile
└── .env.example
```

---

## API 엔드포인트

### 기본 API
| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/health` | GET | 헬스체크 |
| `/api/chat` | POST | 자유 회화 |
| `/api/speech/stt` | POST | 음성→텍스트 |
| `/api/speech/tts` | POST | 텍스트→음성 |
| `/api/roleplay/scenarios` | GET | 시나리오 목록 |
| `/api/roleplay/start` | POST | 세션 시작 |
| `/api/roleplay/turn` | POST | 대화 턴 |
| `/api/roleplay/end` | POST | 세션 종료 |
| `/api/feedback/grammar` | POST | 문법 체크 |

### RAG API
| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/rag/search` | POST/GET | RAG 검색 (영어/한국어) |
| `/api/rag/related/{word}` | GET | 단어 관련 콘텐츠 검색 |
| `/api/rag/stats` | GET | RAG 데이터 통계 |

### Vocabulary API
| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/vocabulary/add` | POST | 단어 등록 (AI 추천 + 검증) |
| `/api/vocabulary/expand` | POST | 단어 → 숙어/예문 확장 |
| `/api/vocabulary/list` | GET | 등록 단어 목록 |
| `/api/vocabulary/remove/{word}` | DELETE | 단어 삭제 |
| `/api/vocabulary/search/{query}` | GET | 통합 검색 |

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
ALLOWED_ORIGINS=https://enpeak.vercel.app,http://localhost:3000
```

---

## 로컬 개발

### 백엔드
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 7860
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

---

## 배포

### Vercel (프론트엔드)
```bash
cd frontend
npx vercel --prod
```

### HuggingFace Spaces (백엔드)
1. HF Spaces 생성 (Docker)
2. GitHub 연결
3. 환경변수 설정 (GROQ_API_KEY 등)

---

## 롤플레이 시나리오 구조

```json
{
  "id": "cafe_order",
  "title": "Ordering at a Cafe",
  "title_ko": "카페 주문하기",
  "category": "daily",
  "difficulty": "beginner",
  "roles": { "ai": "Barista", "user": "Customer" },
  "stages": [
    {
      "stage": 1,
      "name": "Greeting",
      "ai_opening": "Hi! Welcome to Sunny Cafe.",
      "learning_tip": "Use 'I'd like...' to order politely",
      "suggested_responses": ["Hi! I'd like a latte."]
    }
  ]
}
```

---

## 버전 정보

- **APP_VERSION**: 0.1.0
- **BUILD_DATE**: 2026-01-30

---

## 작업 시 참고사항

### 백엔드
- Python 3.11+, 타입 힌트 사용
- FastAPI + Pydantic 모델
- 무료 API 우선 (Groq)

### 프론트엔드
- Next.js 14 App Router
- TypeScript 필수
- 모바일 앱 스타일 UI (PWA)
- Web Speech API 우선 사용

### 음성 처리
- 프론트엔드 Web Speech API 우선 (무료, 빠름)
- 백엔드는 폴백용 (Groq Whisper, gTTS)

---

## 데이터 수집 및 학습 시스템

### 1. 사용자 대화셋 생성 시스템
```
사용자 입력 → AI 협업 생성 → 감시 AI 검증 → RAG 저장
```
- 사용자가 AI와 함께 커스텀 대화 시나리오 생성
- RAG로 기존 대화 패턴 참조하여 자연스러운 대화 생성
- 감시 AI가 부적절한 콘텐츠 필터링 및 품질 검증

### 2. 단어 학습 → 확장 시스템
```
단어 등록 → AI 분석 → RAG 검색 → 관련 숙어 → 예문 생성
```
- 사용자가 단어 등록 (with AI 추천 + 감시 AI 검증)
- 자동으로 관련 숙어/표현 RAG 검색
- AI가 실생활 예문 및 대화 컨텍스트 생성

### 3. 콘텐츠 품질 관리 (감시 AI)
- 모든 사용자 생성 콘텐츠 검증
- 부적절한 내용 필터링
- 문법/표현 정확성 검증
- 학습 효과 평가

---

## 데이터 소스 (상업적 사용 가능)

| 데이터셋 | 라이선스 | 용도 |
|---------|---------|------|
| DialogSum | Apache 2.0 | 일상 대화 (1,500 청크) |
| Tatoeba | CC0 | 예문 및 번역 |
| Custom Generated | - | 단어, 표현, 숙어, 문법 패턴 |

---

## RAG 데이터 현황

**총 5,375개 청크** (ChromaDB 인덱싱 완료)

| 데이터 타입 | 개수 | 설명 |
|------------|------|------|
| vocabulary | 2,661 | A1-C2 레벨별 단어 |
| dialogue | 1,500 | DialogSum 대화 데이터 |
| expression | 720 | 16개 카테고리 일상 표현 |
| idiom | 137 | 숙어/관용표현 |
| useful_sentence | 120 | 유용한 문장 |
| grammar_pattern | 80 | 문법 패턴 |
| scenario_vocabulary | 42 | 시나리오 관련 단어 |
| sentence_pair | 32 | 영한 문장 쌍 |
| phrasal_verb | 15 | 구동사 |
| scenario | 14 | 롤플레이 시나리오 |

### 레벨별 단어 분포
- A1: 331개 (초급)
- A2: 349개
- B1: 448개 (중급)
- B2: 326개
- C1: 352개 (고급)
- C2: 398개

### 표현 카테고리
greeting, cafe, restaurant, shopping, transport, hotel, airport, business, phone, emergency, opinion, daily, compliment, apology, thanks, request

---

## 데이터 수집 스크립트

```bash
cd scripts

# 데이터셋 다운로드
python download_datasets.py

# 단어 확장 (A1-C2)
python expand_vocabulary.py

# 표현/패턴 생성
python generate_expressions.py
python generate_patterns.py
python generate_more_idioms.py

# 최종 통합
python final_merge.py

# ChromaDB 인덱싱
python index_to_chromadb.py
```

---

## RAG API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/rag/search` | POST/GET | RAG 검색 (영어/한국어) |
| `/api/rag/related/{word}` | GET | 단어 관련 콘텐츠 검색 |
| `/api/rag/stats` | GET | RAG 데이터 통계 |

### RAG 검색 파라미터
- `query`: 검색어 (영어/한국어)
- `n_results`: 결과 개수 (기본 10)
- `filter_type`: 타입 필터 (vocabulary, expression, idiom 등)
- `filter_level`: 레벨 필터 (A1-C2)
- `filter_category`: 카테고리 필터 (cafe, business 등)

---

## 배포 현황

### GitHub
- **Repository**: https://github.com/buelmanager/enpeak (Private)

### HuggingFace Spaces (백엔드)
- **URL**: https://wonchulhee-enpeak.hf.space
- **Status**: Running
- **환경변수**: MISTRAL_API_KEY 설정됨

---

## 기술 스택 상세

### RAG 시스템
- **Vector DB**: ChromaDB (Persistent)
- **Embedding Model**: paraphrase-multilingual-MiniLM-L12-v2 (sentence-transformers)
- **지원 언어**: 영어, 한국어 (다국어 검색 지원)

### 주요 의존성
```
# Backend
fastapi>=0.109.0
chromadb>=0.4.0
sentence-transformers>=2.2.0
gtts>=2.5.0

# Data Processing
datasets (HuggingFace)
```
