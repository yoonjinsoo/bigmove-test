from fastapi import Depends
from redis import Redis
import json
from typing import Optional, Dict
import uuid
from ..core.redis import get_redis

class SessionService:
    def __init__(self, redis: Redis = Depends(get_redis)):
        self.redis = redis
        self.expire_time = 60 * 60 * 24  # 24시간

    async def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.redis.setex(f"session:{session_id}", self.expire_time, "{}")
        return session_id

    async def get_session_data(self, session_id: str) -> Dict:
        data = self.redis.get(f"session:{session_id}")
        if not data:
            return {}
        return json.loads(data)

    async def update_session_data(self, session_id: str, data: Dict):
        self.redis.setex(
            f"session:{session_id}",
            self.expire_time,
            json.dumps(data)
        )

    async def migrate_to_user(self, session_id: str, user_id: int):
        session_data = await self.get_session_data(session_id)
        # 여기서 사용자 DB에 데이터 저장
        self.redis.delete(f"session:{session_id}") 