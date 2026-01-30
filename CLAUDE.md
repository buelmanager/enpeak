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
├── CLAUDE.md                  # 프로젝트 문서
├── backend/
│   ├── main.py               # FastAPI 앱
│   ├── requirements.txt
│   ├── api/
│   │   ├── chat.py           # 자유 회화 API
│   │   ├── roleplay.py       # 롤플레이 API
│   │   ├── speech.py         # STT/TTS API
│   │   └── feedback.py       # 문법 피드백 API
│   ├── core/
│   │   ├── llm.py            # LLM 매니저 (Mistral/Groq)
│   │   └── prompts.py        # 영어 튜터 프롬프트
│   └── scenarios/
│       └── scenario_engine.py
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── public/
│   │   └── manifest.json     # PWA 설정
│   └── src/
│       ├── app/
│       │   ├── page.tsx      # 홈
│       │   ├── chat/         # 자유 회화
│       │   └── roleplay/     # 롤플레이
│       └── components/
│           ├── ChatWindow.tsx
│           ├── VoiceRecorder.tsx
│           └── MessageBubble.tsx
├── data/
│   └── scenarios/            # 롤플레이 시나리오 JSON
│       ├── cafe_order.json
│       └── hotel_checkin.json
├── vectordb/                 # ChromaDB (향후 RAG용)
├── Dockerfile
└── .env.example
```

---

## API 엔드포인트

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
