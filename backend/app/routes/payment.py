from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Payment
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """새로운 결제 생성"""
    try:
        payment = await container.payment_service.create_payment(
            db=db,
            order_id=payment_data.order_id,
            amount=payment_data.amount,
            payment_method=payment_data.payment_method,
            payment_gateway=payment_data.payment_gateway,
            payment_details=payment_data.payment_details
        )
        return payment
    except Exception as e:
        logger.error(f"결제 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="결제 처리 중 오류가 발생했습니다")

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """결제 정보 조회"""
    payment = container.payment_service.get_payment_by_id(db, payment_id)
    return payment

@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """결제 환불 처리"""
    try:
        payment = await container.payment_service.process_refund(db, payment_id)
        return payment
    except Exception as e:
        logger.error(f"환불 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="환불 처리 중 오류가 발생했습니다")