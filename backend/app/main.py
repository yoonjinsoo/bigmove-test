import logging
import sys
from fastapi import FastAPI, Request, Response
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
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

# 요청/응답 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청/응답 로깅 미들웨어"""
    # 요청 정보 로깅
    logger.info("=" * 50)
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        logger.info(f"Response Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise
    finally:
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