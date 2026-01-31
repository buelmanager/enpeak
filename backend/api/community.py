"""
커뮤니티 시나리오 API
사용자들이 만든 시나리오를 공유하고 관리
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging
import uuid
from datetime import datetime
import json
import re

logger = logging.getLogger(__name__)
router = APIRouter()

# 인메모리 저장소 (프로덕션에서는 DB 사용)
community_scenarios: Dict[str, Any] = {}
scenario_stats: Dict[str, Dict[str, int]] = {}

# 화이트리스트/블랙리스트 키워드
BLOCKED_KEYWORDS = [
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard',
    '씨발', '병신', '개새끼', '죽어', '살인', '자살',
    'porn', 'sex', 'nude', 'xxx', 'drug', 'weapon',
]

SUSPICIOUS_PATTERNS = [
    r'(password|credit.?card|ssn|social.?security)',
    r'(hack|exploit|inject|malware|virus)',
]


class ScenarioContext(BaseModel):
    place: str
    time: Optional[str] = None
    situation: str
    roles: Optional[Dict[str, str]] = None
    additionalInfo: Optional[str] = None


class CreateScenarioRequest(BaseModel):
    context: ScenarioContext


class RefineScenarioRequest(BaseModel):
    context: ScenarioContext
    messages: List[Dict[str, str]]


class FinalizeScenarioRequest(BaseModel):
    context: ScenarioContext
    messages: List[Dict[str, str]]
    title: Optional[str] = None


class PublishScenarioRequest(BaseModel):
    scenario: Dict[str, Any]
    author: str = "Anonymous"


class CommunityScenario(BaseModel):
    id: str
    title: str
    title_ko: Optional[str] = None
    description: Optional[str] = None
    author: str
    authorId: Optional[str] = None
    place: str
    situation: str
    difficulty: str = "intermediate"
    likes: int = 0
    plays: int = 0
    createdAt: str
    stages: List[Dict[str, Any]] = []
    tags: List[str] = []
    approved: bool = False


def moderate_content(text: str) -> tuple[bool, str]:
    """콘텐츠 검증 - 부적절한 내용 필터링"""
    text_lower = text.lower()

    # 블랙리스트 키워드 체크
    for keyword in BLOCKED_KEYWORDS:
        if keyword in text_lower:
            return False, f"부적절한 내용이 포함되어 있습니다."

    # 의심스러운 패턴 체크
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, text_lower):
            return False, "보안상 민감한 내용이 포함되어 있습니다."

    return True, "OK"


def generate_default_suggestions(ai_message: str) -> list:
    """AI 응답에 따른 기본 추천 응답 생성"""
    ai_lower = ai_message.lower()

    # 질문 유형에 따른 추천 응답
    if "would you like" in ai_lower or "do you want" in ai_lower:
        return ["Yes, please.", "No, thank you."]
    elif "what size" in ai_lower or "which size" in ai_lower:
        return ["Medium, please.", "Large one, please."]
    elif "cash or card" in ai_lower or "how would you like to pay" in ai_lower:
        return ["Card, please.", "I'll pay with cash."]
    elif "anything else" in ai_lower:
        return ["No, that's all. Thank you!", "Actually, can I also get..."]
    elif "what can i get" in ai_lower or "what would you like" in ai_lower:
        return ["I'd like to order...", "Can I get..."]
    elif "name" in ai_lower:
        return ["My name is...", "It's under..."]
    elif "have a" in ai_lower and ("day" in ai_lower or "nice" in ai_lower):
        return ["Thank you! You too!", "Thanks, have a good day!"]
    elif "?" in ai_message:
        return ["Yes, please.", "No, thank you."]
    else:
        return ["I see, thank you.", "Okay, sounds good."]


def determine_difficulty(context: ScenarioContext, stages_count: int) -> str:
    """시나리오 난이도 자동 결정"""
    situation = context.situation.lower()

    # 고급 상황
    advanced_keywords = ['면접', '협상', '프레젠테이션', 'interview', 'negotiation', 'presentation', 'debate']
    for kw in advanced_keywords:
        if kw in situation:
            return 'advanced'

    # 초급 상황
    beginner_keywords = ['주문', '인사', '소개', 'order', 'greeting', 'introduction', 'hello']
    for kw in beginner_keywords:
        if kw in situation:
            return 'beginner'

    # 스테이지 수로 판단
    if stages_count <= 2:
        return 'beginner'
    elif stages_count >= 5:
        return 'advanced'

    return 'intermediate'


@router.post("/scenario/create")
async def create_scenario(request: CreateScenarioRequest, req: Request):
    """시나리오 생성 시작 - AI와 대화 시작"""
    context = request.context

    # 콘텐츠 검증
    content_to_check = f"{context.place} {context.situation} {context.additionalInfo or ''}"
    is_valid, message = moderate_content(content_to_check)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    try:
        llm = req.app.state.llm
        if llm:
            prompt = f"""You are helping create an English conversation scenario.

