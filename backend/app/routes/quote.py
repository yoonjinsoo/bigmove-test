from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..schemas.quote import QuoteCreate, QuoteResponse
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=QuoteResponse)
async def create_quote(
    quote_data: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """새로운 견적 생성"""
    try:
        quote = await container.quote_service.create_quote(
            db=db,
            user_id=current_user.id,
            items=quote_data.items,
            from_address_id=quote_data.from_address_id,
            to_address_id=quote_data.to_address_id,
            floor_info=quote_data.floor_info.dict(),
            special_requirements=quote_data.special_requirements
        )
        return quote
    except Exception as e:
        logger.error(f"견적 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="견적 생성 중 오류가 발생했습니다")

@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """견적 조회"""
    quote = await container.quote_service.get_quote_by_id(db, quote_id)
    if quote.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="이 견적에 접근할 권한이 없습니다")
    return quote

@router.post("/{quote_id}/accept")
async def accept_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """견적 수락"""
    try:
        quote = await container.quote_service.accept_quote(db, quote_id, current_user.id)
        return {"message": "견적이 수락되었습니다", "quote": quote}
    except Exception as e:
        logger.error(f"견적 수락 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="견적 수락 중 오류가 발생했습니다")
        raise HTTPException(status_code=500, detail="견적 수락 중 오류가 발생했습니다") 