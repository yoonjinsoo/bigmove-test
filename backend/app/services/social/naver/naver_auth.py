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
            logger.info(f"=== Naver OAuth 초기화 ===")
            logger.info(f"Client ID: {self.client_id}")
            logger.info(f"Redirect URI from settings: {self.redirect_uri}")
            logger.info(f"Received redirect_uri: {redirect_uri}")
            logger.info(f"Source: {source}")
            
            state_data = {
                'token': generate_state_token(),
                'source': source
            }
            state = encode_state(state_data)
            
            auth_params = {
                'response_type': 'code',
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,  # settings에서 가져온 URI 사용
                'state': state,
                'scope': 'email profile'
            }
            
            auth_url = build_auth_url(
                "https://nid.naver.com/oauth2.0/authorize",
                auth_params
            )
            
            logger.info(f"Generated auth URL: {auth_url}")
            logger.info("=== Naver OAuth 초기화 완료 ===")
            
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
            # 1. state 디코딩 로직 수정
            state_data = decode_state(state)
            source = state_data.get('source', 'login')  # 기본값 'login' 설정

            # 2. 디버깅용 로그 추가
            logger.info(f"네이버 콜백 - state_data: {state_data}, source: {source}")
            
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
            token_url = "https://nid.naver.com/oauth2.0/token"
            token_data = {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "state": self.state
            }
            
            # SSL 검증 옵션 수정
            async with httpx.AsyncClient(
                verify=True,  # SSL 인증서 검증 활성화
                timeout=30.0  # 타임아웃 증가
            ) as client:
                try:
                    # 네이버 토큰 요청
                    token_response = await client.post(token_url, data=token_data)
                    token_response.raise_for_status()
                    
                    logger.info(f"네이버 토큰 응답: {token_response.text}")
                    
                    access_token = token_response.json().get("access_token")
                    if not access_token:
                        raise ValueError("액세스 토큰을 받지 못했습니다")
                    
                    # 사용자 정보 요청
                    user_info_response = await client.get(
                        "https://openapi.naver.com/v1/nid/me",
                        headers={"Authorization": f"Bearer {access_token}"}
                    )
                    user_info_response.raise_for_status()
                    
                    return user_info_response.json().get("response", {})
                    
                except httpx.TimeoutException:
                    logger.error("네이버 API 요청 타임아웃")
                    raise
                except httpx.HTTPError as e:
                    logger.error(f"네이버 API 요청 실패: {str(e)}")
                    raise
        except Exception as e:
            logger.error(f"네이버 사용자 정보 조회 실패: {str(e)}")
            raise
