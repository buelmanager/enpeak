"""
Firebase Admin SDK - Firestore 연동
커뮤니티 시나리오 영구 저장용
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

# Firebase 초기화 상태
_firestore_client = None
_initialized = False


def init_firebase() -> bool:
    """Firebase Admin SDK 초기화"""
    global _firestore_client, _initialized

    if _initialized:
        return _firestore_client is not None

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        # 환경변수에서 서비스 계정 정보 가져오기
        firebase_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT")

        if firebase_creds:
            # JSON 문자열로 전달된 경우
            try:
                cred_dict = json.loads(firebase_creds)
                cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError:
                # 파일 경로로 전달된 경우
                cred = credentials.Certificate(firebase_creds)

            firebase_admin.initialize_app(cred)
            _firestore_client = firestore.client()
            _initialized = True
            logger.info("Firebase initialized successfully")
            return True
        else:
            logger.warning("FIREBASE_SERVICE_ACCOUNT not set, using in-memory storage")
            _initialized = True
            return False

    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        _initialized = True
        return False


def get_firestore():
    """Firestore 클라이언트 반환"""
    global _firestore_client
    if not _initialized:
        init_firebase()
    return _firestore_client


class CommunityStore:
    """커뮤니티 시나리오 저장소 (Firestore + 인메모리 폴백)"""

    COLLECTION_NAME = "community_scenarios"

    def __init__(self):
        self._memory_store: Dict[str, Any] = {}
        self._stats_store: Dict[str, Dict[str, int]] = {}
        self._use_firestore = False

    def initialize(self):
        """저장소 초기화"""
        self._use_firestore = init_firebase() and get_firestore() is not None
        if self._use_firestore:
            logger.info("Using Firestore for community scenarios")
        else:
            logger.info("Using in-memory storage for community scenarios")

    async def save_scenario(self, scenario_id: str, scenario: Dict[str, Any]) -> bool:
        """시나리오 저장"""
        try:
            if self._use_firestore:
                db = get_firestore()
                doc_ref = db.collection(self.COLLECTION_NAME).document(scenario_id)
                doc_ref.set(scenario)
                logger.info(f"Saved scenario to Firestore: {scenario_id}")
            else:
                self._memory_store[scenario_id] = scenario
                self._stats_store[scenario_id] = {
                    "likes": scenario.get("likes", 0),
                    "plays": scenario.get("plays", 0)
                }
            return True
        except Exception as e:
            logger.error(f"Failed to save scenario: {e}")
            # 폴백: 인메모리 저장
            self._memory_store[scenario_id] = scenario
            return False

    async def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        """시나리오 조회"""
        try:
            if self._use_firestore:
                db = get_firestore()
                doc_ref = db.collection(self.COLLECTION_NAME).document(scenario_id)
                doc = doc_ref.get()
                if doc.exists:
                    return doc.to_dict()
                return None
            else:
                return self._memory_store.get(scenario_id)
        except Exception as e:
            logger.error(f"Failed to get scenario: {e}")
            return self._memory_store.get(scenario_id)

    async def get_all_scenarios(self, sort: str = "popular", limit: int = 20) -> List[Dict[str, Any]]:
        """모든 시나리오 조회"""
        try:
            if self._use_firestore:
                db = get_firestore()
                collection_ref = db.collection(self.COLLECTION_NAME)

                # 정렬 기준
                if sort == "popular":
                    query = collection_ref.order_by("plays", direction="DESCENDING").limit(limit)
                elif sort == "recent":
                    query = collection_ref.order_by("createdAt", direction="DESCENDING").limit(limit)
                elif sort == "beginner":
                    query = collection_ref.where("difficulty", "==", "beginner").limit(limit)
                else:
                    query = collection_ref.limit(limit)

                docs = query.stream()
                scenarios = [doc.to_dict() for doc in docs]
                return scenarios
            else:
                scenarios = list(self._memory_store.values())

                if sort == "popular":
                    scenarios.sort(key=lambda x: x.get('likes', 0) + x.get('plays', 0), reverse=True)
                elif sort == "recent":
                    scenarios.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
                elif sort == "beginner":
                    scenarios = [s for s in scenarios if s.get('difficulty') == 'beginner']

                return scenarios[:limit]
        except Exception as e:
            logger.error(f"Failed to get scenarios: {e}")
            return list(self._memory_store.values())[:limit]

    async def update_stats(self, scenario_id: str, field: str, increment: int = 1) -> bool:
        """통계 업데이트 (likes, plays)"""
        try:
            if self._use_firestore:
                from firebase_admin import firestore
                db = get_firestore()
                doc_ref = db.collection(self.COLLECTION_NAME).document(scenario_id)
                doc_ref.update({field: firestore.Increment(increment)})
            else:
                if scenario_id in self._memory_store:
                    current = self._memory_store[scenario_id].get(field, 0)
                    self._memory_store[scenario_id][field] = current + increment
            return True
        except Exception as e:
            logger.error(f"Failed to update stats: {e}")
            return False

    async def delete_scenario(self, scenario_id: str) -> bool:
        """시나리오 삭제"""
        try:
            if self._use_firestore:
                db = get_firestore()
                db.collection(self.COLLECTION_NAME).document(scenario_id).delete()
            else:
                if scenario_id in self._memory_store:
                    del self._memory_store[scenario_id]
            return True
        except Exception as e:
            logger.error(f"Failed to delete scenario: {e}")
            return False

    def scenario_exists(self, scenario_id: str) -> bool:
        """시나리오 존재 여부 확인 (동기)"""
        if self._use_firestore:
            try:
                db = get_firestore()
                doc = db.collection(self.COLLECTION_NAME).document(scenario_id).get()
                return doc.exists
            except:
                return scenario_id in self._memory_store
        return scenario_id in self._memory_store


# 싱글톤 인스턴스
community_store = CommunityStore()
