import aiohttp
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class DistanceService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://apis-navi.kakaomobility.com/v1/directions"
    
    async def calculate_distance(self, start: Dict, end: Dict) -> float:
        """카카오 모빌리티 API를 사용하여 실제 도로 기준 거리 계산"""
        try:
            headers = {"Authorization": f"KakaoAK {self.api_key}"}
            params = {
                "origin": f"{start['x']},{start['y']}",
                "destination": f"{end['x']},{end['y']}"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url,
                    headers=headers,
                    params=params
                ) as response:
                    if response.status != 200:
                        raise ValueError("카카오 API 호출 실패")
                    
                    data = await response.json()
                    # 미터 단위를 킬로미터로 변환
                    return round(data['routes'][0]['summary']['distance'] / 1000, 1)
                    
        except Exception as e:
            logger.error(f"거리 계산 중 오류 발생: {str(e)}")
            raise 