"""
영어 숙어/관용구 데이터 수집 스크립트
- 일상에서 자주 쓰는 숙어
- 의미, 예문, 한국어 번역 포함
"""

import json
from pathlib import Path
from typing import List, Dict

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "collected" / "idioms"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# 자주 쓰는 영어 숙어 데이터 (직접 작성 - 저작권 없음)
COMMON_IDIOMS = [
    # 일상 표현
    {
        "idiom": "break the ice",
        "meaning": "어색한 분위기를 깨다",
        "example": "He told a joke to break the ice at the meeting.",
        "category": "social",
        "difficulty": "intermediate"
    },
    {
        "idiom": "hit the road",
        "meaning": "출발하다, 떠나다",
        "example": "We should hit the road early to avoid traffic.",
        "category": "travel",
        "difficulty": "beginner"
    },
    {
        "idiom": "piece of cake",
        "meaning": "아주 쉬운 일",
        "example": "The exam was a piece of cake.",
        "category": "daily",
        "difficulty": "beginner"
    },
    {
        "idiom": "cost an arm and a leg",
        "meaning": "매우 비싸다",
        "example": "That new car costs an arm and a leg.",
        "category": "shopping",
        "difficulty": "intermediate"
    },
    {
        "idiom": "under the weather",
        "meaning": "몸이 안 좋다",
        "example": "I'm feeling a bit under the weather today.",
        "category": "health",
        "difficulty": "beginner"
    },
    {
        "idiom": "bite the bullet",
        "meaning": "어려운 상황을 감수하다",
        "example": "I had to bite the bullet and tell him the truth.",
        "category": "daily",
        "difficulty": "intermediate"
    },
    {
        "idiom": "let the cat out of the bag",
        "meaning": "비밀을 누설하다",
        "example": "Who let the cat out of the bag about the surprise party?",
        "category": "social",
        "difficulty": "intermediate"
    },
    {
        "idiom": "kill two birds with one stone",
        "meaning": "일석이조",
        "example": "By working from the cafe, I can kill two birds with one stone.",
        "category": "daily",
        "difficulty": "intermediate"
    },
    {
        "idiom": "spill the beans",
        "meaning": "비밀을 말하다",
        "example": "Come on, spill the beans! What happened?",
        "category": "social",
        "difficulty": "beginner"
    },
    {
        "idiom": "get cold feet",
        "meaning": "겁먹다, 망설이다",
        "example": "He got cold feet before the job interview.",
        "category": "daily",
        "difficulty": "intermediate"
    },

    # 비즈니스 표현
    {
        "idiom": "think outside the box",
        "meaning": "창의적으로 생각하다",
        "example": "We need to think outside the box to solve this problem.",
        "category": "business",
        "difficulty": "intermediate"
    },
    {
        "idiom": "back to square one",
        "meaning": "처음으로 돌아가다",
        "example": "The project failed, so we're back to square one.",
        "category": "business",
        "difficulty": "intermediate"
    },
    {
        "idiom": "get the ball rolling",
        "meaning": "일을 시작하다",
        "example": "Let's get the ball rolling on this project.",
        "category": "business",
        "difficulty": "beginner"
    },
    {
        "idiom": "on the same page",
        "meaning": "같은 생각을 하다",
        "example": "Let's make sure we're on the same page before the meeting.",
        "category": "business",
        "difficulty": "beginner"
    },
    {
        "idiom": "touch base",
        "meaning": "연락하다, 상황을 확인하다",
        "example": "I'll touch base with you next week about the project.",
        "category": "business",
        "difficulty": "intermediate"
    },

    # 감정/상태 표현
    {
        "idiom": "over the moon",
        "meaning": "매우 기쁜",
        "example": "She was over the moon when she got the promotion.",
        "category": "emotion",
        "difficulty": "beginner"
    },
    {
        "idiom": "on cloud nine",
        "meaning": "매우 행복한",
        "example": "He's been on cloud nine since he met her.",
        "category": "emotion",
        "difficulty": "beginner"
    },
    {
        "idiom": "down in the dumps",
        "meaning": "우울한",
        "example": "She's been down in the dumps since she failed the exam.",
        "category": "emotion",
        "difficulty": "intermediate"
    },
    {
        "idiom": "bent out of shape",
        "meaning": "화가 난, 짜증난",
        "example": "Don't get bent out of shape over such a small thing.",
        "category": "emotion",
        "difficulty": "advanced"
    },

    # 시간 관련 표현
    {
        "idiom": "once in a blue moon",
        "meaning": "아주 드물게",
        "example": "I only eat fast food once in a blue moon.",
        "category": "time",
        "difficulty": "intermediate"
    },
    {
        "idiom": "in the nick of time",
        "meaning": "아슬아슬하게, 간신히",
        "example": "He arrived in the nick of time for the meeting.",
        "category": "time",
        "difficulty": "intermediate"
    },
    {
        "idiom": "around the clock",
        "meaning": "24시간 내내",
        "example": "The hospital operates around the clock.",
        "category": "time",
        "difficulty": "beginner"
    },

    # 돈/경제 관련 표현
    {
        "idiom": "break the bank",
        "meaning": "큰돈을 쓰다",
        "example": "We don't want to break the bank on this vacation.",
        "category": "money",
        "difficulty": "intermediate"
    },
    {
        "idiom": "make ends meet",
        "meaning": "수입으로 생활하다",
        "example": "It's hard to make ends meet with this salary.",
        "category": "money",
        "difficulty": "intermediate"
    },
    {
        "idiom": "put money aside",
        "meaning": "저축하다",
        "example": "You should put money aside for emergencies.",
        "category": "money",
        "difficulty": "beginner"
    },

    # 대화/소통 표현
    {
        "idiom": "beat around the bush",
        "meaning": "돌려서 말하다",
        "example": "Stop beating around the bush and tell me what happened.",
        "category": "communication",
        "difficulty": "intermediate"
    },
    {
        "idiom": "get straight to the point",
        "meaning": "요점만 말하다",
        "example": "Let me get straight to the point.",
        "category": "communication",
        "difficulty": "beginner"
    },
    {
        "idiom": "speak your mind",
        "meaning": "솔직하게 말하다",
        "example": "Don't be afraid to speak your mind in the meeting.",
        "category": "communication",
        "difficulty": "beginner"
    },

    # 관계 표현
    {
        "idiom": "hit it off",
        "meaning": "첫 만남부터 잘 맞다",
        "example": "We hit it off from the moment we met.",
        "category": "relationship",
        "difficulty": "intermediate"
    },
    {
        "idiom": "see eye to eye",
        "meaning": "의견이 같다",
        "example": "We don't always see eye to eye on everything.",
        "category": "relationship",
        "difficulty": "intermediate"
    },
    {
        "idiom": "get along with",
        "meaning": "잘 지내다",
        "example": "I get along with most of my coworkers.",
        "category": "relationship",
        "difficulty": "beginner"
    },

    # 노력/성공 표현
    {
        "idiom": "go the extra mile",
        "meaning": "더 노력하다",
        "example": "She always goes the extra mile for her clients.",
        "category": "effort",
        "difficulty": "intermediate"
    },
    {
        "idiom": "burn the midnight oil",
        "meaning": "밤새워 일하다",
        "example": "I've been burning the midnight oil to finish this project.",
        "category": "effort",
        "difficulty": "intermediate"
    },
    {
        "idiom": "practice makes perfect",
        "meaning": "연습이 완벽을 만든다",
        "example": "Keep trying! Practice makes perfect.",
        "category": "effort",
        "difficulty": "beginner"
    },

    # 결정/선택 표현
    {
        "idiom": "on the fence",
        "meaning": "결정을 못 내리는",
        "example": "I'm still on the fence about taking the job offer.",
        "category": "decision",
        "difficulty": "intermediate"
    },
    {
        "idiom": "sleep on it",
        "meaning": "하루 더 생각하다",
        "example": "It's a big decision. Why don't you sleep on it?",
        "category": "decision",
        "difficulty": "beginner"
    },
    {
        "idiom": "make up your mind",
        "meaning": "결정하다",
        "example": "You need to make up your mind soon.",
        "category": "decision",
        "difficulty": "beginner"
    },
]


