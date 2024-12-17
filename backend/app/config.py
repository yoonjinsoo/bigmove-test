from typing import Optional
from pydantic_settings import BaseSettings
from typing import ClassVar
from functools import lru_cache

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/bigmove"
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Mail settings
    MAIL_USERNAME: str = "your-email@example.com"
    MAIL_PASSWORD: str = "your-app-specific-password"
    MAIL_FROM: str = "your-email@example.com"
    MAIL_PORT: str = "587"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    
    # OAuth settings
    GOOGLE_CLIENT_ID: str = "your-google-client-id"
    GOOGLE_CLIENT_SECRET: str = "your-google-client-secret"
    NAVER_CLIENT_ID: str = "your-naver-client-id"
    NAVER_CLIENT_SECRET: str = "your-naver-client-secret"
    KAKAO_CLIENT_ID: str = "your-kakao-client-id"
    KAKAO_CLIENT_SECRET: str = "your-kakao-client-secret"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Kakao API
    KAKAO_API_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings() 

# settings 객체에서 KAKAO_API_KEY 가져오기
KAKAO_API_KEY = settings.KAKAO_API_KEY 

@lru_cache()
def get_settings() -> Settings:
    return Settings() 