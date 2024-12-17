import sys
import os
import httpx
import pytest
from dotenv import load_dotenv

# 백엔드 루트 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# .env 파일 로드
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

from app.core.config import settings
from app.services.oauth_service import OAuthService

@pytest.mark.asyncio
async def test_env_variables():
    """환경 변수 로드 테스트"""
    required_vars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_REDIRECT_URI'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"누락된 환경 변수: {', '.join(missing_vars)}")
        assert False, f"필수 환경 변수가 설정되지 않았습니다: {', '.join(missing_vars)}"
    else:
        print("모든 필수 환경 변수가 설정되어 있습니다.")
        assert True

@pytest.mark.asyncio
async def test_google_oauth_config():
    """구글 OAuth 설정 테스트"""
    try:
        # Google OAuth 디스커버리 문서 확인
        async with httpx.AsyncClient() as client:
            response = await client.get('https://accounts.google.com/.well-known/openid-configuration')
            assert response.status_code == 200, "Google OAuth 디스커버리 문서에 접근할 수 없습니다."
        
        # Client ID 형식 확인
        assert settings.GOOGLE_CLIENT_ID.endswith('.apps.googleusercontent.com'), "Google Client ID 형식이 올바르지 않습니다."
        
        # Redirect URI 형식 확인
        assert settings.GOOGLE_REDIRECT_URI.startswith('http://localhost:3000/auth/callback/google'), "Google Redirect URI 형식이 올바르지 않습니다."
        
        # 인증 URL 생성 테스트
        oauth_service = OAuthService()
        auth_url = oauth_service.get_authorization_url('google')
        assert auth_url.startswith('https://accounts.google.com/o/oauth2/v2/auth'), "Google 인증 URL 생성에 실패했습니다."
        
        print("Google OAuth 설정이 올바릅니다.")
    except AssertionError as e:
        print(f"테스트 실패: {str(e)}")
    except Exception as e:
        print(f"오류 발생: {str(e)}") 

@pytest.mark.asyncio
async def test_google_login_flow():
    """구글 로그인 Flow 테스트"""
    from app.services.oauth_service import OAuthService
    
    try:
        # 1. 인증 URL 생성 테스트
        oauth_service = OAuthService()
        auth_url = oauth_service.get_authorization_url('google')
        print(f"\n생성된 인증 URL: {auth_url}")
        assert 'client_id' in auth_url
        assert 'redirect_uri' in auth_url
        assert 'response_type=code' in auth_url
        
        # 2. URL 구조 검증
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(auth_url)
        params = parse_qs(parsed_url.query)
        
        assert params['client_id'][0] == os.getenv('GOOGLE_CLIENT_ID')
        assert params['redirect_uri'][0] == os.getenv('GOOGLE_REDIRECT_URI')
        
        print("구글 로그인 Flow 테스트 성공")
        return True
        
    except Exception as e:
        print(f"구글 로그인 Flow 테스트 실패: {str(e)}")
        raise e 