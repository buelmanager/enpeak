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

## Screenshots

<p align="center">
  <img src="images/1.png" width="200" alt="Home" />
  <img src="images/2.png" width="200" alt="Free Conversation" />
  <img src="images/3.png" width="200" alt="Voice Recording" />
</p>
<p align="center">
  <img src="images/4.png" width="200" alt="Daily Expression" />
  <img src="images/5.png" width="200" alt="Vocabulary" />
  <img src="images/6.png" width="200" alt="Community" />
</p>

| Screen | Description |
|--------|-------------|
| Home | 대시보드, 학습 통계, 오늘의 표현/단어 연습 진입점 |
| Free Conversation | AI와 실시간 영어 대화, 추천 표현, 한국어 번역 제공 |
| Voice Recording | Web Speech API 기반 실시간 음성 인식 |
| Daily Expression | 매일 새로운 영어 표현 학습, TTS 발음 지원 |
| Vocabulary | A1-C2 레벨별 플래시카드, 뜻/단어 가리기 모드 |
| Community | 사용자 생성 롤플레이 시나리오 공유 |

---

## Tech Stack

### Frontend

| Category | Technology | Version | Description |
|----------|------------|---------|-------------|
| Framework | Next.js | 14.1.0 | App Router 기반, RSC(React Server Components) 지원 |
| Language | TypeScript | 5.3.3 | 정적 타입 검사, 인터페이스 정의 |
| Styling | Tailwind CSS | 3.4.1 | Utility-first CSS, JIT 컴파일러 |
| UI State | React | 18.2.0 | useState, useEffect, useCallback 훅 기반 |
| HTTP Client | Axios | 1.6.5 | 인터셉터, 에러 핸들링, 타입 지원 |
| Backend Service | Firebase SDK | 12.8.0 | Firestore, Authentication |
| Build Tool | Turbopack | - | Next.js 14 기본 번들러 (dev mode) |

**Frontend 아키텍처 특징:**

```
src/
├── app/                    # App Router (file-based routing)
│   ├── layout.tsx          # Root layout (providers, global styles)
│   ├── page.tsx            # Home page (/)
│   ├── chat/
│   │   └── page.tsx        # Free conversation (/chat)
│   ├── roleplay/
│   │   ├── page.tsx        # Scenario list (/roleplay)
│   │   └── [id]/
│   │       └── page.tsx    # Dynamic route (/roleplay/:id)
│   └── vocabulary/
│       └── page.tsx        # Vocabulary practice (/vocabulary)
├── components/             # Reusable UI components
│   ├── ChatWindow.tsx      # Message list, scroll management
│   ├── VoiceRecorder.tsx   # Web Speech API wrapper
│   └── MessageBubble.tsx   # AI/User message styling
├── hooks/                  # Custom React hooks
│   ├── useSpeechRecognition.ts  # STT hook
│   ├── useSpeechSynthesis.ts    # TTS hook
│   └── useLocalStorage.ts       # Persistent state
└── lib/
    ├── api.ts              # Axios instance, API functions
    └── utils.ts            # Helper functions
```

**핵심 기술 구현:**

1. **Web Speech API Integration**
   - `SpeechRecognition`: 브라우저 내장 STT, 실시간 음성 인식
   - `SpeechSynthesis`: 브라우저 내장 TTS, 다양한 음성 선택
   - Fallback: 지원하지 않는 브라우저에서 백엔드 API 사용

2. **PWA (Progressive Web App)**
   - `manifest.json`: 앱 아이콘, 테마 색상, 표시 모드 정의
   - Service Worker: 오프라인 캐싱 (Next.js 기본 지원)
   - Add to Home Screen: 모바일 앱처럼 설치 가능

3. **State Management**
   - Local State: `useState` 기반 컴포넌트 상태
   - Persistent State: `localStorage` 기반 설정 저장
   - No Redux/Zustand: 복잡도 최소화, 단순한 상태 구조

---

### Backend

