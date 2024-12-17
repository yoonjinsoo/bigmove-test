from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import User
from ..schemas.system_log import SystemLogResponse
from ..utils.auth import get_current_user, check_admin_permission
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[SystemLogResponse])
async def get_logs(
    skip: int = 0,
    limit: int = 50,
    level: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """시스템 로그 조회 (관리자 전용)"""
    check_admin_permission(current_user)
    try:
        logs = container.logging_service.get_logs(
            db, skip, limit, level, start_date, end_date
        )
        return logs
    except Exception as e:
        logger.error(f"로그 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="로그 조회 중 오류가 발생했습니다")

@router.get("/error-summary")
async def get_error_summary(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """에러 로그 요약 조회 (관리자 전용)"""
    check_admin_permission(current_user)
    try:
        return container.logging_service.get_error_summary(db, days)
    except Exception as e:
        logger.error(f"에러 요약 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="에러 요약 조회 중 오류가 발생했습니다") 