# 동사구 (Phrasal Verbs)
PHRASAL_VERBS = [
    # 기본 동사구
    {"verb": "pick up", "meaning": "줍다 / 데리러 가다 / 배우다", "examples": [
        "Can you pick up my dry cleaning?",
        "I'll pick you up at 7.",
        "She picked up Spanish very quickly."
    ], "difficulty": "beginner"},

    {"verb": "turn on/off", "meaning": "켜다/끄다", "examples": [
        "Turn on the lights, please.",
        "Don't forget to turn off the TV."
    ], "difficulty": "beginner"},

    {"verb": "put on", "meaning": "입다, 착용하다", "examples": [
        "Put on your jacket, it's cold outside.",
        "She put on some makeup before leaving."
    ], "difficulty": "beginner"},

    {"verb": "take off", "meaning": "벗다 / 이륙하다", "examples": [
        "Take off your shoes at the door.",
        "The plane took off on time."
    ], "difficulty": "beginner"},

    {"verb": "look for", "meaning": "찾다", "examples": [
        "I'm looking for my keys.",
        "Are you looking for something specific?"
    ], "difficulty": "beginner"},

    {"verb": "look after", "meaning": "돌보다", "examples": [
        "Can you look after my dog this weekend?",
        "She looks after her elderly parents."
    ], "difficulty": "beginner"},

    {"verb": "give up", "meaning": "포기하다", "examples": [
        "Don't give up! You can do it.",
        "He gave up smoking last year."
    ], "difficulty": "beginner"},

    {"verb": "come up with", "meaning": "생각해내다", "examples": [
        "Can you come up with a better idea?",
        "She came up with a brilliant solution."
    ], "difficulty": "intermediate"},

    {"verb": "run into", "meaning": "우연히 만나다", "examples": [
        "I ran into an old friend yesterday.",
        "You might run into some problems."
    ], "difficulty": "intermediate"},

    {"verb": "figure out", "meaning": "이해하다, 알아내다", "examples": [
        "I can't figure out this math problem.",
        "We need to figure out what went wrong."
    ], "difficulty": "intermediate"},

    {"verb": "work out", "meaning": "운동하다 / 해결되다", "examples": [
        "I work out three times a week.",
        "Everything will work out in the end."
    ], "difficulty": "beginner"},

    {"verb": "bring up", "meaning": "언급하다 / 양육하다", "examples": [
        "Don't bring up that topic.",
        "She was brought up in a small town."
    ], "difficulty": "intermediate"},

    {"verb": "put off", "meaning": "미루다", "examples": [
        "Don't put off your homework.",
        "The meeting was put off until next week."
    ], "difficulty": "intermediate"},

    {"verb": "get over", "meaning": "극복하다", "examples": [
        "It took time to get over the breakup.",
        "I hope you get over your cold soon."
    ], "difficulty": "intermediate"},

    {"verb": "carry on", "meaning": "계속하다", "examples": [
        "Carry on with your work.",
        "Despite the difficulties, they carried on."
    ], "difficulty": "intermediate"},
]


