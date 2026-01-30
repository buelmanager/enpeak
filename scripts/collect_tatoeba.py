"""
Tatoeba 데이터셋 수집 스크립트
- 영어-한국어 문장 쌍 추출
- 예문 및 번역 데이터
"""

import json
import os
import requests
import tarfile
from pathlib import Path
from typing import List, Dict, Tuple

# 출력 디렉토리
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "collected" / "tatoeba"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Tatoeba 다운로드 URL
TATOEBA_SENTENCES_URL = "https://downloads.tatoeba.org/exports/sentences.tar.bz2"
TATOEBA_LINKS_URL = "https://downloads.tatoeba.org/exports/links.tar.bz2"

# 또는 HuggingFace에서 직접 로드
HF_DATASET = "tatoeba"


def download_from_huggingface() -> List[Dict]:
    """HuggingFace에서 Tatoeba 데이터 로드"""
    try:
        from datasets import load_dataset

        print("Loading Tatoeba from HuggingFace...")
        dataset = load_dataset("tatoeba", lang1="en", lang2="ko")

        sentences = []
        for item in dataset["train"]:
            translation = item.get("translation", {})
            sentences.append({
                "english": translation.get("en", ""),
                "korean": translation.get("ko", ""),
                "source": "tatoeba_hf"
            })

        return sentences

    except Exception as e:
        print(f"HuggingFace loading failed: {e}")
        return []


def categorize_sentence(sentence: str) -> str:
    """문장을 카테고리로 분류"""
    sentence_lower = sentence.lower()

    # 카테고리 키워드
    categories = {
        "greeting": ["hello", "hi ", "good morning", "good evening", "how are you", "nice to meet"],
        "food": ["eat", "food", "restaurant", "hungry", "delicious", "coffee", "tea", "breakfast", "lunch", "dinner"],
        "travel": ["travel", "airport", "hotel", "flight", "train", "bus", "taxi", "trip", "vacation"],
        "shopping": ["buy", "shop", "price", "expensive", "cheap", "money", "pay", "store"],
        "work": ["work", "job", "office", "meeting", "boss", "colleague", "business"],
        "daily": ["home", "family", "friend", "sleep", "wake", "morning", "night", "today", "tomorrow"],
        "question": ["what", "where", "when", "why", "how", "who", "which"],
        "request": ["please", "could you", "would you", "can you", "may i"],
    }

    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in sentence_lower:
                return category

    return "general"


def filter_useful_sentences(sentences: List[Dict], max_per_category: int = 500) -> List[Dict]:
    """유용한 학습용 문장 필터링"""
    filtered = []
    category_counts = {}

    for sent in sentences:
        english = sent.get("english", "")
        korean = sent.get("korean", "")

        # 필터링 조건
        if not english or not korean:
            continue
        if len(english) < 5 or len(english) > 200:
            continue
        if len(korean) < 2 or len(korean) > 200:
            continue

        # 카테고리 분류
        category = categorize_sentence(english)

        # 카테고리별 제한
        if category_counts.get(category, 0) >= max_per_category:
            continue

        category_counts[category] = category_counts.get(category, 0) + 1

        filtered.append({
            "english": english,
            "korean": korean,
            "category": category,
            "word_count": len(english.split()),
            "source": "tatoeba"
        })

    return filtered


def extract_vocabulary(sentences: List[Dict]) -> List[Dict]:
    """문장에서 핵심 단어 추출"""
    from collections import Counter

    # 불용어
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "dare",
        "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
        "into", "through", "during", "before", "after", "above", "below",
        "between", "under", "again", "further", "then", "once", "here",
        "there", "when", "where", "why", "how", "all", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not",
        "only", "own", "same", "so", "than", "too", "very", "just",
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
        "us", "them", "my", "your", "his", "its", "our", "their",
        "this", "that", "these", "those", "and", "but", "or", "if",
    }

    word_counter = Counter()
    word_examples = {}

    for sent in sentences:
        english = sent.get("english", "")
        words = english.lower().split()

        for word in words:
            # 알파벳만 추출
            clean_word = "".join(c for c in word if c.isalpha())
            if clean_word and len(clean_word) > 2 and clean_word not in stopwords:
                word_counter[clean_word] += 1
                if clean_word not in word_examples:
                    word_examples[clean_word] = {
                        "english": english,
                        "korean": sent.get("korean", "")
                    }

    # 상위 1000개 단어
    vocabulary = []
    for word, count in word_counter.most_common(1000):
        if count >= 3:  # 최소 3번 이상 등장
            vocabulary.append({
                "word": word,
                "frequency": count,
                "example_en": word_examples[word]["english"],
                "example_ko": word_examples[word]["korean"],
            })

    return vocabulary


