from typing import Optional, TypedDict, Dict
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

class KakaoOAuthConfig(TypedDict):
    """Kakao OAuth 설정"""
    client_id: str
    client_secret: str
    token_url: str  # 'https://kauth.kakao.com/oauth/token'
    userinfo_url: str  # 'https://kapi.kakao.com/v2/user/me'
    redirect_uri: str

class KakaoUserInfo(TypedDict):
    """Kakao API가 반환하는 사용자 정보"""
    id: str
    email: str
    name: Optional[str]
    nickname: Optional[str]
    thumbnail_image_url: Optional[str]
    profile_image_url: Optional[str]
    is_email_verified: Optional[bool]
    age_range: Optional[str]
    birthday: Optional[str]
    gender: Optional[str]

    def get_provider_id(self) -> str:
        return f"K{self.id}"

class KakaoTokenResponse(TypedDict):
    """Kakao OAuth 토큰 응답"""
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str]
    refresh_token_expires_in: Optional[int]
    scope: Optional[str]

class KakaoAuthResponse(TypedDict):
    """카카오 인증 완료 후 우리 서비스의 응답"""
    id: str
    email: str
    name: Optional[str]
    nickname: Optional[str]
    profile_image: Optional[str]