| Category | Technology | Version | Description |
|----------|------------|---------|-------------|
| Framework | FastAPI | 0.109.0 | 비동기 지원, OpenAPI 자동 문서화 |
| Language | Python | 3.11+ | 타입 힌트, async/await 네이티브 지원 |
| Validation | Pydantic | 2.6.0 | 런타임 데이터 검증, JSON 스키마 생성 |
| Vector DB | ChromaDB | 0.4.0 | 임베딩 저장, 유사도 검색 |
| Embedding | sentence-transformers | 2.2.0+ | 다국어 텍스트 임베딩 |
| TTS | gTTS | 2.5.0 | Google TTS API 래퍼 |
| Firebase | firebase-admin | 6.4.0+ | Firestore 서버 SDK |
| Server | Uvicorn | 0.27.0+ | ASGI 서버, HTTP/2 지원 |

**Backend 아키텍처 특징:**

```
backend/
├── main.py                 # FastAPI app, lifespan, middleware
├── api/                    # API 라우터 모듈
│   ├── chat.py             # POST /api/chat
│   ├── roleplay.py         # /api/roleplay/*
│   ├── speech.py           # /api/speech/stt, /api/speech/tts
│   ├── feedback.py         # POST /api/feedback/grammar
│   ├── vocabulary.py       # /api/vocabulary/*
│   ├── rag.py              # /api/rag/*
│   └── community.py        # /api/community/*
├── core/                   # 비즈니스 로직
│   ├── llm.py              # LLM 프로바이더 추상화
│   ├── prompts.py          # 시스템 프롬프트 템플릿
│   └── firebase.py         # Firestore 클라이언트
└── scenarios/
    └── scenario_engine.py  # 롤플레이 상태 머신
```

**핵심 기술 구현:**

1. **LLM Manager (Strategy Pattern)**
   ```python
   class LLMManager:
       def __init__(self, groq_api_key=None, mistral_api_key=None):
           # Provider 우선순위: Groq > Mistral
           if groq_api_key:
               self.provider = "groq"
               self.client = GroqClient(api_key=groq_api_key)
           elif mistral_api_key:
               self.provider = "mistral"
               self.client = MistralClient(api_key=mistral_api_key)

       async def generate(self, messages: list[dict], **kwargs) -> str:
           # 동일한 인터페이스로 다른 프로바이더 호출
           return await self.client.chat(messages, **kwargs)
   ```

2. **RAG Pipeline**
   ```
   Query → Embedding → ChromaDB Search → Context Retrieval → LLM + Context → Response
   ```
   - Embedding Model: `intfloat/multilingual-e5-base` (다국어 지원)
   - Vector Store: ChromaDB (Persistent mode, SQLite 백엔드)
   - Search: Cosine similarity, top-k retrieval

3. **Async Request Handling**
   ```python
   @router.post("/chat")
   async def chat(request: ChatRequest):
       # 비동기 LLM 호출
       response = await llm_manager.generate(messages)
       # 비동기 문법 피드백 (optional)
       feedback = await grammar_checker.analyze(request.message)
       return ChatResponse(response=response, feedback=feedback)
   ```

---

### AI/LLM

| Provider | Model | Context | Speed | Usage |
|----------|-------|---------|-------|-------|
| Groq | llama-3.1-70b-versatile | 128K | ~500 tok/s | Primary LLM (대화 생성) |
| Mistral | open-mixtral-8x7b | 32K | ~200 tok/s | Fallback LLM |
| Groq | whisper-large-v3 | - | Real-time | Backend STT (fallback) |

**LLM 선택 기준:**
- **Groq**: 초저지연 (< 1초 응답), 무료 티어 (일일 한도), 한국어 성능 우수
- **Mistral**: 안정적 fallback, 유럽 GDPR 준수, 다국어 지원

**프롬프트 엔지니어링:**

```python
TUTOR_SYSTEM_PROMPT = """
You are an English conversation tutor for Korean speakers.

Guidelines:
1. Respond in English, keep it natural and conversational
2. If the user makes grammar mistakes, gently correct them
3. Provide Korean translation in parentheses for difficult words
4. Suggest alternative expressions when appropriate
5. Keep responses concise (2-3 sentences max)

Current context: {context}
User's English level: {level}
"""
```

---

### Infrastructure

| Service | Platform | Tier | Description |
|---------|----------|------|-------------|
| Frontend Hosting | Firebase Hosting | Spark (Free) | CDN, SSL, 자동 배포 |
| Backend Hosting | HuggingFace Spaces | Free | Docker 컨테이너, GPU 옵션 |
| Database | Firebase Firestore | Spark (Free) | NoSQL, 실시간 동기화 |
| Vector Store | ChromaDB | Self-hosted | Docker 내 Persistent 저장 |

