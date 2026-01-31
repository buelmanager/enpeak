"""
단어 학습 API
- 단어 등록 (with AI 추천 + 감시 AI 검증)
- 단어 → 숙어/예문 확장 (RAG 검색)
- 등록 단어 목록 조회
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from pathlib import Path

router = APIRouter()

# 데이터 디렉토리
DATA_DIR = Path(__file__).parent.parent.parent / "data"
COLLECTED_DIR = DATA_DIR / "collected"
USER_VOCAB_FILE = DATA_DIR / "user_vocabulary.json"


class WordInput(BaseModel):
    word: str
    meaning_ko: Optional[str] = None
    user_id: Optional[str] = "default"


class WordExpansionRequest(BaseModel):
    word: str
    include_idioms: bool = True
    include_examples: bool = True
    include_related: bool = True


class VocabularyResponse(BaseModel):
    word: str
    meaning_ko: str
    part_of_speech: Optional[str] = None
    pronunciation: Optional[str] = None
    idioms: List[Dict[str, Any]] = []
    examples: List[Dict[str, Any]] = []
    related_words: List[str] = []
    validated: bool = False
    validation_message: Optional[str] = None


def load_user_vocabulary() -> Dict:
    """사용자 단어장 로드"""
    if USER_VOCAB_FILE.exists():
        with open(USER_VOCAB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"words": [], "users": {}}


def save_user_vocabulary(data: Dict):
    """사용자 단어장 저장"""
    USER_VOCAB_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(USER_VOCAB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_idioms_data() -> List[Dict]:
    """숙어 데이터 로드"""
    idioms_file = COLLECTED_DIR / "idioms" / "idioms.json"
    if idioms_file.exists():
        with open(idioms_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def load_phrasal_verbs() -> List[Dict]:
    """동사구 데이터 로드"""
    pv_file = COLLECTED_DIR / "idioms" / "phrasal_verbs.json"
    if pv_file.exists():
        with open(pv_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def load_sentences_data() -> List[Dict]:
    """예문 데이터 로드"""
    sentences_file = COLLECTED_DIR / "tatoeba" / "sentences.json"
    if sentences_file.exists():
        with open(sentences_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


# RAG 청크 데이터 디렉토리
RAG_CHUNKS_DIR = DATA_DIR / "rag_chunks"


def search_idioms_containing_word(word: str, limit: int = 5) -> List[Dict]:
    """RAG 청크에서 특정 단어가 포함된 숙어 검색"""
    word_lower = word.lower()
    results = []

    # 숙어 파일들 검색
    idiom_files = ["idiom_chunks.json", "more_idioms_chunks.json"]
    for filename in idiom_files:
        filepath = RAG_CHUNKS_DIR / filename
        if filepath.exists():
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for item in data:
                    # 숙어 표현에서 단어 검색
                    expression = item.get("expression") or item.get("idiom") or ""
                    if word_lower in expression.lower():
                        meaning = item.get("meaning") or item.get("meaning_ko") or ""
                        example = item.get("example") or ""
                        results.append({
                            "phrase": expression,
                            "meaning": meaning,
                            "example": example,
                        })
                        if len(results) >= limit:
                            return results
            except Exception:
                pass

    return results


def search_sentences_containing_word(word: str, limit: int = 5) -> List[Dict]:
    """RAG 청크에서 특정 단어가 포함된 예문 검색"""
    word_lower = word.lower()
    results = []

    # 대화 데이터에서 검색
    dialogue_file = RAG_CHUNKS_DIR / "dialogsum_chunks.json"
    if dialogue_file.exists():
        try:
            with open(dialogue_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            for item in data:
                content = item.get("content", "")
                # 대화에서 해당 단어가 포함된 문장 추출
                lines = content.split("\n")
                for line in lines:
                    if word_lower in line.lower() and len(line) > 10 and len(line) < 150:
                        # #Person1#: 등의 접두어 제거
                        clean_line = line
                        if ":" in line:
                            clean_line = line.split(":", 1)[1].strip()
                        if clean_line and len(clean_line) > 5:
                            results.append({
                                "en": clean_line,
                                "ko": "",  # 번역 없음
                            })
                            if len(results) >= limit:
                                return results
        except Exception:
            pass

    # 표현 데이터에서 검색
    expr_file = RAG_CHUNKS_DIR / "expressions_chunks.json"
    if expr_file.exists():
        try:
            with open(expr_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            for item in data:
                expression = item.get("expression", "")
                if word_lower in expression.lower():
                    meaning = item.get("meaning_ko") or item.get("meaning") or ""
                    results.append({
                        "en": expression,
                        "ko": meaning,
                    })
                    if len(results) >= limit:
                        return results
        except Exception:
            pass

    return results


# 일반 단어에 대한 실제 숙어/예문 데이터베이스
COMMON_WORD_DATA = {
    "man": {
        "idioms": [
            {"phrase": "man of his word", "meaning": "약속을 지키는 사람"},
            {"phrase": "the man in the street", "meaning": "보통 사람, 일반인"},
            {"phrase": "be your own man", "meaning": "독립적이다, 자기 주관이 있다"},
            {"phrase": "odd man out", "meaning": "왕따, 이질적인 사람"},
        ],
        "sentences": [
            {"en": "The man is waiting at the bus stop.", "ko": "그 남자는 버스 정류장에서 기다리고 있어요."},
            {"en": "He's a man of few words.", "ko": "그는 말이 적은 사람이에요."},
            {"en": "Every man has his price.", "ko": "모든 사람에게는 약점이 있다."},
        ],
        "related_words": ["person", "human", "male", "gentleman", "guy"],
    },
    "time": {
        "idioms": [
            {"phrase": "kill time", "meaning": "시간을 때우다"},
            {"phrase": "in the nick of time", "meaning": "아슬아슬하게, 간신히"},
            {"phrase": "time flies", "meaning": "시간이 빨리 지나가다"},
            {"phrase": "from time to time", "meaning": "때때로, 가끔"},
        ],
        "sentences": [
            {"en": "Time flies when you're having fun.", "ko": "즐거울 때는 시간이 빨리 가요."},
            {"en": "What time is it now?", "ko": "지금 몇 시예요?"},
            {"en": "I don't have time for this.", "ko": "이럴 시간이 없어요."},
        ],
        "related_words": ["hour", "minute", "moment", "period", "era"],
    },
    "hand": {
        "idioms": [
            {"phrase": "hands down", "meaning": "손쉽게, 확실히"},
            {"phrase": "on the other hand", "meaning": "반면에, 다른 한편으로"},
            {"phrase": "give someone a hand", "meaning": "도와주다"},
            {"phrase": "get out of hand", "meaning": "통제 불능이 되다"},
        ],
        "sentences": [
            {"en": "Can you give me a hand with this?", "ko": "이것 좀 도와줄 수 있어요?"},
            {"en": "Raise your hand if you have a question.", "ko": "질문이 있으면 손을 드세요."},
            {"en": "The situation got out of hand.", "ko": "상황이 통제 불능이 됐어요."},
        ],
        "related_words": ["finger", "arm", "palm", "wrist", "fist"],
    },
    "day": {
        "idioms": [
            {"phrase": "call it a day", "meaning": "오늘은 여기까지 하다"},
            {"phrase": "day in, day out", "meaning": "매일 매일"},
            {"phrase": "save the day", "meaning": "위기를 모면하다"},
            {"phrase": "at the end of the day", "meaning": "결국, 궁극적으로"},
        ],
        "sentences": [
            {"en": "Have a nice day!", "ko": "좋은 하루 보내세요!"},
            {"en": "What day is it today?", "ko": "오늘 무슨 요일이에요?"},
            {"en": "Let's call it a day.", "ko": "오늘은 여기까지 합시다."},
        ],
        "related_words": ["morning", "afternoon", "evening", "night", "week"],
    },
    "work": {
        "idioms": [
            {"phrase": "work out", "meaning": "운동하다 / 잘 되다"},
            {"phrase": "work on", "meaning": "~에 집중하다, 작업하다"},
            {"phrase": "all in a day's work", "meaning": "일상적인 일"},
            {"phrase": "work wonders", "meaning": "놀라운 효과를 내다"},
        ],
        "sentences": [
            {"en": "I have to work late today.", "ko": "오늘 야근해야 해요."},
            {"en": "Hard work pays off.", "ko": "노력은 결실을 맺어요."},
            {"en": "Everything will work out.", "ko": "모든 게 잘 될 거예요."},
        ],
        "related_words": ["job", "career", "office", "business", "task"],
    },
    "water": {
        "idioms": [
            {"phrase": "water under the bridge", "meaning": "지나간 일, 이미 끝난 일"},
            {"phrase": "in hot water", "meaning": "곤경에 처한"},
            {"phrase": "test the waters", "meaning": "상황을 살피다"},
            {"phrase": "hold water", "meaning": "타당하다, 이치에 맞다"},
        ],
        "sentences": [
            {"en": "Can I have a glass of water?", "ko": "물 한 잔 주시겠어요?"},
            {"en": "The water is boiling.", "ko": "물이 끓고 있어요."},
            {"en": "Don't waste water.", "ko": "물을 낭비하지 마세요."},
        ],
        "related_words": ["drink", "liquid", "river", "ocean", "rain"],
    },
    "head": {
        "idioms": [
            {"phrase": "head over heels", "meaning": "완전히 반한, 푹 빠진"},
            {"phrase": "keep your head", "meaning": "침착하다"},
            {"phrase": "over your head", "meaning": "이해하기 어려운"},
            {"phrase": "heads up", "meaning": "조심해, 주의해"},
        ],
        "sentences": [
            {"en": "Use your head!", "ko": "머리 좀 써!"},
            {"en": "I have a headache.", "ko": "두통이 있어요."},
            {"en": "Keep your head down.", "ko": "조용히 있어요. / 눈에 띄지 마세요."},
        ],
        "related_words": ["brain", "mind", "face", "hair", "neck"],
    },
    "heart": {
        "idioms": [
            {"phrase": "break someone's heart", "meaning": "마음을 아프게 하다"},
            {"phrase": "by heart", "meaning": "암기하여"},
            {"phrase": "have a heart", "meaning": "인정 좀 베풀어"},
            {"phrase": "heart and soul", "meaning": "온 마음을 다해"},
        ],
        "sentences": [
            {"en": "Follow your heart.", "ko": "마음 가는 대로 해."},
            {"en": "I learned it by heart.", "ko": "그걸 암기했어요."},
            {"en": "She has a kind heart.", "ko": "그녀는 착한 마음씨를 가졌어요."},
        ],
        "related_words": ["love", "soul", "feeling", "emotion", "passion"],
    },
    "eye": {
        "idioms": [
            {"phrase": "catch someone's eye", "meaning": "눈에 띄다"},
            {"phrase": "see eye to eye", "meaning": "의견이 일치하다"},
            {"phrase": "keep an eye on", "meaning": "주시하다, 감시하다"},
            {"phrase": "turn a blind eye", "meaning": "모른 척하다"},
        ],
        "sentences": [
            {"en": "Keep an eye on the kids.", "ko": "아이들을 잘 봐주세요."},
            {"en": "I can't believe my eyes!", "ko": "내 눈을 믿을 수가 없어!"},
            {"en": "We don't see eye to eye.", "ko": "우리는 의견이 다릅니다."},
        ],
        "related_words": ["vision", "sight", "look", "view", "watch"],
    },
    "food": {
        "idioms": [
            {"phrase": "food for thought", "meaning": "생각할 거리"},
            {"phrase": "fast food", "meaning": "패스트푸드"},
            {"phrase": "comfort food", "meaning": "위로가 되는 음식"},
        ],
        "sentences": [
            {"en": "The food here is delicious.", "ko": "여기 음식이 맛있어요."},
            {"en": "Let's order some food.", "ko": "음식 좀 주문합시다."},
            {"en": "I love Korean food.", "ko": "한국 음식을 좋아해요."},
        ],
        "related_words": ["meal", "dish", "cuisine", "snack", "drink"],
    },
    # 자주 사용되는 동사들
    "call": {
        "idioms": [
            {"phrase": "call it a day", "meaning": "오늘은 여기까지 하다"},
            {"phrase": "call off", "meaning": "취소하다"},
            {"phrase": "call on", "meaning": "방문하다, 요청하다"},
            {"phrase": "wake-up call", "meaning": "경종, 각성의 계기"},
        ],
        "sentences": [
            {"en": "I'll call you later.", "ko": "나중에 전화할게요."},
            {"en": "Please call me back.", "ko": "다시 전화해 주세요."},
            {"en": "What do you call this in English?", "ko": "이것을 영어로 뭐라고 해요?"},
        ],
        "related_words": ["phone", "ring", "contact", "dial", "message"],
    },
    "go": {
        "idioms": [
            {"phrase": "go ahead", "meaning": "진행하다, 먼저 하세요"},
            {"phrase": "go through", "meaning": "겪다, 통과하다"},
            {"phrase": "let go", "meaning": "놓아주다, 포기하다"},
            {"phrase": "on the go", "meaning": "바쁘게 움직이는"},
        ],
        "sentences": [
            {"en": "Let's go home.", "ko": "집에 가자."},
            {"en": "Where are you going?", "ko": "어디 가세요?"},
            {"en": "I need to go now.", "ko": "이제 가야 해요."},
        ],
        "related_words": ["leave", "travel", "move", "walk", "come"],
    },
    "come": {
        "idioms": [
            {"phrase": "come across", "meaning": "우연히 만나다"},
            {"phrase": "come up with", "meaning": "생각해내다"},
            {"phrase": "come true", "meaning": "실현되다"},
            {"phrase": "first come, first served", "meaning": "선착순"},
        ],
        "sentences": [
            {"en": "Come here, please.", "ko": "이리 와 주세요."},
            {"en": "When did you come to Korea?", "ko": "언제 한국에 왔어요?"},
            {"en": "Dreams come true.", "ko": "꿈은 이루어진다."},
        ],
        "related_words": ["arrive", "visit", "approach", "go", "return"],
    },
    "take": {
        "idioms": [
            {"phrase": "take care", "meaning": "조심해, 잘 지내"},
            {"phrase": "take off", "meaning": "이륙하다, 벗다"},
            {"phrase": "take place", "meaning": "일어나다, 개최되다"},
            {"phrase": "take it easy", "meaning": "진정해, 쉬엄쉬엄 해"},
        ],
        "sentences": [
            {"en": "Take your time.", "ko": "천천히 하세요."},
            {"en": "I'll take this one.", "ko": "이걸로 할게요."},
            {"en": "How long does it take?", "ko": "얼마나 걸려요?"},
        ],
        "related_words": ["bring", "carry", "grab", "hold", "get"],
    },
    "make": {
        "idioms": [
            {"phrase": "make sense", "meaning": "이해가 되다, 말이 되다"},
            {"phrase": "make sure", "meaning": "확실히 하다"},
            {"phrase": "make up", "meaning": "화해하다, 구성하다"},
            {"phrase": "make a difference", "meaning": "변화를 만들다"},
        ],
        "sentences": [
            {"en": "Let me make a reservation.", "ko": "예약할게요."},
            {"en": "Can you make coffee?", "ko": "커피 만들 수 있어요?"},
            {"en": "That makes sense.", "ko": "그거 이해가 돼요."},
        ],
        "related_words": ["create", "build", "produce", "do", "form"],
    },
    "get": {
        "idioms": [
            {"phrase": "get along", "meaning": "사이좋게 지내다"},
            {"phrase": "get over", "meaning": "극복하다"},
            {"phrase": "get up", "meaning": "일어나다"},
            {"phrase": "get rid of", "meaning": "없애다, 제거하다"},
        ],
        "sentences": [
            {"en": "I get it.", "ko": "이해했어요."},
            {"en": "What time do you get up?", "ko": "몇 시에 일어나요?"},
            {"en": "Let's get started.", "ko": "시작하자."},
        ],
        "related_words": ["receive", "obtain", "become", "have", "take"],
    },
    "give": {
        "idioms": [
            {"phrase": "give up", "meaning": "포기하다"},
            {"phrase": "give in", "meaning": "굴복하다, 양보하다"},
            {"phrase": "give away", "meaning": "나눠주다, 폭로하다"},
            {"phrase": "give it a try", "meaning": "한번 해보다"},
        ],
        "sentences": [
            {"en": "Can you give me a hand?", "ko": "좀 도와줄 수 있어요?"},
            {"en": "Don't give up!", "ko": "포기하지 마!"},
            {"en": "I'll give it a try.", "ko": "한번 해볼게요."},
        ],
        "related_words": ["offer", "provide", "share", "present", "donate"],
    },
    "see": {
        "idioms": [
            {"phrase": "see you later", "meaning": "나중에 봐요"},
            {"phrase": "wait and see", "meaning": "두고 보다"},
            {"phrase": "see eye to eye", "meaning": "의견이 일치하다"},
            {"phrase": "I see", "meaning": "알겠어요, 그렇군요"},
        ],
        "sentences": [
            {"en": "Nice to see you.", "ko": "만나서 반가워요."},
            {"en": "I see what you mean.", "ko": "무슨 말인지 알겠어요."},
            {"en": "See you tomorrow!", "ko": "내일 봐요!"},
        ],
        "related_words": ["look", "watch", "view", "notice", "observe"],
    },
    "look": {
        "idioms": [
            {"phrase": "look forward to", "meaning": "기대하다"},
            {"phrase": "look after", "meaning": "돌보다"},
            {"phrase": "look up", "meaning": "찾아보다, 올려다보다"},
            {"phrase": "look out", "meaning": "조심해"},
        ],
        "sentences": [
            {"en": "Look at this!", "ko": "이것 좀 봐!"},
            {"en": "You look great today.", "ko": "오늘 멋져 보여요."},
            {"en": "I'm looking forward to it.", "ko": "기대하고 있어요."},
        ],
        "related_words": ["see", "watch", "appear", "seem", "glance"],
    },
    "run": {
        "idioms": [
            {"phrase": "run out of", "meaning": "다 떨어지다"},
            {"phrase": "in the long run", "meaning": "결국, 장기적으로"},
            {"phrase": "run into", "meaning": "우연히 만나다"},
            {"phrase": "run away", "meaning": "도망치다"},
        ],
        "sentences": [
            {"en": "I run every morning.", "ko": "매일 아침 달려요."},
            {"en": "We're running out of time.", "ko": "시간이 다 되어가요."},
            {"en": "The bus runs every 10 minutes.", "ko": "버스가 10분마다 와요."},
        ],
        "related_words": ["jog", "sprint", "walk", "move", "race"],
    },
}


def get_smart_fallback(word: str) -> Dict:
    """단어에 맞는 스마트 폴백 데이터 반환 (RAG 검색 포함)"""
    word_lower = word.lower()

    # 1. 하드코딩된 데이터베이스에 있는 경우
    if word_lower in COMMON_WORD_DATA:
        return COMMON_WORD_DATA[word_lower]

    # 2. RAG 청크 데이터에서 검색
    rag_idioms = search_idioms_containing_word(word, limit=4)
    rag_sentences = search_sentences_containing_word(word, limit=4)

    # RAG에서 데이터를 찾은 경우
    if rag_idioms or rag_sentences:
        return {
            "idioms": rag_idioms,
            "sentences": rag_sentences,
            "related_words": [],
        }

    # 3. 아무것도 없으면 일반적인 학습 문장 생성
    return {
        "idioms": [],
        "sentences": [
            {"en": f"I'm learning the word '{word}'.", "ko": f"'{word}'라는 단어를 배우고 있어요."},
            {"en": f"Can you use '{word}' in a sentence?", "ko": f"'{word}'를 문장에서 사용해 볼 수 있나요?"},
            {"en": f"How do you pronounce '{word}'?", "ko": f"'{word}'는 어떻게 발음하나요?"},
        ],
        "related_words": [],
    }


async def validate_with_supervisor_ai(word: str, meaning: str, llm) -> Dict:
    """감시 AI로 콘텐츠 검증"""
    if not llm:
        return {"valid": True, "message": "LLM not available, skipping validation"}

    validation_prompt = f"""You are a content validation AI for an English learning app.
