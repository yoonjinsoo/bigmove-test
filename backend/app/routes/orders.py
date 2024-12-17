from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import User, Order
from ..schemas.orders import (
    OrderCreate, 
    OrderResponse, 
    OrderList, 
    OrderSummaryResponse,
    AddressCreate,
    AddressResponse
)
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    try:
        order = container.order_service.create_order(
            db,
            user_id=current_user.id,
            items=order_data.items,
            from_address_id=order_data.from_address_id,
            to_address_id=order_data.to_address_id,
            additional_options=order_data.additional_options
        )
        return order
    except Exception as e:
        logger.error(f"주문 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="주문 처리 중 오류가 발생했습니다")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    order = container.order_service.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="이 주문에 접근할 권한이 없습니다")
    return order

@router.get("/{order_id}/summary", response_model=OrderSummaryResponse)
async def get_order_summary(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    try:
        return container.order_service.get_order_summary(db, order_id, current_user.id)
    except Exception as e:
        logger.error(f"주문 요약 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="주문 요약을 불러오는 중 오류가 발생했습니다")

@router.post("/progress/{step}")
async def save_order_progress(
    step: str,
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    return await container.order_progress_service.save_step_data(
        db=db,
        user_id=current_user.id,
        step=step,
        data=data
    )

@router.get("/progress")
async def get_order_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """현재 주문 진행상황 조회"""
    return await container.order_progress_service.get_progress(
        db=db,
        user_id=current_user.id
    )

@router.get("/summary", response_model=OrderSummaryResponse)
async def get_order_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """주문 요약 정보 조회"""
    try:
        # 현재 진행중인 주문 데이터 조회
        progress_data = await container.order_progress_service.get_progress(db, current_user.id)
        if not progress_data:
            raise HTTPException(status_code=404, detail="진행중인 주문이 없습니다")

        # 최종 가격 계산
        total_price = await container.order_progress_service.calculate_current_price(
            db, current_user.id
        )

        # 요약 정보 구성
        summary = {
            "order_steps": {
                "product": progress_data.get("product_selection", {}),
                "date": progress_data.get("date_selection", {}),
                "address": progress_data.get("address_input", {}),
                "options": progress_data.get("additional_options", {})
            },
            "price_details": {
                "base_price": total_price,  # 기본 요금
                "distance_fee": progress_data.get("address_input", {}).get("distance_fee", 0),
                "option_fees": progress_data.get("additional_options", {}).get("total_fees", 0),
                "total_price": total_price
            },
            "status": progress_data.get("current_step", ""),
            "user_info": {
                "name": current_user.name,
                "email": current_user.email,
                "phone": current_user.phone
            }
        }

        return summary

    except Exception as e:
        logger.error(f"주문 요약 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"주문 요약 조회 실패: {str(e)}")

@router.post("/address", response_model=AddressResponse)
async def save_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    try:
        # 주소 정보를 저장하고 응답
        address = container.order_service.save_address(
            db,
            user_id=current_user.id,
            from_address=address_data.from_address,
            from_detail_address=address_data.from_detail_address,
            to_address=address_data.to_address,
            to_detail_address=address_data.to_detail_address,
            distance=address_data.distance
        )
        return address
    except Exception as e:
        logger.error(f"주소 저장 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="주소 저장 중 오류가 발생했습니다")

@router.post("/confirm")
async def confirm_order(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """주문 확정"""
    try:
        # 현재 진행중인 주문 데이터 조회
        progress_data = await container.order_progress_service.get_progress(db, current_user.id)
        if not progress_data:
            raise HTTPException(status_code=404, detail="진행중인 주문이 없습니다")

        # 모든 필수 단계가 완료되었는지 확인
        for step in ['product_selection', 'date_selection', 'address_input', 'additional_options']:
            if step not in progress_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"필수 단계 {step}가 완료되지 않았습니다"
                )

        # 주문 확정 처리
        order = await container.order_service.create_order(
            db=db,
            user_id=current_user.id,
            order_data=progress_data
        )

        # Redis 캐시 삭제
        await container.order_progress_service.clear_progress(current_user.id)

        return {
            "message": "주문이 성공적으로 확정되었습니다",
            "order_id": order.id
        }

    except Exception as e:
        logger.error(f"주문 확정 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"주문 확정 실패: {str(e)}")