Context:
- Place: {context.place}
- Time: {context.time or 'Not specified'}
- Situation: {context.situation}
- Additional info: {context.additionalInfo or 'None'}

Respond in Korean. Ask the user what specific details they want in this scenario.
Keep it brief and friendly. Suggest 2-3 possible variations they might want to try.
"""
            response = llm.generate(
                prompt=prompt,
                system_prompt="You are a helpful English learning assistant. Respond in Korean. Do NOT use any emojis.",
                max_tokens=200,
                temperature=0.8,
            )
            return {"message": response, "status": "started"}
    except Exception as e:
        logger.warning(f"LLM error: {e}")

    # Fallback response
    return {
        "message": f"좋아요! \"{context.place}\"에서 \"{context.situation}\" 상황을 만들어볼게요. 어떤 구체적인 상황을 원하시나요? 예를 들어:\n\n1. 문제가 생기는 상황 (예: 예약이 안 되어있음)\n2. 특별한 요청이 있는 상황\n3. 일상적인 대화 연습\n\n원하시는 방향을 알려주세요!",
        "status": "started"
    }


@router.post("/scenario/refine")
async def refine_scenario(request: RefineScenarioRequest, req: Request):
    """시나리오 상세화 - 사용자와 대화하며 시나리오 발전"""
    context = request.context
    messages = request.messages

    # 마지막 사용자 메시지 검증
    if messages:
        last_user_msg = next((m['content'] for m in reversed(messages) if m['role'] == 'user'), '')
        is_valid, msg = moderate_content(last_user_msg)
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)

    try:
        llm = req.app.state.llm
        if llm:
            conversation_history = "\n".join([
                f"{'User' if m['role'] == 'user' else 'AI'}: {m['content']}"
                for m in messages[-6:]  # 최근 6개만
            ])

            prompt = f"""You are helping create an English conversation scenario.

Context:
- Place: {context.place}
- Situation: {context.situation}

Conversation so far:
{conversation_history}

Continue the conversation in Korean. Help the user refine their scenario.
If they seem satisfied, ask if they want to finalize the scenario.
Keep responses brief (2-3 sentences).
"""
            response = llm.generate(
                prompt=prompt,
                system_prompt="You are a helpful English learning assistant. Respond in Korean. Do NOT use any emojis.",
                max_tokens=200,
                temperature=0.7,
            )

            # 완성 여부 확인
            complete_keywords = ['완성', '완료', '끝', '저장', 'done', 'finish', 'complete']
            user_last = messages[-1]['content'].lower() if messages else ''
            scenario_ready = any(kw in user_last for kw in complete_keywords)

            return {
                "message": response,
                "scenario_ready": scenario_ready
            }
    except Exception as e:
        logger.warning(f"LLM error: {e}")

    return {
        "message": "네, 알겠어요! 그 내용을 시나리오에 반영할게요. 더 추가하고 싶은 내용이 있으면 말씀해주세요. 완성하고 싶으시면 '완성'이라고 말씀해주세요!",
        "scenario_ready": False
    }


@router.post("/scenario/finalize")
async def finalize_scenario(request: FinalizeScenarioRequest, req: Request):
    """시나리오 최종 생성"""
    context = request.context
    messages = request.messages
    title = request.title

    try:
        llm = req.app.state.llm
        if llm:
            conversation_summary = "\n".join([
                f"{m['role']}: {m['content']}" for m in messages[-8:]
            ])

            prompt = f"""Based on this conversation, create an English learning scenario.

