"""
EnPeak - AI 영어 학습 웹앱
FastAPI 메인 엔트리포인트
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 버전 정보
APP_VERSION = "1.0.1"
BUILD_DATE = "2026-01-31"
BUILD_ID = "official-release"


class AppState:
    """애플리케이션 상태 관리"""

    def __init__(self):
        self.llm = None
        self.embeddings = None
        self.retriever = None

    def is_ready(self) -> bool:
        return self.llm is not None


app_state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 라이프사이클 관리"""
    logger.info("=" * 60)
    logger.info("EnPeak AI English Learning App")
    logger.info(f"Version: {APP_VERSION} | Build: {BUILD_ID} | Date: {BUILD_DATE}")
    logger.info("=" * 60)

    # 모듈 초기화
    try:
        # Firebase 초기화
        from backend.core.firebase import community_store
        community_store.initialize()
        logger.info("Firebase/Firestore initialized")

        # LLM 초기화
        from backend.core.llm import LLMManager

        mistral_key = os.getenv("MISTRAL_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        if mistral_key or groq_key:
            app_state.llm = LLMManager(
                mistral_api_key=mistral_key,
                groq_api_key=groq_key
            )
            logger.info(f"LLM initialized: {app_state.llm.provider}")
        else:
            logger.warning("No LLM API key found. Chat features will be limited.")

        logger.info("All modules initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize modules: {e}")
        # 앱은 계속 실행 (degraded mode)

    # 앱 상태 저장
    app.state.llm = app_state.llm
    app.state.embeddings = app_state.embeddings
    app.state.retriever = app_state.retriever

    yield

    # 정리
    logger.info("Shutting down EnPeak...")


# FastAPI 앱 생성
app = FastAPI(
    title="EnPeak - AI English Learning",
    description="Speak처럼 AI와 영어 회화 연습하는 웹앱",
    version=APP_VERSION,
    lifespan=lifespan,
)

# CORS 설정
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

# 기본 허용 도메인
default_origins = [
    "http://localhost:3000",
    "http://localhost:7860",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:7860",
    "https://*.vercel.app",
    "https://*.hf.space",
]
allowed_origins.extend(default_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
from backend.api.chat import router as chat_router
from backend.api.roleplay import router as roleplay_router
from backend.api.speech import router as speech_router
from backend.api.feedback import router as feedback_router
from backend.api.vocabulary import router as vocabulary_router
from backend.api.rag import router as rag_router
from backend.api.community import router as community_router

app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(roleplay_router, prefix="/api/roleplay", tags=["Roleplay"])
app.include_router(speech_router, prefix="/api/speech", tags=["Speech"])
app.include_router(feedback_router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(vocabulary_router, prefix="/api/vocabulary", tags=["Vocabulary"])
app.include_router(rag_router, prefix="/api/rag", tags=["RAG"])
app.include_router(community_router, prefix="/api", tags=["Community"])


@app.get("/api/health")
async def health_check():
    """헬스체크 엔드포인트"""
    modules_status = {
        "llm": app_state.llm is not None,
        "embeddings": app_state.embeddings is not None,
        "retriever": app_state.retriever is not None,
    }

    status = "healthy" if app_state.is_ready() else "degraded"

    return {
        "status": status,
        "version": APP_VERSION,
        "build_id": BUILD_ID,
        "build_date": BUILD_DATE,
        "modules": modules_status,
    }


@app.get("/api/info")
async def app_info():
    """앱 정보"""
    return {
        "name": "EnPeak",
        "description": "AI-powered English learning app for Korean speakers",
        "version": APP_VERSION,
        "features": [
            "Free Conversation - Practice speaking with AI",
            "Roleplay Scenarios - Learn in real-world situations",
            "Grammar Feedback - Get instant corrections",
            "Text-to-Speech - Listen to native pronunciation",
        ],
    }


# 정적 파일 서빙 (프론트엔드 빌드 결과물)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "out")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
    logger.info(f"Serving static files from: {frontend_path}")


# 개발 서버 실행
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 7860))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Starting server on {host}:{port}")

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True,  # 개발 중에는 자동 리로드
    )
