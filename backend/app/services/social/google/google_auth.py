from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
import logging
from datetime import timedelta
import httpx
from fastapi import HTTPException
import secrets
from urllib.parse import urlencode
from ....utils.auth import create_access_token
from ....models import User
from ....database import get_db
from ....core.config import settings, Settings
from ....utils.state import encode_state, decode_state

logger = logging.getLogger(__name__)

class TokenError(Exception):
    pass

class UserInfoError(Exception):
    pass

def generate_state_token():
    return secrets.token_urlsafe(32)

def build_auth_url(base_url: str, params: dict):
    return f"{base_url}?{urlencode(params)}"

class GoogleAuthService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.provider_name = "google"
        self.jwt_secret_key = settings.JWT_SECRET_KEY

    async def initialize_oauth(self, redirect_uri: str, source: str):
        try:
            logger.info(f"=== Google OAuth 초기화 ===")
            logger.info(f"Client ID: {self.client_id}")
            logger.info(f"Redirect URI from settings: {self.redirect_uri}")
            logger.info(f"Source: {source}")
            # state에 source 정보 포함
            state_data = {
                'token': generate_state_token(),
                'source': source
            }
            state = encode_state(state_data)  # state 인코딩
            
            auth_params = {
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'response_type': 'code',
                'scope': 'email profile',
                'state': state
            }
            
            auth_url = build_auth_url(
                "https://accounts.google.com/o/oauth2/v2/auth",
                auth_params
            )
            
            return {
                "url": auth_url,
                "state": state,
                "provider": "google"
            }
            
        except Exception as e:
            logger.error(f"OAuth 초기화 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def handle_callback(self, code: str, state: str, request: Request, db: Session):
        try:
            # state 디코딩하여 source 정보 추출
            state_data = decode_state(state)
            source = state_data.get('source')

            # 토큰 및 사용자 정보 받아오기
            user_info = await self._get_user_info(code)
            
            # DB에서 사용자 존재 여부 확인
            existing_user = db.query(User).filter(
                User.email == user_info.get("email"),
                User.provider == "google"
            ).first()

            # 회원가입 요청인 경우
            if source == 'signup':
                return {
                    "temp_user_info": {
                        "email": user_info.get("email"),
                        "name": user_info.get("name", ""),
                        "provider": "google",
                        "id": None  # 신규 사용자이므로 아직 ID 없음
                    },
                    "is_new_user": not existing_user
                }
            
            # 로그인 요청인 경우
            else:
                if not existing_user:
                    # 로그인 시도시 미가입 사용자인 경우 회원가입 응답 반환
                    return {
                        "temp_user_info": {
                            "email": user_info.get("email"),
                            "name": user_info.get("name", ""),
                            "provider": "google",
                            "id": None
                        },
                        "is_new_user": True
                    }
                
                # 기존 사용자 로그인 처리
                access_token = create_access_token(
                    data={"sub": existing_user.email}
                )
                
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user_info": {
                        "email": existing_user.email,
                        "name": existing_user.name or "",
                        "provider": "google",
                        "id": str(existing_user.id)
                    }
                }

        except Exception as e:
            logger.error(f"Google callback handling error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Google 로그인 처리 중 오류: {str(e)}")

    async def _get_user_info(self, code: str):
        try:
            # 1. 액세스 토큰 받기
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.redirect_uri
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                # 2. 사용자 정보 가져오기
                user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
                headers = {"Authorization": f"Bearer {token_info['access_token']}"}
                user_response = await client.get(user_info_url, headers=headers)
                user_response.raise_for_status()
                return user_response.json()
                
        except httpx.HTTPError as e:
            logger.error(f"Google API 요청 중 오류: {str(e)}")
            raise TokenError(f"토큰 또는 사용자 정보 요청 실패: {str(e)}")
