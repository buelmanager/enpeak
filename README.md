---
title: EnPeak
emoji: EN
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# EnPeak

AI 기반 영어 회화 학습 PWA 웹앱. 음성 인식과 AI 튜터를 통해 실시간 영어 회화 연습을 제공한다.

**주요 기능**
- 자유 회화: AI와 자유롭게 영어 대화
- 상황별 롤플레이: 카페, 호텔, 면접 등 14개 시나리오
- 단어 학습: A1-C2 레벨별 2,600+ 단어, RAG 기반 연관 학습

---

## Tech Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| State | React 18 (useState/useEffect) |
| HTTP Client | Axios |
| Auth/DB | Firebase SDK 12.8 |

### Backend
| Category | Technology |
|----------|------------|
| Framework | FastAPI 0.109 |
| Language | Python 3.11 |
| Validation | Pydantic 2.6 |
| Vector DB | ChromaDB 0.4 |
| Embedding | sentence-transformers (multilingual-e5-base) |
| TTS | gTTS / Web Speech API |
| STT | Web Speech API / Groq Whisper |

### AI/LLM
| Provider | Model | Usage |
|----------|-------|-------|
| Groq | llama-3.1-70b | Primary LLM |
| Mistral | open-mixtral-8x7b | Fallback LLM |
| Groq | whisper-large-v3 | Backend STT |

### Infrastructure
| Service | Platform |
|---------|----------|
| Frontend Hosting | Firebase Hosting |
| Backend Hosting | HuggingFace Spaces (Docker) |
| Database | Firebase Firestore |
| Vector Store | ChromaDB (Persistent) |

---

## Architecture

```
+-------------------------------------------------------------------+
|                         Client (PWA)                              |
|  +--------------+  +--------------+  +--------------------------+ |
|  | Next.js App  |  | Web Speech   |  | Firebase SDK             | |
|  | (React 18)   |  | API (STT)    |  | (Auth, Firestore)        | |
|  +------+-------+  +------+-------+  +------------+-------------+ |
+---------|-----------------|-----------------------|---------------+
          |                 |                       |
          v                 v                       v
+-------------------------------------------------------------------+
|                      FastAPI Backend                              |
|  +-------------------------------------------------------------+  |
|  |                     API Routes                              |  |
|  |  /api/chat    /api/roleplay    /api/vocabulary              |  |
|  |  /api/speech  /api/feedback    /api/rag                     |  |
|  +----------------------------+--------------------------------+  |
|                               |                                   |
|  +----------------------------v--------------------------------+  |
|  |                    Core Services                            |  |
|  |  +--------------+  +--------------+  +------------------+   |  |
|  |  | LLM Manager  |  |   RAG        |  | Scenario Engine  |   |  |
|  |  | (Groq/       |  | (ChromaDB +  |  | (14 scenarios)   |   |  |
|  |  |  Mistral)    |  |  Embeddings) |  |                  |   |  |
|  |  +--------------+  +--------------+  +------------------+   |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

### Data Flow

```
User Voice Input
    |
    +-> Web Speech API (Browser STT)
    |   +-> Text
    |
    +-> FastAPI /api/chat
    |   +-> RAG Search (context retrieval)
    |   +-> LLM (response generation)
    |   +-> Grammar Feedback (optional)
    |
    +-> Response
        +-> Text Display
        +-> Web Speech API (Browser TTS)
