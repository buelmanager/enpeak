#!/usr/bin/env python3
"""
RAG 데이터를 ChromaDB에 인덱싱
"""
import json
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions

DATA_DIR = Path(__file__).parent.parent / "data"
VECTORDB_DIR = Path(__file__).parent.parent / "vectordb"
RAG_FILE = DATA_DIR / "rag_chunks" / "all_chunks.json"

def main():
    print("=" * 60)
    print("ChromaDB 인덱싱 시작")
    print("=" * 60)

    # 데이터 로드
    with open(RAG_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    print(f"총 {len(chunks)}개 청크 로드")

    # ChromaDB 클라이언트 생성
    VECTORDB_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(VECTORDB_DIR))

    # 임베딩 함수 (sentence-transformers)
    # 다국어 지원을 위해 multilingual 모델 사용
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="paraphrase-multilingual-MiniLM-L12-v2"
    )

    # 기존 컬렉션 삭제 후 새로 생성
    try:
        client.delete_collection("enpeak_rag")
        print("기존 컬렉션 삭제됨")
    except Exception:
        pass

    collection = client.create_collection(
        name="enpeak_rag",
        embedding_function=embedding_fn,
        metadata={"description": "EnPeak English Learning RAG Data"}
    )
    print("새 컬렉션 생성됨: enpeak_rag")

    # 배치로 추가 (ChromaDB 최대 배치 크기 고려)
    batch_size = 500
    total_batches = (len(chunks) + batch_size - 1) // batch_size

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        batch_num = i // batch_size + 1

        ids = []
        documents = []
        metadatas = []

        for j, chunk in enumerate(batch):
            # ID 생성 (고유성 보장을 위해 인덱스 추가)
            base_id = chunk.get("id", f"chunk_{i + j}")
            chunk_id = f"{base_id}_{i + j}"  # 전역 인덱스로 고유성 보장
            ids.append(chunk_id)

            # 문서 텍스트
            text = chunk.get("text", "")
            if not text:
                # 다른 필드에서 텍스트 구성
                if "word" in chunk:
                    text = f"{chunk['word']}: {chunk.get('meaning_ko', '')}"
                elif "english" in chunk:
                    text = f"{chunk['english']} - {chunk.get('korean', '')}"
                elif "idiom" in chunk:
                    text = f"{chunk['idiom']}: {chunk.get('meaning_ko', '')}"
            documents.append(text)

            # 메타데이터
            metadata = {
                "type": chunk.get("type", "unknown"),
                "level": chunk.get("level", "unknown"),
                "category": chunk.get("category", "unknown"),
                "source": chunk.get("source", "unknown"),
            }
            # 추가 필드
            if "word" in chunk:
                metadata["word"] = chunk["word"]
            if "meaning_ko" in chunk:
                metadata["meaning_ko"] = chunk["meaning_ko"]
            if "english" in chunk:
                metadata["english"] = chunk["english"]
            if "korean" in chunk:
                metadata["korean"] = chunk["korean"]

            metadatas.append(metadata)

        # ChromaDB에 추가
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        print(f"배치 {batch_num}/{total_batches} 완료 ({len(batch)}개)")

    # 최종 통계
    print("\n" + "=" * 60)
    print("인덱싱 완료!")
    print("=" * 60)
    print(f"총 문서 수: {collection.count()}")
    print(f"저장 위치: {VECTORDB_DIR}")

    # 테스트 검색
    print("\n테스트 검색:")
    test_queries = [
        "카페에서 주문하기",
        "I want to order coffee",
        "비즈니스 미팅 표현",
    ]

    for query in test_queries:
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        print(f"\n쿼리: '{query}'")
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            print(f"  - [{meta.get('type', '')}] {doc[:60]}...")

if __name__ == "__main__":
    main()
