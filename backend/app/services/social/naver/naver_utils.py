from typing import Dict, Any
from urllib.parse import urlencode

NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize"
NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token"
NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me"

def build_auth_url(base_url: str, params: Dict[str, Any]) -> str:
    """인증 URL 생성"""
    return f"{base_url}?{urlencode(params)}"

def build_naver_auth_params(
    client_id: str,
    redirect_uri: str,
    state: str,
    response_type: str = "code"
) -> Dict[str, Any]:
    """Naver OAuth 인증 파라미터 생성"""
    return {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": response_type,
        "state": state
    }

def get_naver_auth_url(client_id: str, redirect_uri: str, state: str) -> str:
    """Naver OAuth URL 생성"""
    params = build_naver_auth_params(client_id, redirect_uri, state)
    return build_auth_url(NAVER_AUTH_URL, params)
