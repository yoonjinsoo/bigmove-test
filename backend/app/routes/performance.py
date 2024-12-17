from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User
from ..utils.auth import get_current_admin_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/company/{company_id}")
async def analyze_company_performance(
    company_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """배송 회사별 성능 분석 (관리자 전용)"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        return container.performance_analysis_service.analyze_company_performance(
            db, company_id, start_date, end_date
        )
    except Exception as e:
        logger.error(f"회사 성능 분석 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="성능 분석 중 오류가 발생했습니다")

@router.get("/drivers/ranking")
async def get_driver_performance_ranking(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """기사별 성능 랭킹 조회 (관리자 전용)"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        return container.performance_analysis_service.get_driver_performance_ranking(db, start_date, end_date, limit)
    except Exception as e:
        logger.error(f"기사 랭킹 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="랭킹 조회 중 오류가 발생했습니다")

@router.get("/delivery-times")
async def analyze_delivery_times(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """배송 시간 분석 (관리자 전용)"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        return container.performance_analysis_service.analyze_delivery_times(db, start_date, end_date)
    except Exception as e:
        logger.error(f"배송 시간 분석 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 시간 분석 중 오류가 발생했습니다")

@router.get("/regional")
async def analyze_regional_performance(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """지역별 성능 분석 (관리자 전용)"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        return container.performance_analysis_service.analyze_regional_performance(db, start_date, end_date)
    except Exception as e:
        logger.error(f"지역별 성능 분석 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="지역별 성능 분석 중 오류가 발생했습니다") 