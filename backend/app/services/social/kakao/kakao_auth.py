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

            user_info = await self._get_user_info(code)
            logger.info("=== 카카오 인증 결과 ===")
            logger.info(f"이메일: {user_info.get('email')}")
            logger.info(f"회원구분: {'신규회원' if not db.query(User).filter(User.email == user_info.get('email'), User.provider == 'kakao').first() else '기존회원'}")
            
            existing_user = db.query(User).filter(
                User.email == user_info.get("email"),
                User.provider == "kakao"
            ).first()

            # 회원가입 요청인 경우
            if source == 'signup':
                response_data = {
                    "temp_user_info": {
                        "email": user_info.get("email"),
                        "name": user_info.get("name", ""),
                        "provider": "kakao",
                        "id": None
                    },
                    "is_new_user": not existing_user
                }
                logger.info(f"=== 회원가입 응답 데이터 ===")
                logger.info(f"existing_user 존재여부: {existing_user is not None}")
                logger.info(f"is_new_user 값: {not existing_user}")
                logger.info(f"최종 응답: {response_data}")
                
                return response_data
            
            # 로그인 요청인 경우
            else:
                if not existing_user:
                    # 로그인 시도시 미가입 사용자인 경우 회원가입 응답 반환
                    return {
                        "temp_user_info": {
                            "email": user_info.get("email"),
                            "name": user_info.get("name", ""),
                            "provider": "kakao",
                            "id": None
                        },
                        "is_new_user": True
                    }
                
                # 기존 사용자 로그인 처리
                access_token = create_access_token(
                    data={"sub": existing_user.email}
                )

                # 카카오에서 받아온 최신 닉네임으로 업데이트
                if user_info.get("name") and not existing_user.name:
                    existing_user.name = user_info["name"]
                    db.commit()
                
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user_info": {
                        "email": existing_user.email,
                        "name": existing_user.name or user_info.get("name", ""),  # DB에 없으면 카카오 닉네임 사용
                        "provider": "kakao",
                        "id": str(existing_user.id)
                    }
                }

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
