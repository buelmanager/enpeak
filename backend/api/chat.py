"""
자유 회화 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid

from backend.core.prompts import (
    SYSTEM_PROMPT_ENGLISH_TUTOR,
    FREE_CONVERSATION_PROMPT,
    RESPONSE_SUGGESTIONS_PROMPT,
    BETTER_EXPRESSION_PROMPT,
)
import json

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation session ID")
    user_level: Optional[str] = Field(
        "intermediate", description="beginner/intermediate/advanced"
    )
    system_prompt: Optional[str] = Field(
        None, description="Custom system prompt override"
    )


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
        if request.system_prompt:
            # Custom system_prompt provided (e.g., Korean setup phase)
            # Use user message directly without English-only FREE_CONVERSATION_PROMPT wrapper
            # Detect Korean system prompt and wrap user message with Korean instruction
            is_korean_prompt = any(
                kw in request.system_prompt
                for kw in ["한국어", "Korean", "한글"]
            )
            if is_korean_prompt:
                prompt = (
                    f"이전 대화:\n{context}\n\n사용자: {request.message}\n\n반드시 한국어로만 답변하세요."
                    if context
                    else f"사용자: {request.message}\n\n반드시 한국어로만 답변하세요."
                )
            else:
                prompt = (
                    f"Previous conversation:\n{context}\n\nUser: {request.message}"
                    if context
                    else request.message
                )
        else:
            prompt = FREE_CONVERSATION_PROMPT.format(
                context=context
                if context
                else "This is the start of the conversation.",
                user_message=request.message,
            )

        # LLM 응답 생성
        response = llm.generate(
            prompt=prompt,
            system_prompt=request.system_prompt or SYSTEM_PROMPT_ENGLISH_TUTOR,
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

        # 학습 팁 생성 (사용자 메시지에 개선점이 있을 때만)
        learning_tip = await generate_learning_tip(llm, request.message, response)

        logger.info(
            f"Chat response generated for conversation {conversation_id[:8]}..."
        )

        return ChatResponse(
            conversation_id=conversation_id,
            message=response,
            suggestions=suggestions,
            better_expressions=better_expressions,
            grammar_feedback=None,  # TODO: 별도 분석
            learning_tip=learning_tip,
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate response: {str(e)}"
        )


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
            ai_message=ai_message,
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


async def generate_learning_tip(
    llm, user_message: str, ai_response: str
) -> Optional[str]:
    """사용자 메시지에 대한 학습 팁 생성 (개선점이 있을 때만)"""
    try:
        # 너무 짧은 메시지는 스킵
        if len(user_message.split()) < 3:
            return None

        prompt = f"""Analyze this English sentence from a Korean learner and provide a brief learning tip ONLY if there's something to improve or a useful expression to learn.

User said: "{user_message}"

If the sentence is good, output: null
If there's a tip to share, output a SHORT tip (1 sentence, max 15 words) in Korean.

Focus on:
- Grammar corrections (if any)
- More natural expressions
- Common mistakes Korean speakers make

Output ONLY the tip in Korean, or the word "null" if no tip needed:"""

        result = llm.generate(
            prompt=prompt,
            system_prompt="You are a helpful English tutor. Output only the tip or null.",
            max_tokens=50,
            temperature=0.5,
        )

        result = result.strip()
        if result.lower() == "null" or not result or len(result) < 5:
            return None

        return result

    except Exception as e:
        logger.warning(f"Failed to generate learning tip: {e}")
        return None


class TranslateRequest(BaseModel):
    text: str = Field(
        ..., min_length=1, max_length=2000, description="Text to translate"
    )
    target_lang: Optional[str] = Field("ko", description="Target language (ko/en)")


class TranslateResponse(BaseModel):
    translation: str


@router.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest, req: Request):
    """
    번역 전용 엔드포인트
    영어 -> 한국어 또는 한국어 -> 영어 번역
    """
    try:
        llm = req.app.state.llm
        if not llm:
            raise HTTPException(status_code=503, detail="LLM not initialized")

        if request.target_lang == "ko":
            prompt = f'''Translate this English sentence to natural, conversational Korean.
- Do NOT translate literally (word-by-word)
- Use natural Korean expressions that native speakers would actually use
- Match the tone and register of the original
- Keep it simple and easy to understand

English: "{request.text}"

Korean translation:'''
        else:
            prompt = f'''Translate this Korean sentence to natural, conversational English.
- Do NOT translate literally
- Use expressions that native English speakers would use
- Match the tone and register

Korean: "{request.text}"

English translation:'''

        result = llm.generate(
            prompt=prompt,
            system_prompt="You are a professional translator who specializes in natural, context-aware translations. Output only the translation itself, nothing else.",
            max_tokens=200,
            temperature=0.4,
        )

        return TranslateResponse(translation=result.strip())

    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.delete("/chat/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """대화 히스토리 삭제"""
    if conversation_id in conversation_store:
        del conversation_store[conversation_id]
        return {"status": "cleared"}
    return {"status": "not_found"}