Validate the following word entry:

Word: {word}
Meaning (Korean): {meaning}

Check for:
1. Is this a valid English word?
2. Is the Korean meaning accurate?
3. Is the content appropriate for learners?
4. Any offensive or inappropriate content?

Respond in JSON format:
{{
    "valid": true/false,
    "corrected_meaning": "corrected Korean meaning if needed",
    "issues": ["list of issues if any"],
    "suggestions": ["suggestions for improvement"]
}}
"""

    try:
        response = await llm.generate(validation_prompt)
        # JSON 파싱 시도
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print(f"Validation error: {e}")

    return {"valid": True, "message": "Validation completed"}


async def expand_word_with_ai(word: str, llm) -> Dict:
    """AI로 단어 확장 정보 생성"""
    if not llm:
        return {}

    expansion_prompt = f"""You are an English vocabulary expert helping Korean learners.
For the word "{word}", provide:

1. Part of speech (noun, verb, adjective, etc.)
2. Korean meaning (accurate translation)
3. Pronunciation hint (using Korean syllables)
4. 3 example sentences with Korean translations
5. 3 related words
6. Any common idioms or phrases using this word

Respond in JSON format:
{{
    "part_of_speech": "noun/verb/etc",
    "meaning_ko": "한국어 의미",
    "pronunciation_hint": "발음 힌트",
    "examples": [
        {{"english": "Example sentence", "korean": "예문 번역"}}
    ],
    "related_words": ["word1", "word2", "word3"],
    "idioms": [
        {{"idiom": "idiom with word", "meaning": "숙어 의미"}}
    ]
}}
"""

    try:
        response = await llm.generate(expansion_prompt)
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print(f"Expansion error: {e}")

    return {}


def search_related_idioms(word: str) -> List[Dict]:
    """단어와 관련된 숙어 검색 (JSON 파일 + RAG)"""
    idioms = load_idioms_data()
    phrasal_verbs = load_phrasal_verbs()

    related = []
    word_lower = word.lower()

    # 숙어에서 검색
    for idiom in idioms:
        if word_lower in idiom.get("idiom", "").lower():
            related.append({
                "phrase": idiom["idiom"],
                "meaning": idiom["meaning"],
                "example": idiom.get("example", ""),
                "difficulty": idiom.get("difficulty", "intermediate")
            })

    # 동사구에서 검색
    for pv in phrasal_verbs:
        if word_lower in pv.get("verb", "").lower():
            related.append({
                "phrase": pv["verb"],
                "meaning": pv["meaning"],
                "example": pv.get("examples", [""])[0] if pv.get("examples") else "",
                "difficulty": pv.get("difficulty", "intermediate")
            })

    # RAG에서 추가 검색
    try:
        from .rag import get_collection
        collection = get_collection()
        if collection:
            results = collection.query(
                query_texts=[word],
                n_results=10,
                where={"$or": [{"type": "idiom"}, {"type": "phrasal_verb"}]}
            )
            if results['ids'] and results['ids'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    meta = results['metadatas'][0][i] if results['metadatas'] else {}
                    # 중복 체크
                    phrase = meta.get("idiom", meta.get("expression", doc[:50]))
                    if not any(r["phrase"].lower() == phrase.lower() for r in related):
                        related.append({
                            "phrase": phrase,
                            "meaning": meta.get("meaning", meta.get("meaning_ko", "")),
                            "example": meta.get("example", ""),
                            "difficulty": meta.get("difficulty", "intermediate")
                        })
    except Exception as e:
        print(f"RAG idiom search error: {e}")

    return related[:10]  # 최대 10개


def search_example_sentences(word: str) -> List[Dict]:
    """단어가 포함된 예문 검색 (JSON 파일 + RAG)"""
    sentences = load_sentences_data()

    examples = []
    word_lower = word.lower()

    # JSON 파일에서 검색
    for sent in sentences:
        if word_lower in sent.get("english", "").lower():
            examples.append({
                "en": sent["english"],
                "ko": sent.get("korean", ""),
                "category": sent.get("category", "general"),
            })
            if len(examples) >= 5:
                break

    # RAG에서 추가 검색 (대화, 표현, 문장 등)
    try:
        from .rag import get_collection
        collection = get_collection()
        if collection:
            results = collection.query(
                query_texts=[word],
                n_results=15,
                where={"$or": [
                    {"type": "dialogue"},
                    {"type": "expression"},
                    {"type": "sentence_pair"},
                    {"type": "useful_sentence"}
                ]}
            )
            if results['ids'] and results['ids'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    meta = results['metadatas'][0][i] if results['metadatas'] else {}
                    # 영어 문장 추출
                    en_text = meta.get("english", meta.get("expression", ""))
                    ko_text = meta.get("korean", meta.get("meaning_ko", meta.get("meaning", "")))

                    # 문서 텍스트에서 추출 시도
                    if not en_text and doc:
                        en_text = doc.split('\n')[0] if '\n' in doc else doc[:100]

                    if en_text and not any(e["en"].lower() == en_text.lower() for e in examples):
                        examples.append({
                            "en": en_text,
                            "ko": ko_text,
                            "category": meta.get("category", "general"),
                        })

                    if len(examples) >= 10:
                        break
    except Exception as e:
        print(f"RAG sentence search error: {e}")

    return examples[:10]


@router.post("/add", response_model=VocabularyResponse)
async def add_vocabulary(word_input: WordInput, request: Request):
    """
    단어 등록 API
    - AI 추천으로 의미 보완
    - 감시 AI로 콘텐츠 검증
    """
    word = word_input.word.strip().lower()

    if not word:
        raise HTTPException(status_code=400, detail="Word is required")

    if len(word) > 50:
        raise HTTPException(status_code=400, detail="Word too long")

    # LLM 가져오기
    llm = getattr(request.app.state, "llm", None)

    # AI로 단어 확장 정보 생성
    ai_expansion = {}
    if llm:
        ai_expansion = await expand_word_with_ai(word, llm)

    # 의미 결정 (사용자 입력 > AI 생성)
    meaning_ko = word_input.meaning_ko or ai_expansion.get("meaning_ko", "")

    # 감시 AI 검증
    validation_result = {"valid": True, "message": "OK"}
    if llm and meaning_ko:
        validation_result = await validate_with_supervisor_ai(word, meaning_ko, llm)

    # 관련 숙어 검색
    related_idioms = search_related_idioms(word)

    # 예문 검색
    examples = search_example_sentences(word)

    # AI가 생성한 예문 추가
    if ai_expansion.get("examples"):
        examples = ai_expansion["examples"] + examples

    # 사용자 단어장에 저장
    vocab_data = load_user_vocabulary()

    new_entry = {
        "word": word,
        "meaning_ko": meaning_ko,
        "part_of_speech": ai_expansion.get("part_of_speech", ""),
        "pronunciation_hint": ai_expansion.get("pronunciation_hint", ""),
        "added_by": word_input.user_id,
        "validated": validation_result.get("valid", True),
    }

    # 중복 체크
    existing = [w for w in vocab_data["words"] if w["word"] == word]
    if not existing:
        vocab_data["words"].append(new_entry)
        save_user_vocabulary(vocab_data)

    return VocabularyResponse(
        word=word,
        meaning_ko=meaning_ko,
        part_of_speech=ai_expansion.get("part_of_speech"),
        pronunciation=ai_expansion.get("pronunciation_hint"),
        idioms=related_idioms + ai_expansion.get("idioms", []),
        examples=examples[:10],
        related_words=ai_expansion.get("related_words", []),
        validated=validation_result.get("valid", True),
        validation_message=validation_result.get("message"),
    )


@router.post("/expand")
async def expand_vocabulary(expansion_req: WordExpansionRequest, request: Request):
    """
    단어 확장 API
    - RAG 검색으로 관련 숙어/예문 제공
    - AI로 추가 컨텍스트 생성
    """
    word = expansion_req.word.strip().lower()

    if not word:
        raise HTTPException(status_code=400, detail="Word is required")

    result = {
        "word": word,
        "idioms": [],
        "sentences": [],  # frontend expects 'sentences' not 'examples'
        "related_words": [],
    }

    # 숙어 검색 (RAG + JSON)
    if expansion_req.include_idioms:
        idioms = search_related_idioms(word)
        # 프론트엔드 형식에 맞게 변환 (phrase, meaning)
        result["idioms"] = idioms

    # 예문 검색 (RAG + JSON)
    if expansion_req.include_examples:
        sentences = search_example_sentences(word)
        # 프론트엔드 형식에 맞게 변환 (en, ko)
        result["sentences"] = sentences

    # AI로 추가 정보 생성 (관련 단어)
    llm = getattr(request.app.state, "llm", None)
    if llm and expansion_req.include_related:
        try:
            ai_expansion = await expand_word_with_ai(word, llm)
            result["related_words"] = ai_expansion.get("related_words", [])

            # AI가 생성한 숙어 추가 (중복 제거)
            ai_idioms = ai_expansion.get("idioms", [])
            for ai_idiom in ai_idioms:
                idiom_phrase = ai_idiom.get("idiom", "")
                if idiom_phrase and not any(i.get("phrase", "").lower() == idiom_phrase.lower() for i in result["idioms"]):
                    result["idioms"].append({
                        "phrase": idiom_phrase,
                        "meaning": ai_idiom.get("meaning", ""),
                    })

            # AI가 생성한 예문 추가 (중복 제거)
            ai_examples = ai_expansion.get("examples", [])
            for ai_ex in ai_examples:
                en_text = ai_ex.get("english", "")
                if en_text and not any(s.get("en", "").lower() == en_text.lower() for s in result["sentences"]):
                    result["sentences"].append({
                        "en": en_text,
                        "ko": ai_ex.get("korean", ""),
                    })
        except Exception as e:
            print(f"AI expansion error: {e}")

    # 데이터가 없으면 스마트 폴백 제공
    fallback_data = get_smart_fallback(word)

    if not result["idioms"]:
        result["idioms"] = fallback_data.get("idioms", [])

    if not result["sentences"]:
        result["sentences"] = fallback_data.get("sentences", [])

    if not result["related_words"]:
        result["related_words"] = fallback_data.get("related_words", [])

    return result


@router.get("/list")
async def list_vocabulary(user_id: str = "default", limit: int = 50):
    """
    등록된 단어 목록 조회
    """
    vocab_data = load_user_vocabulary()

    # 사용자 필터링
    if user_id != "all":
        words = [w for w in vocab_data["words"] if w.get("added_by", "default") == user_id]
    else:
        words = vocab_data["words"]

    # 최신순 정렬 (뒤에 추가된 것이 최신)
    words = list(reversed(words))[:limit]

    return {
        "total": len(words),
        "words": words,
    }


@router.delete("/remove/{word}")
async def remove_vocabulary(word: str, user_id: str = "default"):
    """
    단어 삭제
    """
    vocab_data = load_user_vocabulary()

    # 해당 단어 찾기
    original_len = len(vocab_data["words"])
    vocab_data["words"] = [
        w for w in vocab_data["words"]
        if not (w["word"] == word.lower() and w.get("added_by", "default") == user_id)
    ]

    if len(vocab_data["words"]) == original_len:
        raise HTTPException(status_code=404, detail="Word not found")

    save_user_vocabulary(vocab_data)

    return {"message": f"Word '{word}' removed successfully"}


@router.get("/level/{level}")
async def get_vocabulary_by_level(level: str, limit: int = 10):
    """
    레벨별 단어 조회 (A1-C2)
    """
    level = level.upper()
    if level not in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
        raise HTTPException(status_code=400, detail="Invalid level. Use A1, A2, B1, B2, C1, or C2")

    # RAG 청크에서 레벨별 단어 로드
    vocab_chunks_file = DATA_DIR / "rag_chunks" / "vocabulary_chunks.json"
    words = []

    if vocab_chunks_file.exists():
        try:
            with open(vocab_chunks_file, "r", encoding="utf-8") as f:
                chunks = json.load(f)
                for chunk in chunks:
                    metadata = chunk.get("metadata", {})
                    chunk_level = metadata.get("level", "").upper()
                    if chunk_level == level:
                        # word와 meaning은 최상위 레벨에 있음
                        word_text = chunk.get("word", "")
                        meaning_text = chunk.get("meaning", "")
                        example_text = chunk.get("example", "")

                        # metadata에서 폴백
                        if not word_text:
                            word_text = metadata.get("word", "")
                        if not meaning_text:
                            meaning_text = metadata.get("meaning_ko", metadata.get("meaning", ""))

                        if word_text:
                            words.append({
                                "word": word_text,
                                "meaning": meaning_text,
                                "level": level,
                                "example": example_text or metadata.get("example", ""),
                                "example_ko": metadata.get("example_ko", ""),
                                "pronunciation": metadata.get("pronunciation", ""),
                            })
        except Exception as e:
            print(f"Error loading vocabulary: {e}")

    # 샘플 데이터 폴백
    if not words:
        sample_words = {
            'A1': [
                {"word": "hello", "meaning": "안녕하세요", "level": "A1", "example": "Hello, how are you?", "example_ko": "안녕하세요, 어떻게 지내세요?"},
                {"word": "goodbye", "meaning": "안녕히 가세요", "level": "A1", "example": "Goodbye, see you tomorrow!", "example_ko": "안녕히 가세요, 내일 봐요!"},
                {"word": "thank you", "meaning": "감사합니다", "level": "A1", "example": "Thank you for your help.", "example_ko": "도와주셔서 감사합니다."},
                {"word": "please", "meaning": "부탁드립니다", "level": "A1", "example": "Please help me.", "example_ko": "도와주세요."},
                {"word": "water", "meaning": "물", "level": "A1", "example": "Can I have some water?", "example_ko": "물 좀 주시겠어요?"},
                {"word": "food", "meaning": "음식", "level": "A1", "example": "The food is delicious.", "example_ko": "음식이 맛있어요."},
                {"word": "friend", "meaning": "친구", "level": "A1", "example": "She is my friend.", "example_ko": "그녀는 내 친구야."},
                {"word": "family", "meaning": "가족", "level": "A1", "example": "I love my family.", "example_ko": "나는 가족을 사랑해."},
                {"word": "happy", "meaning": "행복한", "level": "A1", "example": "I'm so happy today!", "example_ko": "오늘 정말 행복해!"},
                {"word": "beautiful", "meaning": "아름다운", "level": "A1", "example": "You look beautiful.", "example_ko": "당신은 아름다워요."},
            ],
            'A2': [
                {"word": "appointment", "meaning": "약속, 예약", "level": "A2", "example": "I have an appointment at 3 PM.", "example_ko": "오후 3시에 약속이 있어요."},
                {"word": "schedule", "meaning": "일정", "level": "A2", "example": "What's your schedule today?", "example_ko": "오늘 일정이 어떻게 되세요?"},
                {"word": "experience", "meaning": "경험", "level": "A2", "example": "It was a great experience.", "example_ko": "정말 좋은 경험이었어요."},
                {"word": "opportunity", "meaning": "기회", "level": "A2", "example": "This is a great opportunity.", "example_ko": "이것은 좋은 기회예요."},
                {"word": "decision", "meaning": "결정", "level": "A2", "example": "I made a decision.", "example_ko": "결정을 내렸어요."},
            ],
            'B1': [
                {"word": "accomplish", "meaning": "성취하다", "level": "B1", "example": "I accomplished my goal.", "example_ko": "목표를 달성했어요."},
                {"word": "determine", "meaning": "결정하다", "level": "B1", "example": "We need to determine the cause.", "example_ko": "원인을 파악해야 해요."},
                {"word": "contribute", "meaning": "기여하다", "level": "B1", "example": "She contributed to the project.", "example_ko": "그녀가 프로젝트에 기여했어요."},
            ],
            'B2': [
                {"word": "comprehensive", "meaning": "포괄적인", "level": "B2", "example": "This is a comprehensive guide.", "example_ko": "이것은 포괄적인 가이드입니다."},
                {"word": "substantial", "meaning": "상당한", "level": "B2", "example": "There was a substantial increase.", "example_ko": "상당한 증가가 있었어요."},
            ],
            'C1': [
                {"word": "meticulous", "meaning": "꼼꼼한", "level": "C1", "example": "She is meticulous about details.", "example_ko": "그녀는 세부사항에 꼼꼼해요."},
                {"word": "ubiquitous", "meaning": "어디에나 있는", "level": "C1", "example": "Smartphones are ubiquitous.", "example_ko": "스마트폰은 어디에나 있어요."},
            ],
            'C2': [
                {"word": "ephemeral", "meaning": "덧없는", "level": "C2", "example": "Fame is often ephemeral.", "example_ko": "명성은 종종 덧없어요."},
                {"word": "sycophant", "meaning": "아첨꾼", "level": "C2", "example": "He's just a sycophant.", "example_ko": "그는 그냥 아첨꾼이에요."},
            ],
        }
        words = sample_words.get(level, [])

    # 랜덤하게 섞기
    import random
    random.shuffle(words)

    return {
        "level": level,
        "words": words[:limit],
        "total": len(words),
    }


class EvaluateRequest(BaseModel):
    word: str
    userAnswer: str
    streak: int = 0
    currentLevel: str = "A1"


@router.post("/evaluate")
async def evaluate_answer(request: EvaluateRequest, req: Request):
    """
    AI가 사용자 답변 평가 및 레벨업 판단
    """
    word = request.word.lower()
    user_answer = request.userAnswer.lower().strip()
    streak = request.streak
    current_level = request.currentLevel.upper()

    is_correct = word == user_answer

    # 레벨업 조건: 10연속 정답
    should_level_up = is_correct and streak >= 9

    # AI 평가 (선택적)
    llm = getattr(req.app.state, "llm", None)
    feedback = None

    if llm and not is_correct:
        try:
            prompt = f"""User tried to spell "{word}" but wrote "{user_answer}".
