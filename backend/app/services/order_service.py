from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.order import Order
from ..models.order_progress import OrderProgress
from .quote_service import QuoteService
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class OrderService:
    def __init__(self):
        self.quote_service = QuoteService()

    async def create_order(self, db: Session, user_id: int, **order_data) -> Order:
        try:
            quote = await self.quote_service.create_quote(db, user_id, **order_data)
            
            order = Order(
                user_id=user_id,
                quote_id=quote.id,
                status='pending',
                **order_data,
                total_price=quote.final_price,
                created_at=datetime.utcnow()
            )
            
            db.add(order)
            db.commit()
            db.refresh(order)
            return order
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"주문 생성 실패: {str(e)}")

    def get_order_by_id(self, db: Session, order_id: int) -> Optional[Order]:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")
        return order

    def get_orders_by_user_id(self, db: Session, user_id: int) -> List[Order]:
        return db.query(Order).filter(Order.user_id == user_id).all()

    def update_order_status(self, db: Session, order_id: int, new_status: str) -> Order:
        order = self.get_order_by_id(db, order_id)
        try:
            order.status = new_status
            db.commit()
            db.refresh(order)
            return order
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"주문 상태 업데이트 중 오류가 발생했습니다: {str(e)}")

    def assign_shipping_company(self, db: Session, order_id: int, company_id: int) -> Order:
        order = self.get_order_by_id(db, order_id)
        try:
            order.shipping_company_id = company_id
            order.status = 'shipping_assigned'
            db.commit()
            db.refresh(order)
            return order
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"배송사 할당 중 오류가 발생했습니다: {str(e)}")

    def get_orders_in_date_range(self, db: Session, start_date: datetime, end_date: datetime) -> List[Order]:
        return db.query(Order).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).all()

    def _calculate_distance_fee(self, distance: float) -> float:
        """거리에 따른 요금을 계산합니다.
        
        - 10km까지는 기본료에 포함 (추가요금 없음)
        - 10km 초과시 1km당 2,000원의 추가요금 발생
        """
        if distance <= 10:
            return 0  # 10km까지는 추가요금 없음
        else:
            additional_distance = distance - 10
            additional_fee = additional_distance * 2000  # 1km당 2,000원
            return additional_fee

    def save_address(
        self,
        db: Session,
        user_id: int,
        from_address: str,
        from_detail_address: str,
        to_address: str,
        to_detail_address: str,
        distance: float
    ) -> Dict[str, Any]:
        """주소 정보를 저장하고 반환합니다."""
        try:
            # 주소 정보를 OrderProgress 테이블에 저장
            progress_data = {
                "step": "address",
                "data": {
                    "from_address": from_address,
                    "from_detail_address": from_detail_address,
                    "to_address": to_address,
                    "to_detail_address": to_detail_address,
                    "distance": distance
                }
            }
            
            # 기존 주소 정보가 있다면 업데이트, 없다면 새로 생성
            progress = (
                db.query(OrderProgress)
                .filter(
                    OrderProgress.user_id == user_id,
                    OrderProgress.step == "address"
                )
                .first()
            )
            
            if progress:
                progress.data = progress_data["data"]
                progress.updated_at = datetime.utcnow()
            else:
                progress = OrderProgress(
                    user_id=user_id,
                    step=progress_data["step"],
                    data=progress_data["data"]
                )
                db.add(progress)
            
            db.commit()
            db.refresh(progress)
            
            # 응답 데이터 구성
            response_data = {
                "id": progress.id,
                "from_address": from_address,
                "from_detail_address": from_detail_address,
                "to_address": to_address,
                "to_detail_address": to_detail_address,
                "distance": distance,
                "created_at": progress.created_at
            }
            
            return response_data
            
        except Exception as e:
            db.rollback()
            logger.error(f"주소 저장 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail="주소 저장 중 오류가 발생했습니다")