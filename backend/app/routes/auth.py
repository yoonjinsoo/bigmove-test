from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, UserAgreements
from ..services.auth_service import AuthService
from ..services.social.google.google_auth import GoogleAuthService
from ..services.social.naver.naver_auth import NaverAuthService
from ..services.social.kakao.kakao_auth import KakaoAuthService
from ..schemas.auth import Token, UserLogin, SignupRequest, UserCreate
from ..core.config import Settings, get_settings
from ..utils.auth import create_access_token, get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 서비스 의존성 주입
def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

def get_social_auth_service(provider: str, settings: Settings):
    """소셜 로그인 서비스 제공자 선택"""
    if provider == "google":
        return GoogleAuthService(settings)
    elif provider == "naver":
        return NaverAuthService(settings)
    elif provider == "kakao":
        return KakaoAuthService(settings)
    else:
        raise HTTPException(status_code=400, detail="지원하지 않는 소셜 로그인입니다")

# 1. 회원가입 통합 (일반/소셜)
@router.post("/register")
async def register(
    signup_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    logger.info("=== 회원가입 프로세스 시작 ===")
    try:
        logger.info(f"받은 회원가입 데이터: {signup_data.dict(exclude={'password'})}")
        
        # 약관 동의 검증 로직 수정 - 딕셔너리 접근 방식으로 수정
        logger.info("회원가입 데이터 검증 시작")
        agreements = signup_data.agreements
        if not all([
            agreements['terms'],          # 딕셔너리 키로 접근
            agreements['privacy'],        # 딕셔너리 키로 접근
            agreements['privacyThirdParty']  # 딕셔너리 키로 접근
        ]):
            logger.error(f"필수 동의 항목 누락 - 동의 현황: "
                        f"이용약관={agreements['terms']}, "
                        f"개인정보={agreements['privacy']}, "
                        f"제3자={agreements['privacyThirdParty']}")
            raise HTTPException(status_code=400, detail="필수 약관에 동의해주세요")

        # AuthService 처리
        logger.info("AuthService.process_signup 호출")
        result = await auth_service.process_signup(signup_data)
        logger.info(f"회원가입 완료 - 사용자 ID: {result.get('user', {}).get('id')}")
        return result
        
    except Exception as e:
        logger.error(f"회원가입 처리 중 오류 발생: {str(e)}")
        logger.exception("상세 오류 정보:")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        logger.info("=== 회원가입 프로세스 종료 ===")

# 2. 로그인 통합 (일반/소셜)
@router.post("/login")
async def login(
    form_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user = await auth_service.authenticate_user(
            email=form_data.email,
            password=form_data.password
        )
        access_token = auth_service.create_access_token(data={"sub": user.email})
        
        # provider_id 추가
        return {
            "user": {
                "id": user.id,
                "provider_id": f"E{user.id}",  # 일반 회원가입은 'E' prefix
                "email": user.email,
                "name": user.name,
                "role": user.role
            },
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# 3. 소셜 로그인 초기화
@router.get("/login/{provider}")
async def social_login(
    provider: str,
    source: str,  # signup 또는 login
    redirect_uri: str,
    settings: Settings = Depends(get_settings)
):
    try:
        auth_service = get_social_auth_service(provider, settings)
        auth_url = await auth_service.initialize_oauth(
            redirect_uri=redirect_uri,
            source=source
        )
        return auth_url
    except Exception as e:
        logger.error(f"소셜 로그인 URL 생성 중 오류: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# 4. 소셜 콜백 처리
@router.get("/callback/{provider}")
async def social_callback(
    provider: str,
    code: str,
    state: str,
    request: Request,
    db: Session = Depends(get_db),
    settings = Depends(get_settings)
):
    try:
        logger.info(f"소셜 콜백 요청 - provider: {provider}, code: {code}")
        
        auth_service = get_social_auth_service(provider, settings)
        auth_result = await auth_service.handle_callback(code, state, request, db)
        
        # 프론트엔드로 보내는 응답 직전에 로그
        logger.info(f"""
        ===== 프론트엔드 응답 전송 =====
        1. 응답 데이터:
           - is_new_user: {auth_result.get('is_new_user')}
           - email: {auth_result.get('temp_user_info', {}).get('email')}
           - provider: {auth_result.get('temp_user_info', {}).get('provider')}
           
        2. 프론트엔드 라우팅 예상:
           - is_new_user가 {auth_result.get('is_new_user')}이므로
           - {'회원가입 진행' if auth_result.get('is_new_user') else '이미 가입된 회원 안내'} 화면으로 이동해야 함
        """)
        
        # 프론트엔드에서 SocialSignup 컴포넌트 마운트 시점 추적을 위한 로그
        logger.info(f"""
        3. 프론트엔드 동작 시나리오:
           - SocialCallback에서 데이터 수신
           - useAuthStore에 데이터 저장
           - SocialSignup 컴포넌트로 이동
           - isNewUser 상태에 따라 메시지 표시
        """)
        
        return auth_result
        
    except Exception as e:
        logger.error(f"소셜 콜백 에러: {str(e)}")
        raise

# 테스트용 DB 초기화 (개발 환경에서만 사용)
@router.delete("/test/reset-db")
async def reset_test_db(db: Session = Depends(get_db)):
    try:
        db.query(UserAgreements).delete()
        db.query(User).delete()
        db.commit()
        return {"message": "데이터베이스 초기화 완료"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validate-token")
async def validate_token(current_user: User = Depends(get_current_user)):
    """토큰 유효성 검증 - 로그인 상태 유지를 위한 엔드포인트"""
    try:
        return {
            "valid": True,
            "user_id": current_user.id
        }
    except Exception as e:
        logger.error(f"토큰 검증 실패: {str(e)}")
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보 조회"""
    try:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role
        }
    except Exception as e:
        logger.error(f"사용자 정보 조회 실패: {str(e)}")
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다")

@router.get("/check-existing-user/{provider}")
async def check_existing_user(
    provider: str,
    request: Request,
    settings: Settings = Depends(get_settings)
):
    try:
        auth_service = get_social_auth_service(provider, settings)
        existing_user = await auth_service.check_existing_user(request)
        
        return {
            "userExists": existing_user is not None,
            "message": "이미 가입된 회원입니다." if existing_user else "신규 회원입니다."
        }
        
    except Exception as e:
        logger.error(f"기존 회원 확인 중 오류: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
