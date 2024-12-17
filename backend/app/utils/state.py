import json
import base64
from typing import Dict, Any
from base64 import b64encode, b64decode
import secrets

def encode_state(data: Dict[str, Any]) -> str:
    """
    상태 데이터를 안전한 문자열로 인코딩
    """
    json_str = json.dumps(data)
    return base64.urlsafe_b64encode(json_str.encode()).decode()

def decode_state(state: str) -> Dict[str, Any]:
    """
    인코딩된 상태 문자열을 원래 데이터로 디코딩
    """
    try:
        json_str = base64.urlsafe_b64decode(state.encode()).decode()
        return json.loads(json_str)
    except Exception:
        return {}

def generate_state_token():
    return secrets.token_urlsafe(32)

def encode_state(state_data: dict):
    return b64encode(json.dumps(state_data).encode()).decode()

def decode_state(state: str):
    return json.loads(b64decode(state).decode())

def build_auth_url(base_url: str, params: dict):
    from urllib.parse import urlencode
    return f"{base_url}?{urlencode(params)}"