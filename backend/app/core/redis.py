from redis import Redis
from .config import settings

def get_redis() -> Redis:
    return Redis.from_url(
        settings.REDIS_URL,
        db=settings.REDIS_DB,
        decode_responses=True
    ) 