**배포 아키텍처:**

```
                    +------------------+
                    |   Firebase CDN   |
                    |  (Global Edge)   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |  Firebase Hosting |         |   HuggingFace     |
    |  (Static Assets)  |         |   Spaces (API)    |
    |  - Next.js build  |         |   - FastAPI       |
    |  - PWA manifest   |         |   - ChromaDB      |
    +-------------------+         |   - LLM Client    |
                                  +---------+---------+
                                            |
                              +-------------+-------------+
                              |                           |
                    +---------v---------+       +---------v---------+
                    |   Groq Cloud      |       |  Firebase         |
                    |   (LLM API)       |       |  Firestore        |
                    +-------------------+       +-------------------+
```

---

## Architecture

### System Architecture

```
+-------------------------------------------------------------------------+
|                              Client (PWA)                               |
|  +------------------+  +------------------+  +------------------------+  |
|  |   Next.js 14     |  |  Web Speech API  |  |    Firebase SDK        |  |
|  |   App Router     |  |  - Recognition   |  |    - Firestore         |  |
|  |   - SSR/SSG      |  |  - Synthesis     |  |    - Auth              |  |
|  +--------+---------+  +--------+---------+  +-----------+------------+  |
+-----------|---------------------|--------------------------|-------------+
            |                     |                          |
            | HTTPS               | (Browser API)            | WebSocket
            |                     |                          |
+-----------|---------------------|--------------------------|-------------+
|           v                     v                          v             |
|  +------------------------------------------------------------------+   |
|  |                        FastAPI Backend                           |   |
|  |  +--------------------+  +--------------------+  +--------------+|   |
|  |  |   API Layer        |  |   Core Services    |  |   Data Layer ||   |
|  |  |   - /api/chat      |  |   - LLMManager     |  |   - ChromaDB ||   |
|  |  |   - /api/roleplay  |  |   - RAGPipeline    |  |   - Firestore||   |
|  |  |   - /api/vocabulary|  |   - ScenarioEngine |  |   - Cache    ||   |
|  |  |   - /api/rag       |  |   - GrammarChecker |  |              ||   |
|  |  +--------------------+  +--------------------+  +--------------+|   |
|  +------------------------------------------------------------------+   |
|                              HuggingFace Spaces                         |
+-------------------------------------------------------------------------+
            |                          |
            v                          v
+-------------------+        +-------------------+
|   Groq Cloud      |        |   Mistral Cloud   |
|   - LLaMA 3.1 70B |        |   - Mixtral 8x7B  |
|   - Whisper v3    |        |                   |
+-------------------+        +-------------------+
```

### Data Flow

```
[User Voice Input]
        |
        v
+------------------+
| Web Speech API   |  <-- Browser-native STT (free, fast)
| (Recognition)    |
+--------+---------+
         |
         | Text
         v
+------------------+
| Frontend         |
| - Input validation
| - Session management
+--------+---------+
         |
         | POST /api/chat
         v
+------------------+
| FastAPI Backend  |
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+-------+  +-------+
| RAG   |  | LLM   |
| Search|  | Call  |
+---+---+  +---+---+
    |          |
    +----+-----+
         |
         v
+------------------+
| Response         |
| - AI message     |
| - Grammar feedback
| - Suggestions    |
+--------+---------+
         |
         v
+------------------+
| Web Speech API   |  <-- Browser-native TTS (free, fast)
| (Synthesis)      |
+------------------+
         |
         v
[Audio Output to User]
```

---

## Project Structure

