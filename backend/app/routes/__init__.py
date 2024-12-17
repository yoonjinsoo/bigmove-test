from fastapi import APIRouter
from .categories import router as categories_router
from .items import router as items_router

router = APIRouter()

router.include_router(categories_router, prefix="/categories", tags=["categories"])
router.include_router(items_router)  # items 라우터 추가
