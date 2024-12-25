from fastapi import APIRouter, HTTPException
import httpx
from typing import Optional
from ..config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/api/directions")
async def get_directions(
    origin: str,
    destination: str
):
    try:
        print(f"Using API Key: KakaoAK {settings.KAKAO_REST_API_KEY}")
        print(f"Request URL: https://apis-navi.kakaomobility.com/v1/directions")
        print(f"Params: origin={origin}, destination={destination}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://apis-navi.kakaomobility.com/v1/directions",
                params={
                    "origin": origin,
                    "destination": destination,
                    "priority": "RECOMMEND"
                },
                headers={
                    "Authorization": f"KakaoAK {settings.KAKAO_REST_API_KEY}"
                }
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail="도로 거리 계산 중 오류가 발생했습니다."
        ) 