"""
롤플레이 API 엔드포인트
상황별 영어 회화 연습
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import uuid
import json
import os

from backend.core.prompts import ROLEPLAY_RESPONSE_PROMPT, LEARNING_TIP_PROMPT, SESSION_REPORT_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter()


class ScenarioInfo(BaseModel):
    id: str
    title: str
    title_ko: str
    category: str
    difficulty: str
    description: str
    estimated_time: str


class RoleplayStartRequest(BaseModel):
    scenario_id: str
    user_level: Optional[str] = "intermediate"


class RoleplayStartResponse(BaseModel):
    session_id: str
    scenario: ScenarioInfo
    ai_message: str
    current_stage: int
    total_stages: int
    learning_tip: Optional[str] = None
    suggested_responses: List[str] = []


class RoleplayTurnRequest(BaseModel):
    session_id: str
    user_message: str


class RoleplayTurnResponse(BaseModel):
    session_id: str
    ai_message: str
    current_stage: int
    total_stages: int
    learning_tip: Optional[str] = None
    suggested_responses: List[str] = []
    is_complete: bool = False


class RoleplayEndRequest(BaseModel):
    session_id: str


class RoleplayReport(BaseModel):
    session_id: str
    scenario_title: str
    total_turns: int
    overall_score: int
    strengths: List[str]
    areas_to_improve: List[str]
    vocabulary_highlights: List[str]
    encouragement: str


# 세션 저장소
roleplay_sessions: dict = {}

# 시나리오 데이터 디렉토리
# Docker 환경: /app/data/scenarios
# 로컬 환경: backend/../data/scenarios
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCENARIOS_DIR = os.path.join(_BASE_DIR, "data", "scenarios")

# Docker 환경에서 /app/data/scenarios 경로 확인
if not os.path.exists(SCENARIOS_DIR) and os.path.exists("/app/data/scenarios"):
    SCENARIOS_DIR = "/app/data/scenarios"


def load_scenario(scenario_id: str) -> dict:
    """시나리오 JSON 로드"""
    scenario_path = os.path.join(SCENARIOS_DIR, f"{scenario_id}.json")
    if not os.path.exists(scenario_path):
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    with open(scenario_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_scenarios() -> List[ScenarioInfo]:
    """모든 시나리오 목록 반환"""
    scenarios = []

    if not os.path.exists(SCENARIOS_DIR):
        return scenarios

    for filename in os.listdir(SCENARIOS_DIR):
        if filename.endswith(".json"):
            try:
                with open(os.path.join(SCENARIOS_DIR, filename), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    scenarios.append(ScenarioInfo(
                        id=data["id"],
                        title=data["title"],
                        title_ko=data.get("title_ko", data["title"]),
                        category=data["category"],
                        difficulty=data["difficulty"],
                        description=data.get("description", data.get("title_ko", data["title"])),
                        estimated_time=data.get("estimated_time", "3-5 minutes")
                    ))
            except Exception as e:
                logger.warning(f"Failed to load scenario {filename}: {e}")

    return scenarios


@router.get("/scenarios", response_model=List[ScenarioInfo])
async def list_scenarios():
    """사용 가능한 시나리오 목록"""
    return get_all_scenarios()


@router.get("/debug/paths")
async def debug_paths():
    """디버그: 경로 확인"""
    import glob
    return {
        "SCENARIOS_DIR": SCENARIOS_DIR,
        "exists": os.path.exists(SCENARIOS_DIR),
        "files": os.listdir(SCENARIOS_DIR) if os.path.exists(SCENARIOS_DIR) else [],
        "cwd": os.getcwd(),
        "app_data_exists": os.path.exists("/app/data"),
        "app_data_scenarios_exists": os.path.exists("/app/data/scenarios"),
        "app_data_contents": os.listdir("/app/data") if os.path.exists("/app/data") else [],
    }


@router.post("/start", response_model=RoleplayStartResponse)
async def start_roleplay(request: RoleplayStartRequest, req: Request):
    """롤플레이 세션 시작"""
    try:
        scenario = load_scenario(request.scenario_id)
        session_id = str(uuid.uuid4())

        # 첫 번째 스테이지
        first_stage = scenario["stages"][0]

        # 세션 저장
        roleplay_sessions[session_id] = {
            "scenario": scenario,
            "current_stage": 1,
            "conversation_history": [],
            "user_level": request.user_level,
        }

        # AI 오프닝 메시지
        ai_message = first_stage.get("ai_opening", "Hello! Let's start.")

        # 대화 히스토리에 추가
        roleplay_sessions[session_id]["conversation_history"].append({
            "role": "assistant",
            "content": ai_message
        })

        return RoleplayStartResponse(
            session_id=session_id,
            scenario=ScenarioInfo(
                id=scenario["id"],
                title=scenario["title"],
                title_ko=scenario.get("title_ko", scenario["title"]),
                category=scenario["category"],
                difficulty=scenario["difficulty"],
                description=scenario.get("description", scenario.get("title_ko", scenario["title"])),
                estimated_time=scenario.get("estimated_time", "3-5 minutes")
            ),
            ai_message=ai_message,
            current_stage=1,
            total_stages=len(scenario["stages"]),
            learning_tip=first_stage.get("learning_tip"),
            suggested_responses=first_stage.get("suggested_responses", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start roleplay: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/turn", response_model=RoleplayTurnResponse)
async def roleplay_turn(request: RoleplayTurnRequest, req: Request):
    """롤플레이 대화 턴"""
    try:
        if request.session_id not in roleplay_sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = roleplay_sessions[request.session_id]
        scenario = session["scenario"]
        current_stage_num = session["current_stage"]

        llm = req.app.state.llm
        if not llm:
            raise HTTPException(status_code=503, detail="LLM not initialized")

        # 사용자 메시지 저장
        session["conversation_history"].append({
            "role": "user",
            "content": request.user_message
        })

        # 현재 스테이지 정보
        current_stage = scenario["stages"][current_stage_num - 1]

        # 대화 히스토리 포맷
        history_text = ""
        for msg in session["conversation_history"]:
            role = "User" if msg["role"] == "user" else scenario["roles"]["ai"]
            history_text += f"{role}: {msg['content']}\n"

        # AI 응답 생성
        prompt = ROLEPLAY_RESPONSE_PROMPT.format(
            ai_role=scenario["roles"]["ai"],
            scenario_title=scenario["title"],
            difficulty=scenario["difficulty"],
            stage_name=current_stage["name"],
            current_stage=current_stage_num,
            total_stages=len(scenario["stages"]),
            stage_objective=current_stage.get("ai_prompt", "Continue the conversation naturally"),
            conversation_history=history_text,
            user_message=request.user_message
        )

        ai_response = llm.generate(
            prompt=prompt,
            max_tokens=150,
            temperature=0.8,
        )

        # AI 응답 저장
        session["conversation_history"].append({
            "role": "assistant",
            "content": ai_response
        })

        # 스테이지 진행 체크 (간단한 휴리스틱)
        is_complete = False
        next_stage = current_stage_num

        # 대화 턴 수에 따라 스테이지 진행
        turns_in_stage = len([m for m in session["conversation_history"] if m["role"] == "user"])
        if turns_in_stage >= 2 and current_stage_num < len(scenario["stages"]):
            next_stage = current_stage_num + 1
            session["current_stage"] = next_stage
        elif turns_in_stage >= 2 and current_stage_num >= len(scenario["stages"]):
            is_complete = True

        # 다음 스테이지 정보
        stage_info = scenario["stages"][next_stage - 1] if next_stage <= len(scenario["stages"]) else current_stage

        return RoleplayTurnResponse(
            session_id=request.session_id,
            ai_message=ai_response,
            current_stage=next_stage,
            total_stages=len(scenario["stages"]),
            learning_tip=stage_info.get("learning_tip"),
            suggested_responses=stage_info.get("suggested_responses", []),
            is_complete=is_complete
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Roleplay turn error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/end", response_model=RoleplayReport)
async def end_roleplay(request: RoleplayEndRequest, req: Request):
    """롤플레이 종료 및 리포트 생성"""
    try:
        if request.session_id not in roleplay_sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = roleplay_sessions[request.session_id]
        scenario = session["scenario"]

        llm = req.app.state.llm

        # 대화 히스토리 포맷
        history_text = ""
        for msg in session["conversation_history"]:
            role = "User" if msg["role"] == "user" else scenario["roles"]["ai"]
            history_text += f"{role}: {msg['content']}\n"

        # 기본 리포트 (LLM 실패 시 사용)
        total_turns = len([m for m in session["conversation_history"] if m["role"] == "user"])

        report = RoleplayReport(
            session_id=request.session_id,
            scenario_title=scenario["title"],
            total_turns=total_turns,
            overall_score=70,
            strengths=["You completed the conversation!", "Good effort in practicing"],
            areas_to_improve=["Try using more varied vocabulary", "Practice natural responses"],
            vocabulary_highlights=scenario.get("key_vocabulary", [])[:5] if scenario.get("key_vocabulary") else [],
            encouragement="Great job practicing! Keep it up! 잘했어요! 계속 연습하세요!"
        )

        # LLM으로 상세 리포트 생성 시도
        if llm:
            try:
                prompt = SESSION_REPORT_PROMPT.format(
                    scenario_title=scenario["title"],
                    difficulty=scenario["difficulty"],
                    conversation_history=history_text
                )

                report_json = llm.generate(prompt=prompt, max_tokens=500, temperature=0.3)
                report_data = json.loads(report_json)

                report = RoleplayReport(
                    session_id=request.session_id,
                    scenario_title=scenario["title"],
                    total_turns=total_turns,
                    overall_score=report_data.get("overall_score", 70),
                    strengths=report_data.get("strengths", []),
                    areas_to_improve=report_data.get("areas_to_improve", []),
                    vocabulary_highlights=report_data.get("vocabulary_highlights", []),
                    encouragement=report_data.get("encouragement", "Great job!")
                )
            except Exception as e:
                logger.warning(f"Failed to generate detailed report: {e}")

        # 세션 정리
        del roleplay_sessions[request.session_id]

        return report

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"End roleplay error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
