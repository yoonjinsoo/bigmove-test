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

class TokenError(Exception):
    pass

class UserInfoError(Exception):
    pass

class NaverAuthService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client_id = settings.NAVER_CLIENT_ID
        self.client_secret = settings.NAVER_CLIENT_SECRET
        self.redirect_uri = settings.NAVER_REDIRECT_URI
        self.provider_name = "naver"
        self.jwt_secret_key = settings.JWT_SECRET_KEY
        self.state = None  # state 속성 추가

    async def initialize_oauth(self, redirect_uri: str, source: str):
        try:
            state_data = {
                'token': generate_state_token(),
                'source': source
            }
            state = encode_state(state_data)
            
            self.state = state  # state 저장
            
            auth_params = {
                'response_type': 'code',
                'client_id': self.client_id,
                'redirect_uri': redirect_uri,
                'state': state,
                'scope': 'email profile'  # 네이버는 email과 profile 정보 요청
            }
            
            auth_url = build_auth_url(
                "https://nid.naver.com/oauth2.0/authorize",
                auth_params
            )
            
            return {
                "url": auth_url,
                "state": state,
                "provider": "naver"
            }
        except Exception as e:
            logger.error(f"OAuth 초기화 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def handle_callback(self, code: str, state: str, request: Request, db: Session):
        try:
            state_data = decode_state(state)
            source = state_data.get('source')

            user_info = await self._get_user_info(code)
            
            existing_user = db.query(User).filter(
                User.email == user_info.get("email"),
                User.provider == "naver"
            ).first()

            # 회원가입 요청인 경우
            if source == 'signup':
                return {
                    "temp_user_info": {
                        "email": user_info.get("email"),
                        "name": user_info.get("name", ""),
                        "provider": "naver",
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
                            "provider": "naver",
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
                        "provider": "naver",
                        "id": str(existing_user.id)
                    }
                }

        except Exception as e:
            logger.error(f"Naver callback handling error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Naver 로그인 처리 중 오류: {str(e)}")

    async def _get_user_info(self, code: str):
        try:
            # 1. 액세스 토큰 받기
            token_url = "https://nid.naver.com/oauth2.0/token"
            token_data = {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri,
                "state": self.state
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                # 2. 사용자 정보 가져오기
                user_info_url = "https://openapi.naver.com/v1/nid/me"
                headers = {"Authorization": f"Bearer {token_info['access_token']}"}
                user_response = await client.get(user_info_url, headers=headers)
                user_response.raise_for_status()
                
                # 네이버 특화 응답 처리
                user_data = user_response.json().get("response", {})
                if not user_data.get("email"):
                    raise UserInfoError("이메일 정보를 찾을 수 없습니다")
                if not user_data.get("name"):
                    raise UserInfoError("이름 정보를 찾을 수 없습니다")
                    
                return user_data
                
        except httpx.HTTPError as e:
            logger.error(f"Naver API 요청 중 오류: {str(e)}")
            raise TokenError(f"토큰 또는 사용자 정보 요청 실패: {str(e)}")
