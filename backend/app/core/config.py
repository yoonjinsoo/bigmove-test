from functools import lru_cache
from pydantic_settings import BaseSettings
import os
from pydantic import Field

class Settings(BaseSettings):
    # Mail settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: str
    MAIL_SERVER: str

    # Database
    DATABASE_URL: str

    # Frontend URL
    FRONTEND_URL: str

    # JWT settings
    JWT_SECRET_KEY: str

    # Session settings
    SESSION_SECRET_KEY: str

    # Kakao OAuth
    KAKAO_CLIENT_ID: str
    KAKAO_CLIENT_SECRET: str  # 추가
    KAKAO_REDIRECT_URI: str
    KAKAO_API_KEY: str

    # Naver OAuth
    NAVER_CLIENT_ID: str
    NAVER_CLIENT_SECRET: str
    NAVER_REDIRECT_URI: str

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    # OAuth state 검증을 위한 JWT 설정
    OAUTH_SECRET_KEY: str = os.getenv("OAUTH_SECRET_KEY", "your-secret-key")
    OAUTH_TOKEN_EXPIRE_MINUTES: int = 5

    # JWT 관련 설정 추가
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-oauth-state")
    OAUTH_TOKEN_EXPIRE_MINUTES: int = 5

    # 소셜 로그인 관련 설정들...
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    NAVER_CLIENT_ID: str = os.getenv("NAVER_CLIENT_ID", "")
    NAVER_CLIENT_SECRET: str = os.getenv("NAVER_CLIENT_SECRET", "")
    KAKAO_CLIENT_ID: str = os.getenv("KAKAO_CLIENT_ID", "")
    KAKAO_CLIENT_SECRET: str = os.getenv("KAKAO_CLIENT_SECRET", "")

    # Toss Payments 설정 추가
    TOSS_SECRET_KEY: str = Field(default="")

    model_config = {
        'from_attributes': True,  # 이전의 orm_mode를 대체
        'env_file': '.env',
        'case_sensitive': True
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# 추가: settings 인스턴스 생성
settings = get_settings()
