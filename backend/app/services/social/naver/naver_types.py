from typing import Optional, TypedDict
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

class NaverOAuthConfig(TypedDict):
    """Naver OAuth 설정"""
    client_id: str
    client_secret: str
    token_url: str  # 'https://nid.naver.com/oauth2.0/token'
    userinfo_url: str  # 'https://openapi.naver.com/v1/nid/me'
    redirect_uri: str

class NaverUserInfo(TypedDict):
    """Naver API가 반환하는 사용자 정보"""
    id: str
    email: str
    name: Optional[str]
    nickname: Optional[str]
    profile_image: Optional[str]
    age: Optional[str]
    gender: Optional[str]
    birthday: Optional[str]
    mobile: Optional[str]

    def get_provider_id(self) -> str:
        return f"N{self.id}"

class NaverTokenResponse(TypedDict):
    """Naver OAuth 토큰 응답"""
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str]
    error: Optional[str]
    error_description: Optional[str]

class NaverAuthResponse(TypedDict):
    """네이버 인증 완료 후 우리 서비스의 응답"""
    id: str
    email: str
    name: Optional[str]
    nickname: Optional[str]
    profile_image: Optional[str]
