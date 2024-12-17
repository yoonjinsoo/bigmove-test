from typing import Dict, Any
from urllib.parse import urlencode

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

def build_auth_url(base_url: str, params: Dict[str, Any]) -> str:
    """인증 URL 생성"""
    return f"{base_url}?{urlencode(params)}"

def build_google_auth_params(
    client_id: str,
    redirect_uri: str,
    state: str,
    scope: str = "openid email profile"
) -> Dict[str, Any]:
    """Google OAuth 인증 파라미터 생성"""
    return {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
        "state": state,
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "select_account"
    }

def get_google_auth_url(client_id: str, redirect_uri: str, state: str) -> str:
    """Google OAuth URL 생성"""
    params = build_google_auth_params(client_id, redirect_uri, state)
    return build_auth_url(GOOGLE_AUTH_URL, params)
