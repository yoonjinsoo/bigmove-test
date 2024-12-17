from typing import Dict, Any
from urllib.parse import urlencode

KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"

def build_auth_url(base_url: str, params: Dict[str, Any]) -> str:
    """인증 URL 생성"""
    return f"{base_url}?{urlencode(params)}"

def build_kakao_auth_params(
    client_id: str,
    redirect_uri: str,
    state: str,
    scope: str = "profile_nickname profile_image account_email"
) -> Dict[str, Any]:
    """카카오 OAuth 인증 파라미터 생성"""
    return {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
        "state": state
    }

def get_kakao_auth_url(client_id: str, redirect_uri: str, state: str) -> str:
    """카카오 OAuth URL 생성"""
    params = build_kakao_auth_params(client_id, redirect_uri, state)
    return build_auth_url(KAKAO_AUTH_URL, params)