```
enpeak/
├── backend/
│   ├── main.py                     # FastAPI entry, lifespan, CORS middleware
│   ├── requirements.txt            # Python dependencies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── chat.py                 # Free conversation endpoint
│   │   │                           # - Message history management
│   │   │                           # - Context injection from RAG
│   │   ├── roleplay.py             # Scenario-based roleplay
│   │   │                           # - Session state machine
│   │   │                           # - Stage progression
│   │   ├── speech.py               # STT/TTS fallback endpoints
│   │   │                           # - Groq Whisper for STT
│   │   │                           # - gTTS for TTS
│   │   ├── feedback.py             # Grammar correction
│   │   │                           # - LLM-based analysis
│   │   │                           # - Suggestion generation
│   │   ├── vocabulary.py           # Word learning API
│   │   │                           # - CEFR level filtering
│   │   │                           # - Expansion to idioms/sentences
│   │   ├── rag.py                  # RAG search API
│   │   │                           # - Semantic search
│   │   │                           # - Multi-language support
│   │   └── community.py            # User-generated content
│   │                               # - Firestore CRUD
│   │                               # - Content moderation
│   ├── core/
│   │   ├── __init__.py
│   │   ├── llm.py                  # LLM provider abstraction
│   │   │                           # - Groq/Mistral Strategy pattern
│   │   │                           # - Retry logic, error handling
│   │   ├── prompts.py              # System prompt templates
│   │   │                           # - Tutor persona
│   │   │                           # - Grammar checker
│   │   │                           # - Scenario-specific prompts
│   │   └── firebase.py             # Firestore client singleton
│   │                               # - Connection pooling
│   │                               # - Collection references
│   └── scenarios/
│       └── scenario_engine.py      # Roleplay state machine
│                                   # - Stage transitions
│                                   # - Completion detection
│                                   # - Report generation
│
├── frontend/
│   ├── package.json
│   ├── next.config.js              # Next.js configuration
│   │                               # - API rewrites
│   │                               # - Image optimization
│   ├── tailwind.config.js          # Tailwind configuration
│   │                               # - Custom colors
│   │                               # - Font family
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── icons/                  # App icons (192x192, 512x512)
│   │   └── favicon.ico
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout
│       │   │                       # - Global providers
│       │   │                       # - Meta tags
│       │   ├── page.tsx            # Home dashboard
│       │   ├── chat/
│       │   │   └── page.tsx        # Free conversation
│       │   ├── roleplay/
│       │   │   ├── page.tsx        # Scenario list
│       │   │   └── [id]/
│       │   │       └── page.tsx    # Roleplay session
│       │   ├── vocabulary/
│       │   │   └── page.tsx        # Vocabulary practice
│       │   └── conversations/
│       │       └── page.tsx        # Community scenarios
│       ├── components/
│       │   ├── ChatWindow.tsx      # Message container
│       │   │                       # - Auto-scroll
│       │   │                       # - Loading states
│       │   ├── VoiceRecorder.tsx   # Speech input
│       │   │                       # - Recording indicator
│       │   │                       # - Permission handling
│       │   ├── MessageBubble.tsx   # Single message
│       │   │                       # - AI/User styling
│       │   │                       # - Translation toggle
│       │   └── LevelSelector.tsx   # CEFR level picker
│       ├── hooks/
│       │   ├── useSpeechRecognition.ts
│       │   ├── useSpeechSynthesis.ts
│       │   └── useLocalStorage.ts
│       └── lib/
│           ├── api.ts              # API client
│           └── utils.ts            # Helpers
│
├── data/
│   ├── scenarios/                  # 14 roleplay scenarios (JSON)
│   │   ├── cafe_order.json
│   │   ├── hotel_checkin.json
│   │   ├── job_interview.json
│   │   └── ...
│   └── rag_chunks/                 # RAG data (5,375 chunks)
│       ├── all_chunks.json         # Merged data
│       ├── vocabulary_chunks.json  # 2,661 words
│       ├── dialogsum_chunks.json   # 1,500 dialogues
│       ├── expressions_chunks.json # 720 expressions
│       └── patterns_chunks.json    # Grammar patterns
│
├── vectordb/                       # ChromaDB persistent storage
│   └── chroma.sqlite3              # Vector index (~6MB)
│
├── scripts/                        # Data processing
│   ├── download_datasets.py        # Fetch open datasets
│   ├── expand_vocabulary.py        # Generate A1-C2 words
│   ├── generate_expressions.py     # Create expressions
│   └── index_to_chromadb.py        # Build vector index
│
├── images/                         # App screenshots
│   ├── 1.png                       # Home
│   ├── 2.png                       # Chat
│   ├── 3.png                       # Recording
│   ├── 4.png                       # Expression
│   ├── 5.png                       # Vocabulary
│   └── 6.png                       # Community
│
├── Dockerfile                      # Backend container
├── .env.example                    # Environment template
└── README.md
```

---

## Design Patterns

### Backend Patterns

