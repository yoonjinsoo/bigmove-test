from typing import Dict, Optional, TypedDict
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

class GoogleOAuthConfig(TypedDict):
    """Google OAuth 설정"""
    client_id: str
    client_secret: str
    token_url: str  # 'https://oauth2.googleapis.com/token'
    userinfo_url: str  # 'https://www.googleapis.com/oauth2/v2/userinfo'
    redirect_uri: str

class GoogleUserInfo(TypedDict):
    """Google API가 반환하는 사용자 정보"""
    id: str
    email: str
    name: Optional[str]
    picture: Optional[str]

    def get_provider_id(self) -> str:
        return f"G{self.id}"

class GoogleTokenResponse(TypedDict):
    """Google OAuth 토큰 응답"""
    access_token: str
    token_type: str
    expires_in: int
    id_token: Optional[str]
    scope: Optional[str]

class GoogleAuthResponse(TypedDict):
    """구글 인증 완료 후 우리 서비스의 응답"""
    id: str
    email: str
    name: Optional[str]
    picture: Optional[str]

class GoogleLoginInitResponse(TypedDict):
    """구글 로그인 초기화 응답"""
    url: str
    auth_token: str
    state: str
