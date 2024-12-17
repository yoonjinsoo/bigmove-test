import logging
import sys
from fastapi import FastAPI, Request, Response
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .routes import (
    categories, orders, product, notification,
    admin, auth, payment, quote, review,
    warehouse, delivery, service_options
)
from .database import engine, Base
from .routes.auth import router as auth_router
from .routes.coupon import router as coupon_router

# 로깅 설정 강화
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),  # 터미널에 출력
        logging.FileHandler('app.log')      # 파일에도 저장
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="BigMove API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 세션 미들웨어 추가
app.add_middleware(
    SessionMiddleware,
    secret_key="your-secret-key",  # Settings에서 가져오거나 환경 변수 사용 권장
    same_site="lax",  # CSRF 보호
    https_only=False  # 개발 환경에서는 False, 프로덕션에서는 True
)

# 요청/응답 로깅 미들웨어 강화
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청/응답 상세 로깅 미들웨어"""
    # 요청 정보 로깅
    logger.info("=" * 50)
    logger.info("요청 시작")
    logger.info(f"URL: {request.url}")
    logger.info(f"Method: {request.method}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    try:
        # 요청 바디 로깅 (가능한 경우)
        body = await request.body()
        if body:
            logger.info(f"Request Body: {body.decode()}")
    except Exception as e:
        logger.error(f"요청 바디 로깅 실패: {str(e)}")

    try:
        # 응답 처리
        response = await call_next(request)
        
        # 응답 정보 로깅
        logger.info("응답 정보")
        logger.info(f"Status Code: {response.status_code}")
        logger.info(f"Response Headers: {dict(response.headers)}")
        
        # 응답 바디 로깅 시도
        try:
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            logger.info(f"Response Body: {body.decode()}")
            
            # 원래 응답 반환
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type
            )
        except Exception as e:
            logger.error(f"응답 바디 로깅 실패: {str(e)}")
            return response
            
    except Exception as e:
        logger.error(f"요청 처리 중 오류 발생: {str(e)}")
        logger.exception("상세 에러 스택:")
        raise
    finally:
        logger.info("요청 종료")
        logger.info("=" * 50)

# 라우터 등록
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(coupon_router, prefix="/api/coupons", tags=["coupons"])

# 나머지 라우터들
ROUTER_CONFIGS = [
    (categories.router, "/api/categories", "카테고리"),
    (orders.router, "/api/orders", "주문"),
    (product.router, "/api/products", "제품"),
    (notification.router, "/api/notifications", "알림"),
    (payment.router, "/api/payments", "결제"),
    (quote.router, "/api/quotes", "견적"),
    (review.router, "/api/reviews", "리뷰"),
    (warehouse.router, "/api/warehouses", "창고"),
    (delivery.router, "/api/delivery", "배송"),
    (service_options.router, "/api/service-options", "서비스 옵션")
]

for router, prefix, tag in ROUTER_CONFIGS:
    app.include_router(router, prefix=prefix, tags=[tag])