| Pattern | Location | Implementation | Purpose |
|---------|----------|----------------|---------|
| **Strategy** | `core/llm.py` | `LLMManager` class with pluggable providers | LLM 프로바이더 교체 (Groq/Mistral) without code change |
| **Singleton** | `main.py` | `AppState` class, `app_state` instance | 앱 전역 상태 (LLM client, embeddings) 공유 |
| **Repository** | `core/firebase.py` | `CommunityStore` class | Firestore 접근 추상화, 테스트 용이성 |
| **State Machine** | `scenarios/scenario_engine.py` | `ScenarioSession` class | 롤플레이 단계 관리 (greeting → order → payment → complete) |
| **Factory** | `api/roleplay.py` | `create_session()` function | 시나리오 타입별 세션 객체 생성 |
| **Dependency Injection** | All routers | FastAPI `Depends()` | Request-scoped 의존성 (DB connection, auth) |

**Strategy Pattern Example (LLM Manager):**

```python
# core/llm.py
class LLMProvider(Protocol):
    async def chat(self, messages: list[dict], **kwargs) -> str: ...

class GroqProvider:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)

    async def chat(self, messages, model="llama-3.1-70b-versatile", **kwargs):
        response = await self.client.chat.completions.create(
            model=model, messages=messages, **kwargs
        )
        return response.choices[0].message.content

class MistralProvider:
    def __init__(self, api_key: str):
        self.client = MistralClient(api_key=api_key)

    async def chat(self, messages, model="open-mixtral-8x7b", **kwargs):
        response = await self.client.chat(model=model, messages=messages)
        return response.choices[0].message.content

class LLMManager:
    def __init__(self, groq_key=None, mistral_key=None):
        if groq_key:
            self.provider = GroqProvider(groq_key)
        elif mistral_key:
            self.provider = MistralProvider(mistral_key)
        else:
            raise ValueError("No LLM API key provided")

    async def generate(self, messages, **kwargs):
        return await self.provider.chat(messages, **kwargs)
```

### Frontend Patterns

| Pattern | Location | Implementation | Purpose |
|---------|----------|----------------|---------|
| **Container/Presenter** | `app/*/page.tsx` + `components/` | Page handles logic, Component handles UI | 관심사 분리, 테스트 용이성 |
| **Custom Hooks** | `hooks/` | `useSpeechRecognition`, `useSpeechSynthesis` | 상태 로직 재사용, 컴포넌트 단순화 |
| **Compound Components** | `components/ChatWindow.tsx` | `ChatWindow`, `MessageBubble`, `InputArea` | 관련 컴포넌트 그룹화, 일관된 API |
| **Render Props** | `components/VoiceRecorder.tsx` | `children` as function | 녹음 상태 커스텀 렌더링 |

**Custom Hook Example (Speech Recognition):**

```typescript
// hooks/useSpeechRecognition.ts
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      setTranscript(result[0].transcript);
    };

    return () => recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { transcript, isListening, startListening, stopListening };
}
```

---

## API Specification

### Core Endpoints

| Endpoint | Method | Auth | Rate Limit | Description |
|----------|--------|------|------------|-------------|
| `/api/health` | GET | No | - | Health check, version info |
| `/api/chat` | POST | No | 60/min | Free conversation with AI |
| `/api/speech/stt` | POST | No | 30/min | Speech-to-text (fallback) |
| `/api/speech/tts` | POST | No | 60/min | Text-to-speech |
| `/api/feedback/grammar` | POST | No | 30/min | Grammar correction |

### Roleplay Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/roleplay/scenarios` | GET | List all 14 scenarios with metadata |
| `POST /api/roleplay/start` | POST | Initialize session, return first AI message |
| `POST /api/roleplay/turn` | POST | Process user turn, return AI response + feedback |
| `POST /api/roleplay/end` | POST | End session, generate performance report |

### RAG Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/rag/search` | POST | Semantic search across all data types |
| `GET /api/rag/related/{word}` | GET | Get related expressions, idioms, sentences |
| `GET /api/rag/stats` | GET | Data statistics by type and level |

### Vocabulary Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/vocabulary/list` | GET | Get words by CEFR level (A1-C2) |
| `POST /api/vocabulary/add` | POST | Add word with AI validation |
| `POST /api/vocabulary/expand` | POST | Expand word to idioms/sentences |
| `DELETE /api/vocabulary/remove/{word}` | DELETE | Remove word from list |

