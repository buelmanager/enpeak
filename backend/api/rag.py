"""
RAG 검색 API
- 단어, 표현, 문법 패턴 등 영어 학습 콘텐츠 검색
- ChromaDB 벡터 DB 활용
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path

router = APIRouter()

# ChromaDB 설정
VECTORDB_DIR = Path(__file__).parent.parent.parent / "vectordb"

# 전역 클라이언트 (lazy loading)
_client = None
_collection = None


def get_collection():
    """ChromaDB 컬렉션 가져오기 (lazy loading)"""
    global _client, _collection

    if _collection is None:
        try:
            _client = chromadb.PersistentClient(path=str(VECTORDB_DIR))
            embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="paraphrase-multilingual-MiniLM-L12-v2"
            )
            _collection = _client.get_collection(
                name="enpeak_rag",
                embedding_function=embedding_fn
            )
        except Exception as e:
            print(f"ChromaDB 연결 실패: {e}")
            return None

    return _collection


class SearchRequest(BaseModel):
    query: str
    n_results: int = 10
    filter_type: Optional[str] = None  # vocabulary, expression, idiom, etc.
    filter_level: Optional[str] = None  # A1, A2, B1, B2, C1, C2
    filter_category: Optional[str] = None  # cafe, business, travel, etc.


class SearchResult(BaseModel):
    id: str
    text: str
    type: str
    level: str
    category: str
    metadata: Dict[str, Any]
    score: Optional[float] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]


@router.post("/search", response_model=SearchResponse)
async def search_rag(request: SearchRequest):
    """
    RAG 검색 API
    - query: 검색어 (영어/한국어)
    - n_results: 결과 개수 (기본 10)
    - filter_type: 타입 필터 (vocabulary, expression, idiom 등)
    - filter_level: 레벨 필터 (A1-C2)
    - filter_category: 카테고리 필터 (cafe, business 등)
    """
    collection = get_collection()
    if collection is None:
        raise HTTPException(status_code=503, detail="RAG 서비스를 사용할 수 없습니다.")

    # where 필터 구성
    where_filter = None
    conditions = []

    if request.filter_type:
        conditions.append({"type": request.filter_type})
    if request.filter_level:
        conditions.append({"level": request.filter_level})
    if request.filter_category:
        conditions.append({"category": request.filter_category})

    if len(conditions) == 1:
        where_filter = conditions[0]
    elif len(conditions) > 1:
        where_filter = {"$and": conditions}

    try:
        # ChromaDB 검색
        results = collection.query(
            query_texts=[request.query],
            n_results=request.n_results,
            where=where_filter
        )

        # 결과 변환
        search_results = []
        if results['ids'] and results['ids'][0]:
            for i, id in enumerate(results['ids'][0]):
                doc = results['documents'][0][i] if results['documents'] else ""
                meta = results['metadatas'][0][i] if results['metadatas'] else {}
                distance = results['distances'][0][i] if results.get('distances') else None

                search_results.append(SearchResult(
                    id=id,
                    text=doc,
                    type=meta.get("type", "unknown"),
                    level=meta.get("level", "unknown"),
                    category=meta.get("category", "unknown"),
                    metadata=meta,
                    score=1 - distance if distance else None  # 거리를 유사도로 변환
                ))

        return SearchResponse(
            query=request.query,
            total=len(search_results),
            results=search_results
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 오류: {str(e)}")


@router.get("/search")
async def search_rag_get(
    q: str = Query(..., description="검색어"),
    n: int = Query(10, description="결과 개수"),
    type: Optional[str] = Query(None, description="타입 필터"),
    level: Optional[str] = Query(None, description="레벨 필터"),
    category: Optional[str] = Query(None, description="카테고리 필터")
):
    """GET 방식 RAG 검색"""
    request = SearchRequest(
        query=q,
        n_results=n,
        filter_type=type,
        filter_level=level,
        filter_category=category
    )
    return await search_rag(request)


@router.get("/related/{word}")
async def get_related_content(
    word: str,
    n_results: int = Query(20, description="결과 개수")
):
    """
    단어 관련 콘텐츠 검색
    - 해당 단어와 관련된 숙어, 표현, 예문 등을 검색
    """
    collection = get_collection()
    if collection is None:
        raise HTTPException(status_code=503, detail="RAG 서비스를 사용할 수 없습니다.")

    try:
        # 단어로 검색
        results = collection.query(
            query_texts=[word],
            n_results=n_results
        )

        # 타입별 분류
        categorized = {
            "vocabulary": [],
            "expression": [],
            "idiom": [],
            "grammar_pattern": [],
            "dialogue": [],
            "other": []
        }

        if results['ids'] and results['ids'][0]:
            for i, id in enumerate(results['ids'][0]):
                doc = results['documents'][0][i] if results['documents'] else ""
                meta = results['metadatas'][0][i] if results['metadatas'] else {}

                item = {
                    "id": id,
                    "text": doc,
                    "level": meta.get("level", "unknown"),
                    "category": meta.get("category", "unknown"),
                    **meta
                }

                item_type = meta.get("type", "other")
                if item_type in categorized:
                    categorized[item_type].append(item)
                else:
                    categorized["other"].append(item)

        return {
            "word": word,
            "related": categorized,
            "total": sum(len(v) for v in categorized.values())
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 오류: {str(e)}")


@router.get("/daily-expression")
async def get_daily_expression():
    """
    오늘의 표현 API
    - 매일 다른 표현/숙어를 랜덤으로 반환
    """
    import random
    from datetime import date

    collection = get_collection()
    if collection is None:
        raise HTTPException(status_code=503, detail="RAG 서비스를 사용할 수 없습니다.")

    try:
        # 오늘 날짜를 시드로 사용 (하루 동안 같은 표현)
        today_seed = date.today().toordinal()
        random.seed(today_seed)

        # idiom 타입에서 우선 검색 (더 좋은 표현 데이터)
        results = collection.get(
            where={"type": "idiom"},
            limit=200
        )

        if not results['ids']:
            # 폴백: expression 타입
            results = collection.get(
                where={"type": "expression"},
                limit=200
            )

        if not results['ids']:
            raise HTTPException(status_code=404, detail="표현 데이터를 찾을 수 없습니다.")

        # 랜덤 선택
        idx = random.randint(0, len(results['ids']) - 1)
        doc = results['documents'][idx] if results['documents'] else ""
        meta = results['metadatas'][idx] if results['metadatas'] else {}

        # 텍스트 파싱 (형식: "Expression: 뜻" 또는 "Expression - 뜻")
        expression = ""
        meaning = ""

        if ": " in doc:
            parts = doc.split(": ", 1)
            expression = parts[0].strip()
            meaning = parts[1].strip() if len(parts) > 1 else ""
        elif " - " in doc:
            parts = doc.split(" - ", 1)
            expression = parts[0].strip()
            meaning = parts[1].strip() if len(parts) > 1 else ""
        else:
            expression = doc.strip()
            meaning = meta.get("meaning_ko", "")

        # 메타데이터에서 추가 정보
        if not meaning:
            meaning = meta.get("meaning_ko") or meta.get("meaning") or ""

        # 예문 생성 (간단한 예문)
        example = meta.get("example") or meta.get("example_en") or f"Let me show you how to use '{expression}'."
        example_ko = meta.get("example_ko") or meta.get("translation") or ""

        return {
            "expression": expression,
            "meaning": meaning,
            "example": example,
            "example_ko": example_ko,
            "category": meta.get("category") or "daily",
            "level": meta.get("level") or "B1"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"오류: {str(e)}")


@router.get("/stats")
async def get_rag_stats():
    """RAG 데이터 통계"""
    collection = get_collection()
    if collection is None:
        raise HTTPException(status_code=503, detail="RAG 서비스를 사용할 수 없습니다.")

    try:
        total = collection.count()

        # 샘플 데이터로 타입/레벨 통계 추정
        sample = collection.get(limit=min(1000, total))

        type_counts = {}
        level_counts = {}
        category_counts = {}

        if sample['metadatas']:
            for meta in sample['metadatas']:
                t = meta.get("type", "unknown")
                type_counts[t] = type_counts.get(t, 0) + 1

                l = meta.get("level", "unknown")
                level_counts[l] = level_counts.get(l, 0) + 1

                c = meta.get("category", "unknown")
                category_counts[c] = category_counts.get(c, 0) + 1

        return {
            "total_documents": total,
            "types": dict(sorted(type_counts.items(), key=lambda x: -x[1])),
            "levels": dict(sorted(level_counts.items())),
            "categories": dict(sorted(category_counts.items(), key=lambda x: -x[1])[:20])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 오류: {str(e)}")
