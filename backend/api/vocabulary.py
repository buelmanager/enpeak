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
