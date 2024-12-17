from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from ..models import User, DeliveryTimeSlot, DeliveryAreaRestriction, DeliveryBooking
from ..schemas.admin import (
    UserList, UserDetail, UserStats,
    DeliveryTimeSlotCreate, DeliveryTimeSlotResponse,
    DeliveryAreaRestrictionCreate, DeliveryAreaRestrictionResponse,
    DeliveryStatisticsResponse
)
from ..utils.auth import get_current_admin
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# 배송 시간대 관리
@router.get("/delivery/time-slots", response_model=List[DeliveryTimeSlotResponse])
async def get_delivery_time_slots(
    date: str = None,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """배송 시간대 목록 조회 (관리자 전용)"""
    try:
        query = db.query(DeliveryTimeSlot)
        if date:
            query = query.filter(DeliveryTimeSlot.date == date)
        return query.all()
    except Exception as e:
        logger.error(f"배송 시간대 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 시간대 조회 중 오류가 발생했습니다")

@router.post("/delivery/time-slots", response_model=DeliveryTimeSlotResponse)
async def create_delivery_time_slot(
    time_slot: DeliveryTimeSlotCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """배송 시간대 생성 (관리자 전용)"""
    try:
        db_time_slot = DeliveryTimeSlot(**time_slot.dict())
        db.add(db_time_slot)
        db.commit()
        db.refresh(db_time_slot)
        return db_time_slot
    except Exception as e:
        db.rollback()
        logger.error(f"배송 시간대 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 시간대 생성 중 오류가 발생했습니다")

# 지역 제한 관리
@router.get("/delivery/area-restrictions", response_model=List[DeliveryAreaRestrictionResponse])
async def get_area_restrictions(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """배송 지역 제한 목록 조회 (관리자 전용)"""
    try:
        return db.query(DeliveryAreaRestriction).all()
    except Exception as e:
        logger.error(f"배송 지역 제한 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 지역 제한 조회 중 오류가 발생했습니다")

@router.post("/delivery/area-restrictions", response_model=DeliveryAreaRestrictionResponse)
async def create_area_restriction(
    restriction: DeliveryAreaRestrictionCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """배송 지역 제한 생성 (관리자 전용)"""
    try:
        db_restriction = DeliveryAreaRestriction(**restriction.dict())
        db.add(db_restriction)
        db.commit()
        db.refresh(db_restriction)
        return db_restriction
    except Exception as e:
        db.rollback()
        logger.error(f"배송 지역 제한 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 지역 제한 생성 중 오류가 발생했습니다")

# 배송 현황 모니터링
@router.get("/delivery/statistics", response_model=DeliveryStatisticsResponse)
async def get_delivery_statistics(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """배송 통계 조회 (관리자 전용)"""
    try:
        total_bookings = db.query(DeliveryBooking).count()
        today_bookings = db.query(DeliveryBooking).filter(
            DeliveryBooking.date == datetime.now().strftime('%Y-%m-%d')
        ).count()
        
        return DeliveryStatisticsResponse(
            total_bookings=total_bookings,
            today_bookings=today_bookings
        )
    except Exception as e:
        logger.error(f"배송 통계 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 통계 조회 중 오류가 발생했습니다")

@router.get("/dashboard", response_model=UserStats)
async def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """관리자 대시보드 통계 조회"""
    try:
        logger.info(f"Admin {current_admin.email} accessing dashboard")
        
        # 전체 회원 수
        total_users = db.query(User).count()
        
        # 소셜 로그인 통계
        social_stats = {}
        for provider in ["email", "google", "kakao", "naver"]:
            count = db.query(User).filter(User.provider == provider).count()
            social_stats[provider] = count
        
        # 최근 가입 회원
        recent_users = (
            db.query(User)
            .order_by(User.created_at.desc())
            .limit(10)
            .all()
        )
        
        return {
            "total_users": total_users,
            "social_stats": social_stats,
            "recent_users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "provider": user.provider or "email",
                    "created_at": user.created_at,
                    "is_active": bool(user.is_active)
                }
                for user in recent_users
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))