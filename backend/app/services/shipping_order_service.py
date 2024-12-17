from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from ..models.shipping_order import ShippingOrder
from ..services.notification_service import NotificationService
from ..utils.email import conf as email_config

class ShippingOrderService:
    def __init__(self):
        self.notification_service = NotificationService({
            "smtp_server": email_config.MAIL_SERVER,
            "smtp_port": email_config.MAIL_PORT,
            "sender": email_config.MAIL_FROM,
            "username": email_config.MAIL_USERNAME,
            "password": email_config.MAIL_PASSWORD
        })

    def create_shipping_order(
        self, 
        db: Session, 
        order_id: int, 
        company_id: int, 
        from_address_id: int, 
        to_address_id: int
    ) -> ShippingOrder:
        try:
            new_shipping_order = ShippingOrder(
                order_id=order_id,
                company_id=company_id,
                status='pending',
                from_address_id=from_address_id,
                to_address_id=to_address_id,
                created_at=datetime.utcnow()
            )
            db.add(new_shipping_order)
            db.commit()
            db.refresh(new_shipping_order)
            return new_shipping_order
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"배송 주문 생성 중 오류가 발생했습니다: {str(e)}")

    def get_shipping_order(self, db: Session, shipping_order_id: int) -> Optional[ShippingOrder]:
        shipping_order = db.query(ShippingOrder).filter(ShippingOrder.id == shipping_order_id).first()
        if not shipping_order:
            raise HTTPException(status_code=404, detail="배송 주문을 찾을 수 없습니다")
        return shipping_order

    async def update_shipping_order_status(
        self, 
        db: Session, 
        shipping_order_id: int, 
        new_status: str, 
        location: Optional[str] = None
    ) -> ShippingOrder:
        try:
            shipping_order = self.get_shipping_order(db, shipping_order_id)
            shipping_order.status = new_status
            if location:
                shipping_order.current_location = location
            
            # 배송 상태 변경 알림 발송
            await self.notification_service.notify_shipping_status(
                db,
                shipping_order_id,
                new_status,
                location
            )
            
            db.commit()
            db.refresh(shipping_order)
            return shipping_order
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"배송 상태 업데이트 중 오류가 발생했습니다: {str(e)}")

    def get_shipping_orders_by_company(self, db: Session, company_id: int) -> List[ShippingOrder]:
        return db.query(ShippingOrder).filter(ShippingOrder.company_id == company_id).all()

    def get_shipping_order_by_order_id(self, db: Session, order_id: int) -> Optional[ShippingOrder]:
        shipping_order = db.query(ShippingOrder).filter(ShippingOrder.order_id == order_id).first()
        if not shipping_order:
            raise HTTPException(status_code=404, detail="해당 주문의 배송 정보를 찾을 수 없습니다")
        return shipping_order

    def get_shipping_orders_in_date_range(
        self, 
        db: Session, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[ShippingOrder]:
        return db.query(ShippingOrder).filter(
            ShippingOrder.created_at >= start_date,
            ShippingOrder.created_at <= end_date
        ).all() 