# 유용한 표현 패턴
USEFUL_PATTERNS = [
    # 요청 표현
    {"pattern": "Could you...?", "meaning": "~해 주시겠어요?", "examples": [
        "Could you help me with this?",
        "Could you speak more slowly?",
        "Could you tell me the way to the station?"
    ], "category": "request", "formality": "polite"},

    {"pattern": "Would you mind...?", "meaning": "~해 주시겠어요? (더 정중)", "examples": [
        "Would you mind opening the window?",
        "Would you mind waiting for a moment?",
        "Would you mind if I sat here?"
    ], "category": "request", "formality": "very_polite"},

    {"pattern": "I'd like to...", "meaning": "~하고 싶습니다", "examples": [
        "I'd like to make a reservation.",
        "I'd like to order a coffee.",
        "I'd like to check out, please."
    ], "category": "request", "formality": "polite"},

    # 의견 표현
    {"pattern": "I think...", "meaning": "~라고 생각해요", "examples": [
        "I think it's a good idea.",
        "I think we should wait.",
        "I think you're right."
    ], "category": "opinion", "formality": "neutral"},

    {"pattern": "In my opinion...", "meaning": "제 생각에는...", "examples": [
        "In my opinion, this is the best option.",
        "In my opinion, we need more time.",
    ], "category": "opinion", "formality": "formal"},

    # 동의/반대 표현
    {"pattern": "I agree with...", "meaning": "~에 동의해요", "examples": [
        "I agree with you completely.",
        "I agree with that idea.",
    ], "category": "agreement", "formality": "neutral"},

    {"pattern": "I'm afraid I disagree", "meaning": "동의하지 않아요 (정중)", "examples": [
        "I'm afraid I disagree with that point.",
        "I'm afraid I can't agree with you there.",
    ], "category": "disagreement", "formality": "polite"},

    # 설명 표현
    {"pattern": "What I mean is...", "meaning": "제 말은...", "examples": [
        "What I mean is, we need more research.",
        "What I mean is, it's not that simple.",
    ], "category": "clarification", "formality": "neutral"},

    {"pattern": "In other words...", "meaning": "다시 말해서...", "examples": [
        "In other words, we need to start over.",
        "In other words, he's not coming.",
    ], "category": "clarification", "formality": "neutral"},
]