Give a brief, encouraging Korean feedback about the mistake.
Keep it under 20 words."""

            feedback = llm.generate(
                prompt=prompt,
                system_prompt="You are a kind English teacher. Respond in Korean.",
                max_tokens=50,
                temperature=0.7,
            )
        except:
            pass

    return {
        "correct": is_correct,
        "should_level_up": should_level_up,
        "streak": streak + 1 if is_correct else 0,
        "feedback": feedback,
        "next_level": ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][
            min(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].index(current_level) + 1, 5)
        ] if should_level_up else current_level,
    }


@router.get("/search/{query}")
async def search_vocabulary(query: str):
    """
    단어/숙어/예문 통합 검색
    """
    query_lower = query.lower()

    results = {
        "query": query,
        "user_words": [],
        "idioms": [],
        "phrasal_verbs": [],
        "examples": [],
    }

    # 사용자 단어장 검색
    vocab_data = load_user_vocabulary()
    for w in vocab_data["words"]:
        if query_lower in w["word"].lower() or query_lower in w.get("meaning_ko", ""):
            results["user_words"].append(w)

    # 숙어 검색
    idioms = load_idioms_data()
    for idiom in idioms:
        if query_lower in idiom.get("idiom", "").lower() or query_lower in idiom.get("meaning", ""):
            results["idioms"].append(idiom)
            if len(results["idioms"]) >= 10:
                break

    # 동사구 검색
    phrasal_verbs = load_phrasal_verbs()
    for pv in phrasal_verbs:
        if query_lower in pv.get("verb", "").lower() or query_lower in pv.get("meaning", ""):
            results["phrasal_verbs"].append(pv)
            if len(results["phrasal_verbs"]) >= 10:
                break

    # 예문 검색
    sentences = load_sentences_data()
    for sent in sentences:
        if query_lower in sent.get("english", "").lower():
            results["examples"].append(sent)
            if len(results["examples"]) >= 10:
                break

    return results
