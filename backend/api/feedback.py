"""
피드백 API 엔드포인트
문법 교정 및 학습 피드백
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import json

from backend.core.prompts import GRAMMAR_FEEDBACK_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter()


class GrammarError(BaseModel):
    type: str  # grammar, vocabulary, spelling
    original: str
    correction: str
    explanation: str  # Korean explanation


class GrammarFeedbackRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    context: Optional[str] = None


class GrammarFeedbackResponse(BaseModel):
    is_correct: bool
    corrected_text: Optional[str] = None
    errors: List[GrammarError] = []
    encouragement: str
    tip: Optional[str] = None


@router.post("/grammar", response_model=GrammarFeedbackResponse)
async def check_grammar(request: GrammarFeedbackRequest, req: Request):
    """
    문법 체크 및 피드백
    LLM을 사용하여 문법 오류 분석
    """
    try:
        llm = req.app.state.llm
        if not llm:
            raise HTTPException(status_code=503, detail="LLM not initialized")

        # 프롬프트 구성
        prompt = GRAMMAR_FEEDBACK_PROMPT.format(
            user_sentence=request.text,
            context=request.context or "General conversation"
        )

        # LLM 응답 생성
        response = llm.generate(
            prompt=prompt,
            max_tokens=500,
            temperature=0.3,  # 일관성을 위해 낮은 temperature
        )

        # JSON 파싱 시도
        try:
            # JSON 부분 추출 (마크다운 코드블록 처리)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            feedback_data = json.loads(json_str.strip())

            errors = []
            for error in feedback_data.get("errors", []):
                errors.append(GrammarError(
                    type=error.get("type", "grammar"),
                    original=error.get("original", ""),
                    correction=error.get("correction", ""),
                    explanation=error.get("explanation", "")
                ))

            return GrammarFeedbackResponse(
                is_correct=feedback_data.get("is_correct", True),
                corrected_text=feedback_data.get("corrected_sentence"),
                errors=errors,
                encouragement=feedback_data.get("encouragement", "Good effort!"),
                tip=feedback_data.get("tip")
            )

        except json.JSONDecodeError:
            # JSON 파싱 실패 시 기본 응답
            logger.warning(f"Failed to parse grammar feedback JSON: {response[:100]}")
            return GrammarFeedbackResponse(
                is_correct=True,  # 기본적으로 통과
                corrected_text=None,
                errors=[],
                encouragement="Keep practicing! 계속 연습하세요!",
                tip="Try to express your thoughts naturally."
            )

    except Exception as e:
        logger.error(f"Grammar check error: {e}")
        raise HTTPException(status_code=500, detail=f"Grammar check failed: {str(e)}")


@router.post("/quick-tip")
async def get_quick_tip(request: GrammarFeedbackRequest, req: Request):
    """
    빠른 학습 팁 제공
    """
    try:
        llm = req.app.state.llm
        if not llm:
            return {"tip": "Practice speaking out loud to improve your fluency!"}

        prompt = f"""Give ONE short, practical English tip for this sentence from a Korean learner:
"{request.text}"

Keep it under 20 words. Focus on something specific they can improve.
Respond in Korean:"""

        tip = llm.generate(prompt=prompt, max_tokens=50, temperature=0.7)

        return {"tip": tip.strip()}

    except Exception as e:
        logger.error(f"Quick tip error: {e}")
        return {"tip": "Keep practicing! You're doing great!"}