def create_idiom_dialogues(idioms: List[Dict]) -> List[Dict]:
    """숙어를 사용한 대화 예시 생성"""
    dialogues = []

    for idiom in idioms[:20]:  # 상위 20개만
        dialogue = {
            "idiom": idiom["idiom"],
            "meaning": idiom["meaning"],
            "dialogue": [
                {"speaker": "A", "text": f"I heard the exam was {idiom['idiom']}." if "piece of cake" in idiom["idiom"] else f"How are you feeling about the project?"},
                {"speaker": "B", "text": idiom["example"]},
                {"speaker": "A", "text": "That's great to hear!" if "positive" in idiom.get("sentiment", "neutral") else "I see what you mean."},
            ],
            "category": idiom["category"],
            "difficulty": idiom["difficulty"]
        }
        dialogues.append(dialogue)

    return dialogues


def main():
    print("=" * 60)
    print("영어 숙어/관용구 데이터 수집")
    print("=" * 60)

    # 통계
    print(f"\nTotal idioms: {len(COMMON_IDIOMS)}")
    print(f"Total phrasal verbs: {len(PHRASAL_VERBS)}")
    print(f"Total patterns: {len(USEFUL_PATTERNS)}")

    # 카테고리별 통계
    idiom_categories = {}
    for idiom in COMMON_IDIOMS:
        cat = idiom["category"]
        idiom_categories[cat] = idiom_categories.get(cat, 0) + 1

    print("\nIdioms by category:")
    for cat, count in sorted(idiom_categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    # 난이도별 통계
    idiom_levels = {}
    for idiom in COMMON_IDIOMS:
        level = idiom["difficulty"]
        idiom_levels[level] = idiom_levels.get(level, 0) + 1

    print("\nIdioms by difficulty:")
    for level, count in idiom_levels.items():
        print(f"  {level}: {count}")

    # 대화 예시 생성
    dialogues = create_idiom_dialogues(COMMON_IDIOMS)
    print(f"\nGenerated dialogues: {len(dialogues)}")

    # 결과 저장
    print("\n" + "=" * 60)
    print("Saving results...")

    # 숙어
    with open(OUTPUT_DIR / "idioms.json", "w", encoding="utf-8") as f:
        json.dump(COMMON_IDIOMS, f, ensure_ascii=False, indent=2)
    print(f"  idioms.json: {len(COMMON_IDIOMS)} idioms")

    # 동사구
    with open(OUTPUT_DIR / "phrasal_verbs.json", "w", encoding="utf-8") as f:
        json.dump(PHRASAL_VERBS, f, ensure_ascii=False, indent=2)
    print(f"  phrasal_verbs.json: {len(PHRASAL_VERBS)} verbs")

    # 표현 패턴
    with open(OUTPUT_DIR / "patterns.json", "w", encoding="utf-8") as f:
        json.dump(USEFUL_PATTERNS, f, ensure_ascii=False, indent=2)
    print(f"  patterns.json: {len(USEFUL_PATTERNS)} patterns")

    # 대화 예시
    with open(OUTPUT_DIR / "dialogues.json", "w", encoding="utf-8") as f:
        json.dump(dialogues, f, ensure_ascii=False, indent=2)
    print(f"  dialogues.json: {len(dialogues)} dialogues")

    # 전체 통합 파일
    all_data = {
        "idioms": COMMON_IDIOMS,
        "phrasal_verbs": PHRASAL_VERBS,
        "patterns": USEFUL_PATTERNS,
        "dialogues": dialogues,
        "metadata": {
            "total_idioms": len(COMMON_IDIOMS),
            "total_phrasal_verbs": len(PHRASAL_VERBS),
            "total_patterns": len(USEFUL_PATTERNS),
            "categories": list(idiom_categories.keys()),
        }
    }

    with open(OUTPUT_DIR / "all_expressions.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"  all_expressions.json: combined data")

    print("\n" + "=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print("Done!")


if __name__ == "__main__":
    main()
