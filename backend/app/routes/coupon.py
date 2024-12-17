from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..services.coupon_service import CouponService
from ..schemas.coupon import CouponResponse, CouponUse
from ..utils.auth import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/my", response_model=List[CouponResponse])
async def get_my_coupons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """사용자의 보유 쿠폰 목록 조회"""
    try:
        coupon_service = CouponService(db)
        coupons = await coupon_service.get_user_coupons(current_user.id)
        return coupons
    except Exception as e:
        logger.error(f"쿠폰 목록 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="쿠폰 목록을 불러오는데 실패했습니다")

@router.post("/use", response_model=CouponResponse)
async def use_coupon(
    coupon_data: CouponUse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """쿠폰 사용"""
    try:
        coupon_service = CouponService(db)
        is_valid = await coupon_service.validate_coupon(
            coupon_data.coupon_code, 
            current_user.id
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="유효하지 않은 쿠폰입니다")
            
        used_coupon = await coupon_service.use_coupon(
            coupon_data.coupon_code,
            current_user.id,
            coupon_data.order_id
        )
        return used_coupon
    except Exception as e:
        logger.error(f"쿠폰 사용 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="쿠폰 사용에 실패했습니다") 