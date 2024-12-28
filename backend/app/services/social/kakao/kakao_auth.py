from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from datetime import timedelta
import httpx
from ....utils.auth import create_access_token
from ....models import User
from ....database import get_db
from ....core.config import settings, Settings
from ....utils.state import encode_state, decode_state, generate_state_token, build_auth_url

logger = logging.getLogger(__name__)

# Kakao OAuth URLs
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"

class TokenError(Exception):
    pass

class UserInfoError(Exception):
    pass

class KakaoAuthService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client_id = settings.KAKAO_CLIENT_ID
        self.client_secret = settings.KAKAO_CLIENT_SECRET
        self.redirect_uri = settings.KAKAO_REDIRECT_URI
        self.provider_name = "kakao"
        self.jwt_secret_key = settings.JWT_SECRET_KEY

    async def initialize_oauth(self, redirect_uri: str, source: str):
        try:
            logger.info(f"=== Kakao OAuth 초기화 ===")
            logger.info(f"Client ID: {self.client_id}")
            logger.info(f"Redirect URI from settings: {self.redirect_uri}")
            logger.info(f"Source: {source}")
            state_data = {
                'token': generate_state_token(),
                'source': source
            }
            state = encode_state(state_data)
            
            auth_params = {
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'response_type': 'code',
                'state': state,
                'scope': 'account_email profile_nickname'
            }
            
            auth_url = build_auth_url(
                "https://kauth.kakao.com/oauth/authorize",
                auth_params
            )
            
            return {
                "url": auth_url,
                "state": state,
                "provider": "kakao"
            }
            
        except Exception as e:
            logger.error(f"OAuth 초기화 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def handle_callback(self, code: str, state: str, request: Request, db: Session):
        try:
            state_data = decode_state(state)
            source = state_data.get('source')
            
            # 1. 사용자 정보 조회 전
            logger.info("=== 카카오 인증 시작 ===")
            
            # 2. 사용자 정보 조회 후
            user_info = await self._get_user_info(code)
            logger.info("=== 카카오 사용자 정보 ===", extra={
                "email": user_info.get("email"),
                "name": user_info.get("name")
            })
            
            # 3. DB 조회 전
            logger.info("=== DB 조회 시작 ===")
            
            # 4. DB 조회 결과
            existing_user = db.query(User).filter(
                User.email == user_info.get("email"),
                User.provider == "kakao"
            ).first()
            logger.info("=== DB 조회 결과 ===", extra={
                "exists": existing_user is not None,
                "email": user_info.get("email")
            })

            # 5. 최종 응답 로깅
            response_data = {
                "temp_user_info": {
                    "email": user_info.get("email"),
                    "name": user_info.get("name", ""),
                    "provider": "kakao",
                    "id": None
                },
                "is_new_user": not existing_user
            } if source == 'signup' else {
                # 기존 로직 유지
            }
            
            logger.info("=== 최종 응답 데이터 ===", extra={
                "source": source,
                "is_new_user": not existing_user
            })

            return response_data

        except Exception as e:
            logger.error(f"Kakao callback handling error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Kakao 로그인 처리 중 오류: {str(e)}")

    async def _get_user_info(self, code: str):
        try:
            # 1. 액세스 토큰 받기
            token_data = {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(KAKAO_TOKEN_URL, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                # 2. 사용자 정보 가져오기
                headers = {"Authorization": f"Bearer {token_info['access_token']}"}
                user_response = await client.get(KAKAO_USERINFO_URL, headers=headers)
                user_response.raise_for_status()
                
                # 카카오 특화 응답 처리
                user_info = user_response.json()
                if not user_info.get("kakao_account", {}).get("email"):
                    raise UserInfoError("이메일 정보를 찾을 수 없습니다")
                if not user_info.get("properties", {}).get("nickname"):
                    raise UserInfoError("닉네임 정보를 찾을 수 없습니다")
                
                return {
                    "email": user_info["kakao_account"]["email"],
                    "name": user_info["properties"]["nickname"]
                }
                
        except httpx.HTTPError as e:
            logger.error(f"Kakao API 요청 중 오류: {str(e)}")
            raise TokenError(f"토큰 또는 사용자 정보 요청 실패: {str(e)}")