Context:
- Place: {context.place}
- Situation: {context.situation}

Conversation:
{conversation_summary}

Create a JSON scenario with this structure:
{{
  "title": "English title",
  "title_ko": "한글 제목",
  "stages": [
    {{
      "stage": 1,
      "name": "Stage name",
      "ai_opening": "What the AI says to start",
      "learning_tip": "A helpful tip",
      "suggested_responses": ["Possible response 1", "Possible response 2"]
    }}
  ]
}}

Create 3-4 stages that build a complete conversation flow.
Output ONLY valid JSON, no explanation.
"""
            response = llm.generate(
                prompt=prompt,
                system_prompt="Output only valid JSON.",
                max_tokens=800,
                temperature=0.7,
            )

            # JSON 파싱
            response = response.strip()
            if response.startswith("```"):
                response = response.split("```")[1]
                if response.startswith("json"):
                    response = response[4:]

            scenario = json.loads(response)
            scenario['id'] = f"custom_{uuid.uuid4().hex[:8]}"
            scenario['place'] = context.place
            scenario['situation'] = context.situation
            scenario['difficulty'] = determine_difficulty(context, len(scenario.get('stages', [])))

            return {"scenario": scenario, "status": "finalized"}
    except Exception as e:
        logger.warning(f"Scenario generation error: {e}")

    # Fallback 시나리오
    default_title = title or f"{context.place}에서 {context.situation}"
    return {
        "scenario": {
            "id": f"custom_{uuid.uuid4().hex[:8]}",
            "title": default_title,
            "title_ko": default_title,
            "place": context.place,
            "situation": context.situation,
            "difficulty": "intermediate",
            "stages": [
                {
                    "stage": 1,
                    "name": "Greeting",
                    "ai_opening": "Hello! How can I help you today?",
                    "learning_tip": "Start with a friendly greeting",
                    "suggested_responses": ["Hi, I'd like to...", "Hello, could you help me with..."]
                },
                {
                    "stage": 2,
                    "name": "Main Request",
                    "ai_opening": "Sure, I can help you with that. What would you like?",
                    "learning_tip": "Be specific about what you need",
                    "suggested_responses": ["I would like...", "Could I have..."]
                },
                {
                    "stage": 3,
                    "name": "Closing",
                    "ai_opening": "Is there anything else I can help you with?",
                    "learning_tip": "Learn to politely end conversations",
                    "suggested_responses": ["That's all, thank you!", "No, that's everything."]
                }
            ]
        },
        "status": "finalized"
    }


@router.post("/community/scenarios")
async def publish_scenario(request: PublishScenarioRequest):
    """시나리오를 커뮤니티에 공개"""
    scenario = request.scenario
    author = request.author

    # 콘텐츠 검증
    content_to_check = f"{scenario.get('title', '')} {scenario.get('title_ko', '')} {scenario.get('place', '')} {scenario.get('situation', '')}"
    is_valid, message = moderate_content(content_to_check)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 시나리오 저장
    scenario_id = scenario.get('id', f"community_{uuid.uuid4().hex[:8]}")

    community_scenario = {
        "id": scenario_id,
        "title": scenario.get('title', 'Untitled'),
        "title_ko": scenario.get('title_ko'),
        "author": author,
        "place": scenario.get('place', ''),
        "situation": scenario.get('situation', ''),
        "difficulty": scenario.get('difficulty', 'intermediate'),
        "likes": 0,
        "plays": 0,
        "createdAt": datetime.now().isoformat(),
        "stages": scenario.get('stages', []),
        "tags": scenario.get('tags', []),
        "approved": True,  # 자동 승인 (콘텐츠 필터 통과)
    }

    community_scenarios[scenario_id] = community_scenario
    scenario_stats[scenario_id] = {"likes": 0, "plays": 0}

    logger.info(f"Published scenario: {scenario_id} by {author}")

    return {
        "status": "published",
        "scenario_id": scenario_id,
        "message": "시나리오가 성공적으로 공유되었습니다!"
    }


@router.get("/community/scenarios")
async def get_community_scenarios(sort: str = "popular", limit: int = 20):
    """커뮤니티 시나리오 목록 조회"""
    scenarios = list(community_scenarios.values())

    # 정렬
    if sort == "popular":
        scenarios.sort(key=lambda x: x.get('likes', 0) + x.get('plays', 0), reverse=True)
    elif sort == "recent":
        scenarios.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
    elif sort == "beginner":
        scenarios = [s for s in scenarios if s.get('difficulty') == 'beginner']

    return {
        "scenarios": scenarios[:limit],
        "total": len(scenarios)
    }


@router.get("/community/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    """특정 시나리오 조회"""
    if scenario_id not in community_scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario = community_scenarios[scenario_id]

    # 플레이 카운트 증가
    if scenario_id in scenario_stats:
        scenario_stats[scenario_id]["plays"] += 1
        scenario["plays"] = scenario_stats[scenario_id]["plays"]

    return scenario


@router.post("/community/scenarios/{scenario_id}/like")
async def like_scenario(scenario_id: str):
    """시나리오 좋아요"""
    if scenario_id not in community_scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")

    if scenario_id in scenario_stats:
        scenario_stats[scenario_id]["likes"] += 1
        community_scenarios[scenario_id]["likes"] = scenario_stats[scenario_id]["likes"]

    return {"likes": community_scenarios[scenario_id].get("likes", 0)}


@router.delete("/community/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: str, author: str):
    """시나리오 삭제 (작성자만 가능)"""
    if scenario_id not in community_scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario = community_scenarios[scenario_id]
    if scenario.get("author") != author:
        raise HTTPException(status_code=403, detail="Only the author can delete this scenario")

    del community_scenarios[scenario_id]
    if scenario_id in scenario_stats:
        del scenario_stats[scenario_id]

    return {"status": "deleted"}


# 커뮤니티 시나리오 롤플레이용 세션 저장소
community_roleplay_sessions: Dict[str, Any] = {}


class CommunityRoleplayStartRequest(BaseModel):
    scenario_id: str


class CommunityRoleplayTurnRequest(BaseModel):
    session_id: str
    user_message: str


@router.post("/community/roleplay/start")
async def start_community_roleplay(request: CommunityRoleplayStartRequest, req: Request):
    """커뮤니티 시나리오로 롤플레이 시작"""
    scenario_id = request.scenario_id

    if scenario_id not in community_scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario = community_scenarios[scenario_id]
    stages = scenario.get("stages", [])

    if not stages:
        raise HTTPException(status_code=400, detail="This scenario has no stages")

    # 플레이 카운트 증가
    if scenario_id in scenario_stats:
        scenario_stats[scenario_id]["plays"] += 1
        scenario["plays"] = scenario_stats[scenario_id]["plays"]

    # 세션 생성
    session_id = str(uuid.uuid4())
    first_stage = stages[0]

    community_roleplay_sessions[session_id] = {
        "scenario_id": scenario_id,
        "scenario": scenario,
        "current_stage": 1,
        "conversation_history": [],
    }

    ai_message = first_stage.get("ai_opening", "Hello! Let's start our conversation.")

    community_roleplay_sessions[session_id]["conversation_history"].append({
        "role": "assistant",
        "content": ai_message
    })

    return {
        "session_id": session_id,
        "scenario_title": scenario.get("title"),
        "scenario_title_ko": scenario.get("title_ko"),
        "ai_message": ai_message,
        "current_stage": 1,
        "total_stages": len(stages),
        "learning_tip": first_stage.get("learning_tip"),
        "suggested_responses": first_stage.get("suggested_responses", []),
    }


@router.post("/community/roleplay/turn")
async def community_roleplay_turn(request: CommunityRoleplayTurnRequest, req: Request):
    """커뮤니티 롤플레이 대화 턴"""
    session_id = request.session_id

    if session_id not in community_roleplay_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = community_roleplay_sessions[session_id]
    scenario = session["scenario"]
    stages = scenario.get("stages", [])
    current_stage_num = session["current_stage"]

    # 사용자 메시지 저장
    session["conversation_history"].append({
        "role": "user",
        "content": request.user_message
    })

    # 현재 스테이지 정보
    current_stage = stages[current_stage_num - 1] if current_stage_num <= len(stages) else stages[-1]

    # LLM으로 응답 생성 (응답과 추천을 함께 JSON으로)
    ai_response = ""
    suggested_responses = []

    try:
        llm = req.app.state.llm
        if llm:
            history_text = "\n".join([
                f"{'User' if m['role'] == 'user' else 'AI'}: {m['content']}"
                for m in session["conversation_history"][-6:]
            ])

            # 응답과 추천을 함께 JSON으로 생성 (자유대화 방식 참고)
            prompt = f"""You are an English conversation partner in this scenario:
