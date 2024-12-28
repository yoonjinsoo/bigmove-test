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
from .naver_utils import NAVER_TOKEN_URL, NAVER_USERINFO_URL  # 상수 import 추가
from httpx import Client, HTTPError, ConnectError
import ssl
import asyncio

logger = logging.getLogger(__name__)

class TokenError(Exception):
    pass

class UserInfoError(Exception):
    pass

class NaverAuthError(Exception):
    """네이버 인증 관련 커스텀 예외"""
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
        self.client = Client(
            verify=True,  # SSL 인증서 검증 활성화
            timeout=30.0,  # 타임아웃 증가
            http2=False,  # HTTP/2 비활성화
        )
        
        # SSL 컨텍스트 설정
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.set_ciphers('DEFAULT@SECLEVEL=1')  # SSL 보안 레벨 조정

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
            state_data = decode_state(state)
            source = state_data.get('source', 'login')
            
            # SSL 재시도 로직 (네이버 API 간헐적 오류 대응)
            max_retries = 3
            retry_count = 0
            
            while retry_count < max_retries:
                try:
                    user_info = await self._get_user_info(code)
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count == max_retries:
                        logger.error(f"네이버 사용자 정보 조회 실패: {str(e)}")
                        raise HTTPException(status_code=500, detail="네이버 로그인 처리 중 오류가 발생했습니다.")
                    await asyncio.sleep(1)  # 1초 대기 후 재시도
            
            existing_user = db.query(User).filter(
                User.email == user_info.get("email"),
                User.provider == "naver"
            ).first()

            if source == 'signup':
                return {
                    "temp_user_info": {
                        "email": user_info.get("email"),
                        "name": user_info.get("name", ""),
                        "provider": "naver",
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
            logger.error(f"네이버 콜백 처리 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_user_info(self, code: str):
        try:
            token_data = {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(NAVER_TOKEN_URL, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                headers = {"Authorization": f"Bearer {token_info['access_token']}"}
                user_response = await client.get(NAVER_USERINFO_URL, headers=headers)
                user_response.raise_for_status()
                
                user_info = user_response.json().get("response", {})
                if not user_info.get("email"):
                    raise ValueError("이메일 정보를 찾을 수 없습니다")
                    
                return user_info
                
        except httpx.HTTPError as e:
            logger.error(f"네이버 API 요청 중 오류: {str(e)}")
            raise TokenError(f"토큰 또는 사용자 정보 요청 실패: {str(e)}")

    async def get_user_info(self, access_token: str) -> dict:
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # 재시도 로직 추가
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = self.client.get(
                        'https://openapi.naver.com/v1/nid/me',
                        headers=headers,
                        timeout=10.0
                    )
                    response.raise_for_status()
                    return response.json()
                except ConnectError as e:
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(1)  # 재시도 전 대기
                    
        except Exception as e:
            logger.error(f"네이버 사용자 정보 요청 실패: {str(e)}")
            raise NaverAuthError("사용자 정보를 가져오는데 실패했습니다.")
        finally:
            self.client.close()