def create_difficulty_levels(sentences: List[Dict]) -> Dict[str, List[Dict]]:
    """문장을 난이도별로 분류"""
    levels = {
        "beginner": [],
        "intermediate": [],
        "advanced": []
    }

    for sent in sentences:
        word_count = sent.get("word_count", 0)
        english = sent.get("english", "")

        # 난이도 판정 기준
        # - 단어 수
        # - 복잡한 문법 패턴
        complex_patterns = ["although", "however", "nevertheless", "furthermore",
                           "whereas", "consequently", "therefore", "moreover"]

        has_complex = any(p in english.lower() for p in complex_patterns)

        if word_count <= 6 and not has_complex:
            levels["beginner"].append(sent)
        elif word_count <= 12 or (word_count <= 15 and not has_complex):
            levels["intermediate"].append(sent)
        else:
            levels["advanced"].append(sent)

    return levels


def main():
    print("=" * 60)
    print("Tatoeba 영어-한국어 데이터 수집")
    print("=" * 60)

    # 데이터 로드
    sentences = download_from_huggingface()

    if not sentences:
        print("\nCreating sample data instead...")
        # 샘플 데이터 생성
        sentences = [
            {"english": "Hello, how are you?", "korean": "안녕하세요, 어떻게 지내세요?"},
            {"english": "I'd like a cup of coffee, please.", "korean": "커피 한 잔 주세요."},
            {"english": "Where is the nearest subway station?", "korean": "가장 가까운 지하철역이 어디인가요?"},
            {"english": "Could you help me with this?", "korean": "이것 좀 도와주시겠어요?"},
            {"english": "I'm looking for a hotel.", "korean": "호텔을 찾고 있어요."},
            {"english": "How much does this cost?", "korean": "이거 얼마예요?"},
            {"english": "Nice to meet you.", "korean": "만나서 반가워요."},
            {"english": "I don't understand.", "korean": "이해가 안 돼요."},
            {"english": "Could you speak more slowly?", "korean": "좀 더 천천히 말씀해 주시겠어요?"},
            {"english": "Thank you very much.", "korean": "정말 감사합니다."},
        ]

    print(f"\nTotal sentences loaded: {len(sentences)}")

    # 필터링
    filtered = filter_useful_sentences(sentences)
    print(f"After filtering: {len(filtered)}")

    # 난이도별 분류
    by_level = create_difficulty_levels(filtered)
    print(f"\nBy difficulty level:")
    for level, sents in by_level.items():
        print(f"  {level}: {len(sents)}")

    # 단어 추출
    vocabulary = extract_vocabulary(filtered)
    print(f"\nExtracted vocabulary: {len(vocabulary)} words")

    # 카테고리별 통계
    category_stats = {}
    for sent in filtered:
        cat = sent.get("category", "general")
        category_stats[cat] = category_stats.get(cat, 0) + 1

    print(f"\nBy category:")
    for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    # 결과 저장
    print("\n" + "=" * 60)
    print("Saving results...")

    # 전체 문장
    with open(OUTPUT_DIR / "sentences.json", "w", encoding="utf-8") as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    print(f"  sentences.json: {len(filtered)} sentences")

    # 난이도별 문장
    with open(OUTPUT_DIR / "sentences_by_level.json", "w", encoding="utf-8") as f:
        json.dump(by_level, f, ensure_ascii=False, indent=2)
    print(f"  sentences_by_level.json")

    # 단어장
    with open(OUTPUT_DIR / "vocabulary.json", "w", encoding="utf-8") as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)
    print(f"  vocabulary.json: {len(vocabulary)} words")

    print("\n" + "=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print("Done!")


if __name__ == "__main__":
    main()