```

---

## Project Structure

```
enpeak/
├── backend/
│   ├── main.py                 # FastAPI entry point, lifespan management
│   ├── api/
│   │   ├── chat.py             # Free conversation endpoint
│   │   ├── roleplay.py         # Scenario-based roleplay
│   │   ├── speech.py           # STT/TTS endpoints
│   │   ├── feedback.py         # Grammar correction
│   │   ├── vocabulary.py       # Word learning API
│   │   ├── rag.py              # RAG search API
│   │   └── community.py        # Community features
│   ├── core/
│   │   ├── llm.py              # LLM provider abstraction
│   │   ├── prompts.py          # System prompts
│   │   └── firebase.py         # Firestore client
│   └── scenarios/
│       └── scenario_engine.py  # Roleplay state machine
│
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Home
│   │   │   ├── chat/           # Free conversation
│   │   │   ├── roleplay/       # Scenario roleplay
│   │   │   ├── vocabulary/     # Word learning
│   │   │   └── conversations/  # Community
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities, API client
│   └── public/
│       └── manifest.json       # PWA manifest
│
├── data/
│   ├── scenarios/              # 14 roleplay scenario JSONs
│   └── rag_chunks/             # RAG data (5,375 chunks)
│       ├── vocabulary_chunks.json
│       ├── dialogsum_chunks.json
│       ├── expressions_chunks.json
│       └── patterns_chunks.json
│
├── vectordb/                   # ChromaDB persistent storage
├── scripts/                    # Data processing scripts
├── Dockerfile
└── .env.example
```

---

## Design Patterns

### Backend

| Pattern | Location | Description |
|---------|----------|-------------|
| Repository Pattern | `core/firebase.py` | Firestore access abstraction |
| Strategy Pattern | `core/llm.py` | Swappable LLM providers (Groq/Mistral) |
| State Machine | `scenarios/scenario_engine.py` | Roleplay stage management |
| Singleton | `main.py (AppState)` | App-wide state management |
| Dependency Injection | FastAPI `Depends()` | Request-scoped dependencies |

### Frontend

| Pattern | Location | Description |
|---------|----------|-------------|
| Container/Presenter | `app/*/page.tsx` + `components/` | Logic/UI separation |
| Custom Hooks | `hooks/` | Reusable state logic |
| Compound Components | `components/ChatWindow.tsx` | Related component grouping |

---

## API Specification

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check, version info |
| `/api/chat` | POST | Free conversation with AI |
| `/api/speech/stt` | POST | Speech-to-text (fallback) |
| `/api/speech/tts` | POST | Text-to-speech |
| `/api/feedback/grammar` | POST | Grammar correction |

### Roleplay Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/roleplay/scenarios` | GET | List all scenarios |
| `/api/roleplay/start` | POST | Start roleplay session |
| `/api/roleplay/turn` | POST | Send user turn, get AI response |
| `/api/roleplay/end` | POST | End session, get report |

### RAG Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rag/search` | POST | Semantic search (EN/KO) |
| `/api/rag/related/{word}` | GET | Related content for word |
| `/api/rag/stats` | GET | RAG data statistics |

### Vocabulary Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vocabulary/list` | GET | Get vocabulary by level |
| `/api/vocabulary/add` | POST | Add word with AI validation |
| `/api/vocabulary/expand` | POST | Get idioms/sentences for word |

### Request/Response Examples

**POST /api/chat**
```json
// Request
{
  "message": "I want to practice ordering coffee",
  "session_id": "uuid-string",
  "context": []
}

// Response
{
  "response": "Sure! Let's practice...",
  "feedback": {
    "grammar_score": 95,
    "suggestions": []
  }
}
```

**POST /api/rag/search**
```json
// Request
{
  "query": "coffee",
  "n_results": 10,
  "filter_type": "expression",
  "filter_category": "cafe"
}

// Response
{
  "results": [
    {
      "content": "I'd like a latte, please.",
      "type": "expression",
      "category": "cafe",
      "score": 0.89
    }
  ]
}
```

---

## Configuration

### Environment Variables

```bash
# LLM API Keys (at least one required)
GROQ_API_KEY=gsk_xxxxx
MISTRAL_API_KEY=xxxxx

# Firebase (for community features)
FIREBASE_CREDENTIALS={"type":"service_account",...}

# App Settings
PORT=7860
HOST=0.0.0.0
DEBUG=false

# CORS
ALLOWED_ORIGINS=https://enpeak.web.app,http://localhost:3000

# RAG Settings
EMBEDDINGS_MODEL_NAME=intfloat/multilingual-e5-base
CHROMADB_PATH=./vectordb
```

---

## Development Setup

### Requirements

- Node.js 18+
- Python 3.11+
- Docker (optional)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run
python -m uvicorn main:app --reload --port 7860
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### Docker

```bash
docker build -t enpeak .
docker run -p 7860:7860 --env-file .env enpeak
```

---

## Deployment

### Frontend (Firebase Hosting)

```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

- Project: `gothic-space-672`
- URL: https://enpeak.web.app

### Backend (HuggingFace Spaces)

1. Create Space (Docker SDK)
2. Connect GitHub repository
3. Set environment variables in Space settings
4. Auto-deploy on push to main

- URL: https://wonchulhee-enpeak.hf.space

---

## RAG Data Statistics

| Type | Count | Description |
|------|-------|-------------|
| vocabulary | 2,661 | A1-C2 level words |
| dialogue | 1,500 | DialogSum conversations |
| expression | 720 | 16 category expressions |
| idiom | 137 | Idioms and phrases |
| grammar_pattern | 80 | Grammar patterns |
| scenario | 14 | Roleplay scenarios |
| **Total** | **5,375** | Indexed chunks |

---

## Version

| Component | Version |
|-----------|---------|
| App | 1.0.1 |
| Build Date | 2026-01-31 |
| Next.js | 14.1.0 |
| FastAPI | 0.109.0 |
| ChromaDB | 0.4.0 |
