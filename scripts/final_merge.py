#!/usr/bin/env python3
"""최종 RAG 데이터 통합"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
RAG_DIR = DATA_DIR / "rag_chunks"

def load_json(path):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def main():
    all_chunks = []

    # 기존 청크
    existing = load_json(RAG_DIR / "all_chunks.json")
    all_chunks.extend(existing)

    # 표현 청크
    expressions = load_json(RAG_DIR / "expressions_chunks.json")
    all_chunks.extend(expressions)

    # 패턴 청크
    patterns = load_json(RAG_DIR / "patterns_chunks.json")
    all_chunks.extend(patterns)

    # 추가 숙어 청크
    more_idioms = load_json(RAG_DIR / "more_idioms_chunks.json")
    all_chunks.extend(more_idioms)

    # 저장
    output = RAG_DIR / "all_chunks.json"
    with open(output, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"최종 청크 수: {len(all_chunks)}")

    # 통계
    types = {}
    for c in all_chunks:
        t = c.get("type", "unknown")
        types[t] = types.get(t, 0) + 1

    print("\n타입별:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

if __name__ == "__main__":
    main()
