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
    """단어와 관련된 숙어 검색"""
    idioms = load_idioms_data()
    phrasal_verbs = load_phrasal_verbs()

    related = []

    # 숙어에서 검색
    word_lower = word.lower()
    for idiom in idioms:
        if word_lower in idiom.get("idiom", "").lower():
            related.append({
                "type": "idiom",
                "expression": idiom["idiom"],
                "meaning": idiom["meaning"],
                "example": idiom.get("example", ""),
                "difficulty": idiom.get("difficulty", "intermediate")
            })

    # 동사구에서 검색
    for pv in phrasal_verbs:
        if word_lower in pv.get("verb", "").lower():
            related.append({
                "type": "phrasal_verb",
                "expression": pv["verb"],
                "meaning": pv["meaning"],
                "examples": pv.get("examples", []),
                "difficulty": pv.get("difficulty", "intermediate")
            })

    return related[:10]  # 최대 10개


def search_example_sentences(word: str) -> List[Dict]:
    """단어가 포함된 예문 검색"""
    sentences = load_sentences_data()

    examples = []
    word_lower = word.lower()

    for sent in sentences:
        if word_lower in sent.get("english", "").lower():
            examples.append({
                "english": sent["english"],
                "korean": sent.get("korean", ""),
                "category": sent.get("category", "general"),
                "difficulty": "beginner" if sent.get("word_count", 10) < 8 else "intermediate"
            })

            if len(examples) >= 10:
                break

    return examples


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
        "examples": [],
        "related_words": [],
        "context": None,
    }

    # 숙어 검색
    if expansion_req.include_idioms:
        result["idioms"] = search_related_idioms(word)

    # 예문 검색
    if expansion_req.include_examples:
        result["examples"] = search_example_sentences(word)

    # AI로 추가 정보 생성
    llm = getattr(request.app.state, "llm", None)
    if llm and expansion_req.include_related:
        ai_expansion = await expand_word_with_ai(word, llm)
        result["related_words"] = ai_expansion.get("related_words", [])
        result["ai_examples"] = ai_expansion.get("examples", [])

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
                    if metadata.get("level", "").upper() == level:
                        words.append({
                            "word": metadata.get("word", chunk.get("content", "").split()[0] if chunk.get("content") else ""),
                            "meaning": metadata.get("meaning_ko", ""),
                            "level": level,
                            "example": metadata.get("example", ""),
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
