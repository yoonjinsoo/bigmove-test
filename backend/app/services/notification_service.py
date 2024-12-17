from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from email.mime.text import MIMEText
import smtplib
from ..models import Notification, User, Order, ShippingOrder
from ..schemas.notification import NotificationCreate

class NotificationService:
    def __init__(self, email_config: dict):
        self.email_config = email_config

    async def notify_order_status(self, db: Session, order_id: int, status: str):
        try:
            order = db.query(Order).filter(Order.id == order_id).first()
            if not order:
                raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")

            user = db.query(User).filter(User.id == order.user_id).first()
            
            title = f"주문 상태 업데이트: {status}"
            content = f"주문 번호 {order_id}의 상태가 {status}로 변경되었습니다."
            
            # DB 알림 생성
            notification = self.create_notification(
                db, user.id, title, content, "order"
            )
            
            # 이메일 발송
            if user.email:
                await self.send_email_notification(
                    user.email,
                    title,
                    content
                )
                
            return notification
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"알림 처리 중 오류가 발생했습니다: {str(e)}")

    async def notify_shipping_status(self, db: Session, shipping_order_id: int, status: str, location: Optional[str] = None):
        try:
            shipping_order = db.query(ShippingOrder).filter(ShippingOrder.id == shipping_order_id).first()
            if not shipping_order:
                raise HTTPException(status_code=404, detail="배송 주문을 찾을 수 없습니다")

            order = db.query(Order).filter(Order.id == shipping_order.order_id).first()
            user = db.query(User).filter(User.id == order.user_id).first()
            
            location_info = f" (현재 위치: {location})" if location else ""
            title = f"배송 상태 업데이트: {status}"
            content = f"주문 번호 {order.id}의 배송 상태가 {status}로 변경되었습니다.{location_info}"
            
            # DB 알림 생성
            notification = self.create_notification(
                db, user.id, title, content, "shipping"
            )
            
            # 이메일 발송
            if user.email:
                await self.send_email_notification(
                    user.email,
                    title,
                    content
                )
                
            return notification
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"알림 처리 중 오류가 발생했습니다: {str(e)}")

    def get_user_notifications(self, db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Notification]:
        return db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

    def mark_as_read(self, db: Session, notification_id: int, user_id: int) -> Notification:
        notification = db.query(Notification)\
            .filter(Notification.id == notification_id, Notification.user_id == user_id)\
            .first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다")
            
        notification.is_read = True
        notification.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
        return notification