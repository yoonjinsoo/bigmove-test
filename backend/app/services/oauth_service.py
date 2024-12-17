from typing import Dict, Optional, Tuple
from fastapi import HTTPException
import httpx
import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from ..models.user import User, UserAgreements
from sqlalchemy.orm import Session
import secrets
import logging

class OAuthService:
    def __init__(self):
        self.client = httpx.AsyncClient()
        self.logger = logging.getLogger(__name__)
        
    def _generate_state(self) -> str:
        """CSRF 방지를 위한 state 생성"""
        return secrets.token_urlsafe(32)

    async def _get_kakao_token(self, code: str) -> Dict:
        """카카오 액세스 토큰 획득"""
        try:
            response = await self.client.post(
                'https://kauth.kakao.com/oauth/token',
                data={
                    'grant_type': 'authorization_code',
                    'client_id': settings.KAKAO_CLIENT_ID,
                    'client_secret': settings.KAKAO_CLIENT_SECRET,
                    'code': code,
                    'redirect_uri': settings.KAKAO_REDIRECT_URI
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"카카오 토큰 획득 실패: {str(e)}")

    async def _get_naver_token(self, code: str) -> Dict:
        """네이버 액세스 토큰 획득"""
        try:
            response = await self.client.post(
                'https://nid.naver.com/oauth2.0/token',
                data={
                    'grant_type': 'authorization_code',
                    'client_id': settings.NAVER_CLIENT_ID,
                    'client_secret': settings.NAVER_CLIENT_SECRET,
                    'code': code,
                    'state': self._generate_state()
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"네이버 토큰 획득 실패: {str(e)}")

    async def _get_google_token(self, code: str) -> Dict:
        """구글 액세스 토큰 획득"""
        try:
            response = await self.client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'grant_type': 'authorization_code',
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'code': code,
                    'redirect_uri': settings.GOOGLE_REDIRECT_URI
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"구글 토큰 획득 실패: {str(e)}")

    async def _get_kakao_user_info(self, access_token: str) -> Dict:
        """카카오 사용자 정보 조회"""
        try:
            response = await self.client.get(
                'https://kapi.kakao.com/v2/user/me',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            response.raise_for_status()
            user_data = response.json()
            
            return {
                'provider_id': f"K{str(user_data['id'])}",  # Kakao id 앞에 'K' 붙임
                'email': user_data.get('kakao_account', {}).get('email'),
                'name': user_data.get('properties', {}).get('nickname'),
                'profile_image': user_data.get('properties', {}).get('profile_image')
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"카카오 사용자 정보 조회 실패: {str(e)}")

    async def _get_naver_user_info(self, access_token: str) -> Dict:
        """네이버 사용자 정보 조회"""
        try:
            response = await self.client.get(
                'https://openapi.naver.com/v1/nid/me',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            response.raise_for_status()
            user_data = response.json()['response']
            return {
                'provider_id': f"N{str(user_data['id'])}",  # Naver id 앞에 'N' 붙임
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'profile_image': user_data.get('profile_image')
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"네이버 사용자 정보 조회 실패: {str(e)}")

    async def _get_google_user_info(self, access_token: str) -> Dict:
        """구글 사용자 정보 조회"""
        try:
            response = await self.client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            response.raise_for_status()
            user_data = response.json()
            return {
                'provider_id': f"G{str(user_data['id'])}",  # Google id 앞에 'G' 붙임
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'profile_image': user_data.get('picture')
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"구글 사용자 정보 조회 실패: {str(e)}")

    async def verify_oauth_token(self, provider: str, token: str) -> Dict:
        """OAuth 토큰 검증"""
        verify_funcs = {
            'naver': self._verify_naver_token,
            'kakao': self._verify_kakao_token,
            'google': self._verify_google_token
        }
        return await verify_funcs[provider](token)

    async def check_existing_user(self, db: Session, provider: str, user_info: Dict) -> bool:
        """소셜 로그인으로 가입된 사용자가 있는지 확인"""
        try:
            # 이메일과 provider로 기존 사용자 확인
            user = db.query(User).filter(
                User.email == user_info.get('email'),
                User.provider == provider
            ).first()
            
            return user is not None
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"사용자 정보 확인 중 오류: {str(e)}")

    async def create_or_update_user(self, db: Session, provider: str, user_info: Dict) -> Tuple[User, bool]:
        """소셜 로그인으로 가입된 사용자 생성 또는 업데이트"""
        try:
            # 기존 사용자 확인 - provider_id로 검색
            user = db.query(User).filter(
                User.provider_id == user_info['id'],
                User.provider == provider
            ).first()
            
            if user:
                # 기존 사용자 업데이트
                user.name = user_info['name']
                db.commit()
                return user, False
            else:
                # 신규 회원 생성
                user = User(
                    provider_id=user_info['id'],
                    provider=provider,
                    email=user_info['email'],
                    name=user_info['name'],
                    hashed_password=None  # 소셜 로그인은 비밀번호 불필요
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                return user, True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"사용자 정보 처리 중 오류: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"사용자 정보 처리 중 오류가 발생했습니다")

    async def save_agreements(self, db: Session, user_id: int, agreements: Dict[str, bool]):
        """약관 동의 정보 저장"""
        try:
            # 필수 동의 항목 검증
            required_agreements = ['terms', 'privacy', 'privacy_third_party']
            for agreement in required_agreements:
                if not agreements.get(agreement, False):
                    raise HTTPException(
                        status_code=400,
                        detail=f"필수 약관({agreement})에 동의해주세요"
                    )
            
            # 기존 동의 정보가 있는지 확인
            existing_agreement = db.query(UserAgreements).filter(
                UserAgreements.user_id == user_id
            ).first()
            
            if existing_agreement:
                # 기존 동의 정보 업데이트
                existing_agreement.terms = agreements.get('terms', False)
                existing_agreement.privacy = agreements.get('privacy', False)
                existing_agreement.privacy_third_party = agreements.get('privacy_third_party', False)
                existing_agreement.marketing = agreements.get('marketing', False)
            else:
                # 새로운 동의 정보 생성
                user_agreements = UserAgreements(
                    user_id=user_id,
                    terms=agreements.get('terms', False),
                    privacy=agreements.get('privacy', False),
                    privacy_third_party=agreements.get('privacy_third_party', False),
                    marketing=agreements.get('marketing', False)
                )
                db.add(user_agreements)
            
            db.commit()
            
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            self.logger.error(f"약관 동의 정보 저장 중 오류: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="약관 동의 정보 저장 중 오류가 발생했습니다")

    def get_authorization_url(self, provider: str) -> str:
        """소셜 로그인 인증 URL 생성"""
        try:
            if provider == 'google':
                auth_url = (
                    "https://accounts.google.com/o/oauth2/v2/auth"
                    f"?client_id={settings.GOOGLE_CLIENT_ID}"
                    f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
                    "&response_type=code"
                    "&scope=email profile"
                    "&access_type=offline"  # refresh token을 받기 위해 추가
                    "&prompt=consent"  # 매번 동의 화면을 보여주기 위해 추가
                )
                self.logger.info(f"Google 인증 URL 생성: {auth_url}")
                return auth_url
            elif provider == 'kakao':
                return f"https://kauth.kakao.com/oauth/authorize?client_id={settings.KAKAO_CLIENT_ID}&redirect_uri={settings.KAKAO_REDIRECT_URI}&response_type=code"
            elif provider == 'naver':
                return f"https://nid.naver.com/oauth2.0/authorize?client_id={settings.NAVER_CLIENT_ID}&redirect_uri={settings.NAVER_REDIRECT_URI}&response_type=code&state={self._generate_state()}"
            
            raise ValueError(f"지원하지 않는 provider: {provider}")
        except Exception as e:
            self.logger.error(f"인증 URL 생성 실패: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"인증 URL 생성 실패: {str(e)}")

    async def get_access_token(self, provider: str, code: str) -> Dict:
        """액세스 토큰 획득"""
        try:
            if provider == 'kakao':
                return await self._get_kakao_token(code)
            elif provider == 'naver':
                return await self._get_naver_token(code)
            elif provider == 'google':
                return await self._get_google_token(code)
            
            raise ValueError(f"지원하지 않는 provider: {provider}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"액세스 토큰 획득 실패: {str(e)}")

    async def get_user_info(self, provider: str, access_token: str) -> Dict:
        """사용자 정보 조회"""
        try:
            if provider == 'kakao':
                return await self._get_kakao_user_info(access_token)
            elif provider == 'naver':
                return await self._get_naver_user_info(access_token)
            elif provider == 'google':
                return await self._get_google_user_info(access_token)
            
            raise ValueError(f"지원하지 않는 provider: {provider}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"사용자 정보 조회 실패: {str(e)}")

    async def update_user_info(self, db: Session, provider: str, email: str, name: str) -> User:
        """사용자 정보 업데이트"""
        try:
            user = db.query(User).filter(
                User.email == email,
                User.provider == provider
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
            
            user.name = name
            db.commit()
            db.refresh(user)
            
            return user
            
        except Exception as e:
            db.rollback()
            raise e