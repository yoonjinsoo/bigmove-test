import os
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes import (
    categories, orders, product, notification,
    admin, auth, payment, quote, review,
    warehouse, delivery, service_options, directions
)
from .database import engine, Base
from .routes.auth import router as auth_router
from .routes.coupon import router as coupon_router
from datetime import datetime
from .database import get_db
import logging
from sqlalchemy import text
import sys

logger = logging.getLogger(__name__)

app = FastAPI(title="BigMove API")

# 로깅 설정 강화
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    logger.info("=== Health Check Started ===")
    try:
        response = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": os.getenv("ENVIRONMENT", "production")
        }
        logger.info(f"Health Check Response: {response}")
        return response
    except Exception as e:
        logger.error(f"Health Check Failed: {str(e)}")
        logger.exception("Detailed Error:")
        raise
    finally:
        logger.info("=== Health Check Completed ===")

@app.get("/api")
async def health_check():
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "BigMove API"
    }

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 라우터 등록 전 로깅
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    logger.info(f"Request headers: {request.headers}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

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
    (quote.router, "/api/quotes", "견적"),
    (review.router, "/api/reviews", "리뷰"),
    (warehouse.router, "/api/warehouses", "창고"),
    (delivery.router, "/api/delivery", "배송"),
    (service_options.router, "/api/service-options", "서비스 옵션")
]

for router, prefix, tag in ROUTER_CONFIGS:
    app.include_router(router, prefix=prefix, tags=[tag])

# 결제 라우터 등록 (한 번만)
logger.info("Registering payment router with prefix: /api")
app.include_router(
    payment.router,
    prefix="/api",
    tags=["결제"]
)

app.include_router(directions.router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