### Request/Response Examples

**POST /api/chat**

```json
// Request
{
  "message": "I want to practice ordering coffee",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "context": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help you today?"}
  ],
  "settings": {
    "level": "B1",
    "include_translation": true,
    "include_suggestions": true
  }
}

// Response
{
  "response": "Sure! Let's practice ordering coffee. Imagine you're at a cafe. I'll be the barista. What would you like to order?",
  "translation": "좋아요! 커피 주문 연습을 해봅시다. 카페에 있다고 상상해보세요. 제가 바리스타가 될게요. 무엇을 주문하시겠어요?",
  "suggestions": [
    "I'd like a latte, please.",
    "Can I get a medium cappuccino?",
    "What do you recommend?"
  ],
  "feedback": null
}
```

**POST /api/rag/search**

```json
// Request
{
  "query": "coffee order",
  "n_results": 5,
  "filters": {
    "type": ["expression", "dialogue"],
    "category": "cafe",
    "level": ["A2", "B1"]
  }
}

// Response
{
  "results": [
    {
      "id": "expr_cafe_001",
      "content": "I'd like a latte, please.",
      "type": "expression",
      "category": "cafe",
      "level": "A2",
      "metadata": {
        "korean": "라떼 주세요.",
        "context": "Ordering at a coffee shop"
      },
      "score": 0.92
    },
    {
      "id": "dial_cafe_015",
      "content": "Customer: Can I get a medium cappuccino?\nBarista: Sure! Would you like any flavoring with that?",
      "type": "dialogue",
      "category": "cafe",
      "level": "B1",
      "score": 0.87
    }
  ],
  "total": 2,
  "query_time_ms": 45
}
```

**POST /api/roleplay/start**

```json
// Request
{
  "scenario_id": "cafe_order",
  "user_level": "B1"
}

// Response
{
  "session_id": "rp_550e8400-e29b-41d4-a716-446655440000",
  "scenario": {
    "id": "cafe_order",
    "title": "Ordering at a Cafe",
    "title_ko": "카페 주문하기",
    "roles": {
      "ai": "Barista",
      "user": "Customer"
    }
  },
  "current_stage": {
    "stage": 1,
    "name": "Greeting",
    "learning_tip": "Use 'I'd like...' to order politely"
  },
  "ai_message": {
    "content": "Hi! Welcome to Sunny Cafe. What can I get for you today?",
    "translation": "안녕하세요! 써니 카페에 오신 것을 환영합니다. 오늘 무엇을 드릴까요?"
  },
  "suggested_responses": [
    "Hi! I'd like a latte, please.",
    "Hello! Can I see the menu?",
    "Good morning! What do you recommend?"
  ]
}
```

---

## Configuration

### Environment Variables

```bash
# ===================
# LLM API Keys
# ===================
# At least one required. Groq is preferred (faster, free tier).
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===================
# Firebase Configuration
# ===================
# Required for community features (Firestore)
# JSON string of service account credentials
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"..."}

# ===================
# App Settings
# ===================
# Server configuration
PORT=7860                    # HuggingFace Spaces default
HOST=0.0.0.0                 # Listen on all interfaces
DEBUG=false                  # Enable debug logging

# ===================
# CORS Configuration
# ===================
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=https://enpeak.web.app,http://localhost:3000

# ===================
# RAG Configuration
# ===================
# Embedding model for semantic search
EMBEDDINGS_MODEL_NAME=intfloat/multilingual-e5-base

# ChromaDB storage path (relative to backend/)
CHROMADB_PATH=./vectordb

# ===================
# Optional Settings
# ===================
# Rate limiting (requests per minute)
RATE_LIMIT_CHAT=60
RATE_LIMIT_SPEECH=30

# Cache TTL (seconds)
CACHE_TTL=3600
```

### .env.example

