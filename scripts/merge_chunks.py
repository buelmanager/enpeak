#!/usr/bin/env python3
"""
모든 데이터를 RAG 청크로 통합
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
RAG_DIR = DATA_DIR / "rag_chunks"
COLLECTED_DIR = DATA_DIR / "collected"

def load_json(path):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def main():
    all_chunks = []

    # 1. 기존 RAG 청크 로드
    existing = load_json(RAG_DIR / "all_chunks.json")
    all_chunks.extend(existing)
    print(f"기존 청크: {len(existing)}")

    # 2. 확장된 단어 데이터 추가
    expanded_vocab = load_json(COLLECTED_DIR / "vocabulary" / "expanded_vocabulary.json")
    for word in expanded_vocab:
        # 중복 체크
        exists = any(
            c.get("word") == word["word"] and c.get("type") == "vocabulary"
            for c in all_chunks
        )
        if not exists:
            chunk = {
                "id": f"vocab_{word['word']}_{word['level']}",
                "text": f"{word['word']}: {word['meaning_ko']}",
                "word": word["word"],
                "meaning_ko": word["meaning_ko"],
                "type": "vocabulary",
                "level": word["level"],
                "source": "expanded",
                "category": "vocabulary",
                "metadata": {
                    "part_of_speech": word.get("part_of_speech", "unknown")
                }
            }
            all_chunks.append(chunk)

    print(f"확장 단어 추가 후: {len(all_chunks)}")

    # 3. 저장
    output_file = RAG_DIR / "all_chunks.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"\n최종 저장: {output_file}")
    print(f"총 청크 수: {len(all_chunks)}")

    # 통계
    sources = {}
    levels = {}
    types = {}

    for c in all_chunks:
        src = c.get("source", "unknown")
        sources[src] = sources.get(src, 0) + 1

        lvl = c.get("level", "unknown")
        levels[lvl] = levels.get(lvl, 0) + 1

        t = c.get("type", "unknown")
        types[t] = types.get(t, 0) + 1

    print("\n소스별:")
    for k, v in sorted(sources.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

    print("\n레벨별:")
    for k, v in sorted(levels.items()):
        print(f"  {k}: {v}")

    print("\n타입별:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

if __name__ == "__main__":
    main()
