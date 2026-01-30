"""
자유 회화 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid

from backend.core.prompts import SYSTEM_PROMPT_ENGLISH_TUTOR, FREE_CONVERSATION_PROMPT, RESPONSE_SUGGESTIONS_PROMPT, BETTER_EXPRESSION_PROMPT
import json

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation session ID")
    user_level: Optional[str] = Field("intermediate", description="beginner/intermediate/advanced")


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    suggestions: Optional[List[str]] = None
    better_expressions: Optional[List[str]] = None
    grammar_feedback: Optional[str] = None
    learning_tip: Optional[str] = None


# 간단한 인메모리 대화 저장소 (프로덕션에서는 Redis 등 사용)
conversation_store: dict = {}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    자유 회화 엔드포인트
    사용자 메시지에 대해 AI가 자연스럽게 대화
    """
    try:
        # 앱 상태에서 LLM 가져오기
        llm = req.app.state.llm
        if not llm:
            raise HTTPException(status_code=503, detail="LLM not initialized")

        # 대화 ID 생성 또는 기존 사용
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # 대화 히스토리 가져오기
        if conversation_id not in conversation_store:
            conversation_store[conversation_id] = []

        history = conversation_store[conversation_id]

        # 컨텍스트 구성 (최근 5개 대화)
        context = ""
        for msg in history[-5:]:
            role = "User" if msg["role"] == "user" else "AI"
            context += f"{role}: {msg['content']}\n"

        # 프롬프트 구성
        prompt = FREE_CONVERSATION_PROMPT.format(
            context=context if context else "This is the start of the conversation.",
            user_message=request.message
        )

        # LLM 응답 생성
        response = llm.generate(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT_ENGLISH_TUTOR,
            max_tokens=300,
            temperature=0.8,
        )

        # 대화 히스토리 저장
        history.append({"role": "user", "content": request.message})
        history.append({"role": "assistant", "content": response})

        # 히스토리 제한 (최대 20개)
        if len(history) > 20:
            conversation_store[conversation_id] = history[-20:]

        # 응답 제안 생성
        suggestions = await generate_suggestions(llm, context, response)

        # 더 나은 표현 제안 생성
        better_expressions = await generate_better_expressions(llm, request.message)

        logger.info(f"Chat response generated for conversation {conversation_id[:8]}...")

        return ChatResponse(
            conversation_id=conversation_id,
            message=response,
            suggestions=suggestions,
            better_expressions=better_expressions,
            grammar_feedback=None,  # TODO: 별도 분석
            learning_tip=None,  # TODO: 별도 생성
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")


async def generate_better_expressions(llm, user_message: str) -> List[str]:
    """사용자 메시지에 대한 더 나은 표현 제안"""
    try:
        # 너무 짧은 메시지는 스킵
        if len(user_message.split()) < 3:
            return []

        prompt = BETTER_EXPRESSION_PROMPT.format(user_message=user_message)

        result = llm.generate(
            prompt=prompt,
            system_prompt="You are a helpful assistant. Output only valid JSON.",
            max_tokens=100,
            temperature=0.7,
        )

        # JSON 파싱
        result = result.strip()
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]

        expressions = json.loads(result)

        if isinstance(expressions, list):
            return expressions[:2]

        return []

    except Exception as e:
        logger.warning(f"Failed to generate better expressions: {e}")
        return []


async def generate_suggestions(llm, context: str, ai_message: str) -> List[str]:
    """AI 응답에 대한 사용자 응답 제안 생성"""
    try:
        prompt = RESPONSE_SUGGESTIONS_PROMPT.format(
            context=context if context else "This is a new conversation.",
            ai_message=ai_message
        )

        result = llm.generate(
            prompt=prompt,
            system_prompt="You are a helpful assistant. Output only valid JSON.",
            max_tokens=150,
            temperature=0.7,
        )

        # JSON 파싱
        result = result.strip()
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]

        suggestions = json.loads(result)

        if isinstance(suggestions, list) and len(suggestions) >= 2:
            return suggestions[:3]

        return ["I see!", "That's interesting.", "Tell me more."]

    except Exception as e:
        logger.warning(f"Failed to generate suggestions: {e}")
        return ["I see!", "That sounds great!", "Can you tell me more?"]


@router.delete("/chat/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """대화 히스토리 삭제"""
    if conversation_id in conversation_store:
        del conversation_store[conversation_id]
        return {"status": "cleared"}
    return {"status": "not_found"}