- Title: {scenario.get('title')}
- Place: {scenario.get('place')}
- Situation: {scenario.get('situation')}
- Current stage: {current_stage.get('name', f'Stage {current_stage_num}')}

CONVERSATION SO FAR:
{history_text}

USER NOW SAYS: "{request.user_message}"

Respond as JSON with this format:
{{"response": "Your natural English response (1-2 sentences)", "suggestions": ["What user could say next 1", "What user could say next 2"]}}

RULES:
- NEVER repeat your previous responses - check the conversation history
- Respond directly to what the user just said
- Stay in character for this scenario
- The suggestions should be natural follow-ups based on YOUR response
- Keep suggestions short (5-10 words each)
- No emojis

Output ONLY valid JSON:"""

            llm_output = llm.generate(
                prompt=prompt,
                system_prompt="Output only valid JSON. No emojis. No markdown.",
                max_tokens=200,
                temperature=0.8,
            )

            # JSON 파싱
            try:
                llm_output = llm_output.strip()
                if llm_output.startswith("```"):
                    llm_output = llm_output.split("```")[1]
                    if llm_output.startswith("json"):
                        llm_output = llm_output[4:]

                parsed = json.loads(llm_output)
                ai_response = parsed.get("response", "")
                suggested_responses = parsed.get("suggestions", [])

                # 응답에서 앞뒤 따옴표 제거
                if ai_response:
                    ai_response = ai_response.strip().strip('"').strip("'")
            except json.JSONDecodeError:
                # JSON 파싱 실패 시 텍스트 그대로 사용
                ai_response = llm_output.strip().strip('"').strip("'")
                suggested_responses = []

        if not ai_response:
            ai_response = "That sounds great! Is there anything else I can help you with?"

        # 추천 응답이 없으면 기본값 생성
        if not suggested_responses:
            suggested_responses = generate_default_suggestions(ai_response)

    except Exception as e:
        logger.warning(f"LLM error in community roleplay: {e}")
        ai_response = "I understand. Please continue, I'm here to help you practice."
        suggested_responses = ["Sure, let me try again.", "Can you give me an example?"]

    # AI 응답 저장
    session["conversation_history"].append({
        "role": "assistant",
        "content": ai_response
    })

    # 스테이지 진행 체크
    user_turns = len([m for m in session["conversation_history"] if m["role"] == "user"])
    is_complete = False
    next_stage = current_stage_num

    # 2턴마다 스테이지 진행
    if user_turns % 2 == 0 and current_stage_num < len(stages):
        next_stage = current_stage_num + 1
        session["current_stage"] = next_stage
    elif user_turns >= len(stages) * 2:
        is_complete = True

    # 다음 스테이지 정보
    next_stage_info = stages[next_stage - 1] if next_stage <= len(stages) else stages[-1]

    # 스테이지가 바뀌면 해당 스테이지의 suggested_responses 사용
    if next_stage != current_stage_num:
        suggested_responses = next_stage_info.get("suggested_responses", suggested_responses)

    return {
        "session_id": session_id,
        "ai_message": ai_response,
        "current_stage": next_stage,
        "total_stages": len(stages),
        "learning_tip": next_stage_info.get("learning_tip"),
        "suggested_responses": suggested_responses,
        "is_complete": is_complete,
    }


@router.post("/community/roleplay/end")
async def end_community_roleplay(session_id: str):
    """커뮤니티 롤플레이 종료"""
    if session_id not in community_roleplay_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = community_roleplay_sessions[session_id]
    scenario = session["scenario"]
    total_turns = len([m for m in session["conversation_history"] if m["role"] == "user"])

    # 세션 정리
    del community_roleplay_sessions[session_id]

    return {
        "status": "completed",
        "scenario_title": scenario.get("title"),
        "total_turns": total_turns,
        "message": "Great job practicing! 잘하셨어요!"
    }
