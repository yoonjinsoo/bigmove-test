from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import User
from ..schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewStatistics
from ..utils.auth import get_current_user, get_current_admin_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """새로운 리뷰 생성"""
    try:
        review = container.review_service.create_review(
            db=db,
            user_id=current_user.id,
            review_data=review_data
        )
        return review
    except Exception as e:
        logger.error(f"리뷰 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="리뷰 생성 중 오류가 발생했습니다")

@router.get("/statistics", response_model=ReviewStatistics)
async def get_review_statistics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """리뷰 통계 조회 (관리자 전용)"""
    return container.review_service.get_review_statistics(db, days)

@router.get("/driver/{driver_id}", response_model=List[ReviewResponse])
async def get_driver_reviews(
    driver_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """기사별 리뷰 조회 (관리자 전용)"""
    return container.review_service.get_driver_reviews(db, driver_id)

@router.get("/top-drivers", response_model=List[dict])
async def get_top_rated_drivers(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """최고 평점 기사 목록 조회 (관리자 전용)"""
    return container.review_service.get_top_rated_drivers(db, limit)

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """리뷰 수정"""
    try:
        return container.review_service.update_review(
            db=db,
            review_id=review_id,
            user_id=current_user.id,
            review_data=review_data
        )
    except Exception as e:
        logger.error(f"리뷰 수정 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="리뷰 수정 중 오류가 발생했습니다")

@router.get("/search", response_model=List[ReviewResponse])
async def search_reviews(
    query: Optional[str] = None,
    rating: Optional[int] = Query(None, ge=1, le=5),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    container = Depends(get_service_container)
):
    """리뷰 검색"""
    try:
        return container.review_service.search_reviews(
            db=db,
            query=query,
            rating=rating,
            start_date=start_date,
            end_date=end_date
        )
    except Exception as e:
        logger.error(f"리뷰 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="리뷰 검색 중 오류가 발생했습니다") 