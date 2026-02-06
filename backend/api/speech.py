"""
음성 처리 API (STT/TTS)
주요 처리는 프론트엔드 Web Speech API에서 수행
백엔드는 폴백 및 고급 기능 제공
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
import logging
import base64
import io
import os

logger = logging.getLogger(__name__)
router = APIRouter()


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field("en", description="Language code: en, ko")
    speed: float = Field(1.0, ge=0.5, le=2.0)
    voice: Optional[str] = Field(None, description="Edge TTS voice ID (e.g. en-US-AriaNeural)")
    engine: str = Field("edge", description="'edge' or 'gtts'")


class TTSResponse(BaseModel):
    audio_base64: str
    content_type: str = "audio/mp3"


class STTRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio data")
    language: str = Field("en", description="Expected language: en, ko")
    prompt: str = Field(
        "English conversation practice",
        description="Domain hint for better transcription accuracy"
    )


class STTResponse(BaseModel):
    text: str
    confidence: float = 1.0


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    텍스트를 음성으로 변환 (Edge TTS 우선, gTTS 폴백)
    """
    # 1) Edge TTS 시도
    if request.engine != "gtts":
        try:
            import edge_tts

            voice = request.voice or ("en-US-AriaNeural" if request.language == "en" else "ko-KR-SunHiNeural")
            rate_pct = int((request.speed - 1.0) * 100)
            rate_str = f"+{rate_pct}%" if rate_pct >= 0 else f"{rate_pct}%"

            communicate = edge_tts.Communicate(request.text, voice, rate=rate_str)
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            audio_buffer.seek(0)
            audio_base64 = base64.b64encode(audio_buffer.read()).decode("utf-8")

            logger.info(f"Edge TTS generated: {len(request.text)} chars, voice={voice}")

            return TTSResponse(audio_base64=audio_base64, content_type="audio/mp3")
        except Exception as e:
            logger.warning(f"Edge TTS failed, falling back to gTTS: {e}")

    # 2) gTTS 폴백
    try:
        from gtts import gTTS

        tts = gTTS(text=request.text, lang=request.language, slow=(request.speed < 0.8))
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        audio_base64 = base64.b64encode(audio_buffer.read()).decode("utf-8")

        logger.info(f"gTTS fallback generated: {len(request.text)} chars")

        return TTSResponse(audio_base64=audio_base64, content_type="audio/mp3")

    except ImportError:
        logger.error("gTTS not installed")
        raise HTTPException(status_code=503, detail="TTS service not available")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.post("/tts/stream")
async def text_to_speech_stream(request: TTSRequest):
    """
    스트리밍 TTS (MP3 직접 반환)
    오디오 태그에서 직접 재생 가능
    """
    # 1) Edge TTS 시도
    if request.engine != "gtts":
        try:
            import edge_tts

            voice = request.voice or ("en-US-AriaNeural" if request.language == "en" else "ko-KR-SunHiNeural")
            rate_pct = int((request.speed - 1.0) * 100)
            rate_str = f"+{rate_pct}%" if rate_pct >= 0 else f"{rate_pct}%"

            communicate = edge_tts.Communicate(request.text, voice, rate=rate_str)
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            audio_buffer.seek(0)

            return StreamingResponse(
                audio_buffer,
                media_type="audio/mp3",
                headers={"Content-Disposition": "inline; filename=speech.mp3"}
            )
        except Exception as e:
            logger.warning(f"Edge TTS stream failed, falling back to gTTS: {e}")

    # 2) gTTS 폴백
    try:
        from gtts import gTTS

        tts = gTTS(text=request.text, lang=request.language, slow=(request.speed < 0.8))
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        return StreamingResponse(
            audio_buffer,
            media_type="audio/mp3",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )

    except Exception as e:
        logger.error(f"TTS stream error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(request: STTRequest, req: Request):
    """
    음성을 텍스트로 변환
    Groq Whisper API 사용 (무료)
    프론트엔드 Web Speech API 실패 시 폴백용
    """
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=503, detail="STT service not configured")

        import requests
        import tempfile

        # Base64 디코딩
        audio_data = base64.b64decode(request.audio_base64)

        # 임시 파일로 저장 (Groq API는 파일 필요)
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name

        try:
            # Groq Whisper API 호출
            url = "https://api.groq.com/openai/v1/audio/transcriptions"
            headers = {"Authorization": f"Bearer {groq_api_key}"}

            with open(temp_path, "rb") as audio_file:
                files = {"file": ("audio.webm", audio_file, "audio/webm")}
                data = {
                    "model": "whisper-large-v3",
                    "language": request.language,
                    "response_format": "verbose_json",
                    "prompt": request.prompt,
                }

                response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
                response.raise_for_status()

                result = response.json()
                text = result.get("text", "").strip()

                # verbose_json에서 세그먼트별 avg_logprob 추출하여 confidence 계산
                confidence = 0.95
                segments = result.get("segments", [])
                if segments:
                    avg_logprobs = [s.get("avg_logprob", -0.3) for s in segments]
                    mean_logprob = sum(avg_logprobs) / len(avg_logprobs)
                    # logprob -> confidence 변환 (범위: 0~1)
                    # avg_logprob은 보통 -0.1(높은 확신) ~ -1.0(낮은 확신)
                    import math
                    confidence = min(1.0, max(0.0, math.exp(mean_logprob)))

                logger.info(f"STT completed: {len(audio_data)} bytes -> '{text[:50]}...' (confidence: {confidence:.2f})")

                return STTResponse(text=text, confidence=confidence)

        finally:
            # 임시 파일 삭제
            os.unlink(temp_path)

    except requests.exceptions.RequestException as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(status_code=503, detail="STT service temporarily unavailable")
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")


@router.get("/voices")
async def list_voices():
    """
    사용 가능한 Edge TTS 음성 목록
    """
    return {
        "voices": [
            {"id": "en-US-AriaNeural", "name": "Aria", "gender": "female", "accent": "US"},
            {"id": "en-US-JennyNeural", "name": "Jenny", "gender": "female", "accent": "US"},
            {"id": "en-US-GuyNeural", "name": "Guy", "gender": "male", "accent": "US"},
            {"id": "en-US-AnaNeural", "name": "Ana", "gender": "female", "accent": "US"},
            {"id": "en-GB-SoniaNeural", "name": "Sonia", "gender": "female", "accent": "UK"},
            {"id": "en-GB-RyanNeural", "name": "Ryan", "gender": "male", "accent": "UK"},
            {"id": "en-AU-NatashaNeural", "name": "Natasha", "gender": "female", "accent": "AU"},
        ],
        "default": "en-US-AriaNeural"
    }
