from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Dict, Optional
from ..database import get_db
from ..models import User, Payment
from ..schemas.payment import PaymentCreate, PaymentResponse
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container
from ..core.config import settings
import httpx
import base64
import logging
import json
import os
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

class PaymentConfirmRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int

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
            payment_gateway="tosspayments",
            payment_details=payment_data.payment_details
        )
        return payment
    except Exception as e:
        logger.error(f"결제 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="결제 처리 중 오류가 발생했습니다")

@router.post("/payments/confirm")
async def confirm_payment(
    payment_data: PaymentConfirmRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Received payment confirmation request:")
    logger.info(f"- Payment Key: {payment_data.paymentKey}")
    logger.info(f"- Order ID: {payment_data.orderId}")
    logger.info(f"- Amount: {payment_data.amount}")
    
    try:
        logger.info(f"Payment confirmation started - OrderId: {payment_data.orderId}")
        
        async with httpx.AsyncClient() as client:
            toss_url = "https://api.tosspayments.com/v1/payments/confirm"
            
            secret_key = base64.b64encode(f"{settings.TOSS_SECRET_KEY}:".encode()).decode()
            
            headers = {
                "Authorization": f"Basic {secret_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "paymentKey": payment_data.paymentKey,
                "orderId": payment_data.orderId,
                "amount": payment_data.amount
            }

            logger.info(f"Sending request to Toss Payments - Payload: {payload}")
            
            response = await client.post(
                toss_url,
                headers=headers,
                json=payload
            )

            logger.info(f"Toss Payments response status: {response.status_code}")

            if response.status_code == 200:
                payment_data = response.json()
                logger.info(f"Payment confirmed successfully: {payment_data}")
                return payment_data
            else:
                error_data = response.json()
                logger.error(f"Payment confirmation failed: {error_data}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"결제 승인 실패: {error_data.get('message', '알 수 없는 오류')}"
                )
                
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during payment confirmation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"결제 처리 중 오류 발생: {str(e)}")

@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: str,
    db: Session = Depends(get_db),
    container = Depends(get_service_container)
):
    """결제 상태 조회"""
    try:
        payment = await container.payment_service.get_payment_by_order_id(db, order_id)
        if not payment:
            raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다")
        return {"status": payment.payment_status}
    except Exception as e:
        logger.error(f"결제 상태 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="결제 상태 조회 중 오류가 발생했습니다")

@router.post("/cancel/{order_id}")
async def cancel_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """결제 취소"""
    try:
        payment = await container.payment_service.cancel_payment(db, order_id)
        return {"status": "success", "payment": payment}
    except Exception as e:
        logger.error(f"결제 취소 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="결제 취소 중 오류가 발생했니다")