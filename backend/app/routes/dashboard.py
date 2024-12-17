from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models import User
from ..utils.auth import get_current_admin_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/stats")
async def get_dashboard_statistics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """대시보드 통계 조회 (관리자 전용)"""
    try:
        return container.dashboard_service.get_dashboard_stats(db, days)
    except Exception as e:
        logger.error(f"대시보드 통계 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="대시보드 통계 조회 중 오류가 발생했습니다")

@router.get("/users")
async def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """회원 통계 조회 (관리자 전용)"""
    try:
        return container.dashboard_service.get_user_stats(db)
    except Exception as e:
        logger.error(f"회원 통계 조회 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))