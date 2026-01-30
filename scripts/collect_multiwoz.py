"""
MultiWOZ 2.2 데이터셋 수집 및 변환 스크립트
- 호텔, 레스토랑, 여행 도메인 대화 추출
- EnPeak 시나리오 형식으로 변환
"""

import json
import os
from pathlib import Path
from datasets import load_dataset
from typing import List, Dict, Any

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "collected" / "multiwoz"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 도메인 매핑
DOMAIN_TO_CATEGORY = {
    "hotel": "travel",
    "restaurant": "daily",
    "attraction": "travel",
    "taxi": "travel",
    "train": "travel",
}

DOMAIN_TO_TITLE = {
    "hotel": {"en": "Hotel Booking", "ko": "호텔 예약하기"},
    "restaurant": {"en": "Restaurant Reservation", "ko": "레스토랑 예약하기"},
    "attraction": {"en": "Tourist Attraction", "ko": "관광지 방문하기"},
    "taxi": {"en": "Booking a Taxi", "ko": "택시 예약하기"},
    "train": {"en": "Train Ticket", "ko": "기차표 예매하기"},
}

DOMAIN_TO_ROLES = {
    "hotel": {"ai": "Hotel Receptionist", "user": "Guest"},
    "restaurant": {"ai": "Restaurant Staff", "user": "Customer"},
    "attraction": {"ai": "Information Desk Staff", "user": "Tourist"},
    "taxi": {"ai": "Taxi Dispatcher", "user": "Customer"},
    "train": {"ai": "Ticket Agent", "user": "Passenger"},
}


def extract_domain_dialogues(dataset, domain: str, max_count: int = 100) -> List[Dict]:
    """특정 도메인의 대화 추출"""
    dialogues = []

    for item in dataset["train"]:
        # 해당 도메인이 포함된 대화 필터링
        if domain in item.get("services", []):
            dialogue = {
                "dialogue_id": item.get("dialogue_id", ""),
                "turns": item.get("turns", {}),
                "services": item.get("services", []),
            }
            dialogues.append(dialogue)

            if len(dialogues) >= max_count:
                break

    return dialogues


def convert_to_scenario_format(dialogue: Dict, domain: str) -> Dict:
    """MultiWOZ 대화를 EnPeak 시나리오 형식으로 변환"""
    turns = dialogue.get("turns", {})
    utterances = turns.get("utterance", [])
    speakers = turns.get("speaker", [])

    # 대화 턴을 스테이지로 그룹화 (2-3턴씩)
    stages = []
    stage_num = 1

    for i in range(0, len(utterances), 2):
        if i >= len(utterances):
            break

        # AI 발화 (시스템)
        ai_utterance = ""
        user_responses = []

        for j in range(i, min(i + 2, len(utterances))):
            if speakers[j] == 1:  # System
                ai_utterance = utterances[j]
            else:  # User
                user_responses.append(utterances[j])

        if ai_utterance:
            stage = {
                "stage": stage_num,
                "name": f"Turn {stage_num}",
                "ai_opening": ai_utterance,
                "suggested_responses": user_responses[:3] if user_responses else [],
                "learning_tip": "",
            }
            stages.append(stage)
            stage_num += 1

    return {
        "id": f"{domain}_{dialogue['dialogue_id']}",
        "title": DOMAIN_TO_TITLE.get(domain, {}).get("en", "Conversation"),
        "title_ko": DOMAIN_TO_TITLE.get(domain, {}).get("ko", "대화"),
        "category": DOMAIN_TO_CATEGORY.get(domain, "daily"),
        "difficulty": "intermediate",
        "source": "multiwoz",
        "roles": DOMAIN_TO_ROLES.get(domain, {"ai": "Assistant", "user": "User"}),
        "stages": stages[:5],  # 최대 5스테이지
        "original_dialogue": {
            "utterances": utterances,
            "speakers": speakers,
        }
    }


def extract_expressions(dialogues: List[Dict]) -> List[Dict]:
    """대화에서 유용한 표현 추출"""
    expressions = []

    common_patterns = [
        ("I'd like to", "~하고 싶습니다", "polite request"),
        ("Could you", "~해 주시겠어요?", "polite request"),
        ("I'm looking for", "~을 찾고 있습니다", "searching"),
        ("Do you have", "~있나요?", "inquiry"),
        ("How much is", "얼마인가요?", "price inquiry"),
        ("I'll take", "~로 할게요", "decision"),
        ("Can I get", "~받을 수 있나요?", "request"),
    ]

    for dialogue in dialogues:
        turns = dialogue.get("turns", {})
        utterances = turns.get("utterance", [])

        for utt in utterances:
            for pattern, meaning, category in common_patterns:
                if pattern.lower() in utt.lower():
                    expressions.append({
                        "expression": pattern,
                        "meaning_ko": meaning,
                        "category": category,
                        "example": utt,
                    })

    # 중복 제거
    seen = set()
    unique_expressions = []
    for exp in expressions:
        key = exp["expression"]
        if key not in seen:
            seen.add(key)
            unique_expressions.append(exp)

    return unique_expressions


def main():
    print("Loading MultiWOZ 2.2 dataset...")

    try:
        dataset = load_dataset("pfb30/multi_woz_v22")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Installing datasets library...")
        os.system("pip install datasets")
        dataset = load_dataset("pfb30/multi_woz_v22")

    all_scenarios = []
    all_expressions = []

    for domain in ["hotel", "restaurant", "attraction", "taxi", "train"]:
        print(f"\nProcessing domain: {domain}")

        # 대화 추출
        dialogues = extract_domain_dialogues(dataset, domain, max_count=50)
        print(f"  Found {len(dialogues)} dialogues")

        # 시나리오 형식으로 변환
        for dialogue in dialogues:
            scenario = convert_to_scenario_format(dialogue, domain)
            if scenario["stages"]:  # 스테이지가 있는 경우만
                all_scenarios.append(scenario)

        # 표현 추출
        expressions = extract_expressions(dialogues)
        all_expressions.extend(expressions)

    # 결과 저장
    print(f"\nTotal scenarios: {len(all_scenarios)}")
    print(f"Total expressions: {len(all_expressions)}")

    # 시나리오 저장
    scenarios_file = OUTPUT_DIR / "scenarios.json"
    with open(scenarios_file, "w", encoding="utf-8") as f:
        json.dump(all_scenarios, f, ensure_ascii=False, indent=2)
    print(f"Saved scenarios to: {scenarios_file}")

    # 표현 저장
    expressions_file = OUTPUT_DIR / "expressions.json"
    with open(expressions_file, "w", encoding="utf-8") as f:
        json.dump(all_expressions, f, ensure_ascii=False, indent=2)
    print(f"Saved expressions to: {expressions_file}")

    # 도메인별 통계
    domain_stats = {}
    for scenario in all_scenarios:
        cat = scenario["category"]
        domain_stats[cat] = domain_stats.get(cat, 0) + 1

    print("\nDomain statistics:")
    for domain, count in domain_stats.items():
        print(f"  {domain}: {count}")


if __name__ == "__main__":
    main()
