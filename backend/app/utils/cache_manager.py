from functools import wraps
from typing import Any, Callable
import time

def cache(ttl: int = 3600):
    def decorator(func: Callable) -> Callable:
        cache_data = {}
        
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            cache_key = str(args) + str(kwargs)
            current_time = time.time()
            
            if cache_key in cache_data:
                result, timestamp = cache_data[cache_key]
                if current_time - timestamp < ttl:
                    return result
            
            result = await func(*args, **kwargs)
            cache_data[cache_key] = (result, current_time)
            return result
            
        return wrapper
    return decorator 