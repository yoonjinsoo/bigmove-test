from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..models import User, UserAgreements
from ..schemas.auth import UserCreate, UserLogin, SignupRequest
from ..core.config import get_settings
from ..utils.auth import (
    verify_password,
    get_password_hash,
    ALGORITHM,
    create_access_token
)
import logging
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, or_
import httpx
from ..services.coupon_service import CouponService

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()
        # 초기화 시점의 JWT_SECRET_KEY 확인
        logger.debug(f"AuthService initialized - JWT_SECRET_KEY exists: {bool(self.settings.JWT_SECRET_KEY)}")
        logger.debug(f"JWT_SECRET_KEY value: {self.settings.JWT_SECRET_KEY[:5]}...")  # 보안을 위한 앞 5자리만

    def create_access_token(self, data: dict):
        return create_access_token(
            data=data
        )

    async def authenticate_user(self, email: str, password: str):
        user = self.db.query(User).filter(User.email == email).first()
        # 디버깅을 위한 로그 추가
        logger.debug(f"Login attempt - Email: {email}")
        if user:
            logger.debug(f"Found user: {user.email}, {user.hashed_password}")
        
        if not user:
            raise Exception("등록되지 않은 이메일입니다. 회원가입을 해주세요.")
        
        if not verify_password(password, user.hashed_password):
            logger.debug(f"Password verification failed - Input: {password}, Stored hash: {user.hashed_password}")
            raise Exception("비밀번호가 일치하지 않습니다.")
            
        return user

    async def register_user(self, db: Session, user_data: UserCreate) -> dict:
        try:
            # 토큰 생성 전 secret_key 확인
            if not self.settings.JWT_SECRET_KEY:
                raise ValueError("JWT_SECRET_KEY is not configured")
            
            # secret_key 파라미터 없이 호출
            access_token = self.create_access_token(
                data={"sub": user_data.email}
            )
            
            # 이메일 중복 체크
            logger.info(f"이메일 중복 체크 시작: {user_data.email}")
            existing_user = self.db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                logger.info(f"중복된 이메일 발견: {user_data.email}")
                raise HTTPException(
                    status_code=400,
                    detail="이미 가입된 이메일입니다. 로그인을 해주세요."
                )
            
            logger.info(f"새로운 사용자 생성 시작: {user_data.email}")
            # 비밀번호 해시화 - pwd_context 사용
            hashed_password = pwd_context.hash(user_data.password)
            
            # 사용자 생성
            db_user = User(
                email=user_data.email,
                name=user_data.name,
                hashed_password=hashed_password,
                provider="email",
                is_active=True
            )
            
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            logger.info(f"사용자 생성 완료: {user_data.email}, ID: {db_user.id}")
            
            # 웰컴 쿠폰 생성
            coupon_service = CouponService(db)
            await coupon_service.generate_signup_coupon(db_user.id)
            
            # 응답 데이터 구성
            response_data = {
                "user": {
                    "id": db_user.id,
                    "email": db_user.email,
                    "name": db_user.name,
                    "role": "user"
                },
                "access_token": access_token
            }
            
            logger.info(f"회원가입 응답 데이터: {response_data}")
            return response_data
            
        except Exception as e:
            logger.error(f"회원가입 처리 중 예외 발생: {str(e)}")
            self.db.rollback()
            raise

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def process_signup(self, signup_data: UserCreate):
        try:
            # 이메일 중복 체크
            existing_user = self.db.query(User).filter(User.email == signup_data.email).first()
            if existing_user:
                raise Exception("이미 가입된 이메일입니다.")

            # 비밀번호 해시화
            if not signup_data.provider or signup_data.provider == 'email':
                if not signup_data.password:
                    raise Exception("비밀번호가 필요합니다.")
                hashed_password = get_password_hash(signup_data.password)
            else:
                hashed_password = None

            # 새 사용자 생성
            user = User(
                email=signup_data.email,
                name=signup_data.name,
                hashed_password=hashed_password,
                is_active=True,
                provider=signup_data.provider or 'email'  # provider가 없으면 'email'로 설정
            )
            
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

            # 웰컴 쿠폰 생성 (coupon_service 사용)
            coupon_service = CouponService(self.db)
            coupon = await coupon_service.generate_signup_coupon(user.id)

            # 액세스 토큰 생성
            access_token = self.create_access_token(
                data={"sub": user.email}
            )

            return {
                "success": True,
                "message": "회원가입이 완료되었습니다.",
                "access_token": access_token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "name": user.name,
                    "provider": user.provider,
                    "role": user.role
                },
                "coupon": coupon
            }
        except Exception as e:
            self.db.rollback()
            raise

    async def save_signup_info(self, signup_info: dict):
        """회원가입 정보 통합 저장 API 호출"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:8000/api/auth/signup",
                    json=signup_info
                )
                if response.status_code != 200:
                    logger.error(f"회원가입 정보 저장 실패: {response.text}")
                    raise Exception("이미 가입된 이메일입니다. 로그인을 해주세요.")
        except Exception as e:
            logger.error(f"회원가입 정보 저장 중 오류: {str(e)}")
            raise Exception("이미 가입된 이메일입니다. 로그인을 해주세요.")