```bash
# Copy this file to .env and fill in the values
cp .env.example .env

# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (if using Firestore)
FIREBASE_CREDENTIALS={"type":"service_account",...}

# Development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Development Setup

### Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend runtime |
| Python | 3.11+ | Backend runtime |
| Docker | 20+ | Container deployment (optional) |
| Git | 2.30+ | Version control |

### Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/buelmanager/enpeak.git
cd enpeak

# 2. Create virtual environment
cd backend
python -m venv venv

# 3. Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set environment variables
cp .env.example .env
# Edit .env with your API keys

# 6. Initialize vector database (first time only)
python scripts/index_to_chromadb.py

# 7. Run development server
python -m uvicorn main:app --reload --port 7860

# Server running at http://localhost:7860
# API docs at http://localhost:7860/docs
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Set environment variables (optional)
# Create .env.local for local overrides
echo "NEXT_PUBLIC_API_URL=http://localhost:7860" > .env.local

# 4. Run development server
npm run dev

# Server running at http://localhost:3000
```

### Docker Setup

```bash
# Build image
docker build -t enpeak .

# Run container
docker run -p 7860:7860 \
  -e GROQ_API_KEY=your_key \
  -e FIREBASE_CREDENTIALS='{"type":"service_account",...}' \
  enpeak

# Or use docker-compose (if available)
docker-compose up -d
```

### Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test

# E2E tests (if configured)
npm run test:e2e
```

---

## Deployment

### Frontend (Firebase Hosting)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Build production bundle
cd frontend
npm run build

# 4. Deploy to Firebase
npx firebase deploy --only hosting

# Deployment complete!
# URL: https://enpeak.web.app
```

**Firebase Configuration (`firebase.json`):**

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "destination": "https://wonchulhee-enpeak.hf.space/api/**"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Backend (HuggingFace Spaces)

1. **Create Space**
   - Go to https://huggingface.co/spaces
   - Click "Create new Space"
   - Select "Docker" SDK
   - Set visibility (Public/Private)

2. **Connect Repository**
   - Link GitHub repository
   - Or manually upload files

3. **Configure Environment**
   - Go to Space Settings > Repository secrets
   - Add `GROQ_API_KEY`
   - Add `FIREBASE_CREDENTIALS` (if using Firestore)

4. **Deploy**
   - Push to main branch triggers auto-deploy
   - Or click "Restart Space" manually

**Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ ./backend/
COPY data/ ./data/
COPY vectordb/ ./vectordb/

# Expose port
EXPOSE 7860

# Run server
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

## RAG Data Statistics

### Overview

| Metric | Value |
|--------|-------|
| Total Chunks | 5,375 |
| Vector Index Size | ~6 MB |
| Embedding Dimension | 768 |
| Supported Languages | English, Korean |

### Data Distribution

| Type | Count | Description | Source |
|------|-------|-------------|--------|
| vocabulary | 2,661 | A1-C2 level words | Custom generated |
| dialogue | 1,500 | Daily conversations | DialogSum (Apache 2.0) |
| expression | 720 | 16 category phrases | Custom generated |
| idiom | 137 | Common idioms | Custom generated |
| grammar_pattern | 80 | Sentence patterns | Custom generated |
| useful_sentence | 120 | Common sentences | Custom generated |
| scenario_vocabulary | 42 | Scenario keywords | Custom generated |
| sentence_pair | 32 | EN-KO pairs | Tatoeba (CC0) |
| phrasal_verb | 15 | Common phrasal verbs | Custom generated |
| scenario | 14 | Roleplay scenarios | Custom generated |

### CEFR Level Distribution

| Level | Words | Description |
|-------|-------|-------------|
| A1 | 331 | Beginner (basic phrases) |
| A2 | 349 | Elementary (simple sentences) |
| B1 | 448 | Intermediate (main points) |
| B2 | 326 | Upper-intermediate (complex text) |
| C1 | 352 | Advanced (implicit meaning) |
| C2 | 398 | Proficient (near-native) |

### Expression Categories

```
greeting, cafe, restaurant, shopping, transport,
hotel, airport, business, phone, emergency,
opinion, daily, compliment, apology, thanks, request
```

---

## Version

| Component | Version | Release Date |
|-----------|---------|--------------|
| EnPeak App | 1.0.1 | 2026-01-31 |
| Next.js | 14.1.0 | - |
| FastAPI | 0.109.0 | - |
| ChromaDB | 0.4.0 | - |
| React | 18.2.0 | - |
| Python | 3.11+ | - |

---

## License

This project is for educational purposes. See individual data sources for their respective licenses:
- DialogSum: Apache 2.0
- Tatoeba: CC0
- Custom data: Project-specific
