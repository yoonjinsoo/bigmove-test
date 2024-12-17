from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict
from datetime import datetime
from ..models import Payment, Order
from ..utils.payment_gateway import PaymentGateway
from ..utils.email import conf as email_config
from ..services.notification_service import NotificationService
from ..services.logging_service import LoggingService

class PaymentService:
    def __init__(self):
        self.notification_service = NotificationService({
            "smtp_server": email_config.MAIL_SERVER,
            "smtp_port": email_config.MAIL_PORT,
            "sender": email_config.MAIL_FROM,
            "username": email_config.MAIL_USERNAME,
            "password": email_config.MAIL_PASSWORD
        })
        self.logging_service = LoggingService()
        self.payment_gateway = PaymentGateway()

    async def create_payment(
        self,
        db: Session,
        order_id: int,
        amount: float,
        payment_method: str,
        payment_gateway: str,
        payment_details: Optional[Dict] = None
    ) -> Payment:
        try:
            # 결제 요청 생성
            payment = Payment(
                order_id=order_id,
                amount=amount,
                payment_method=payment_method,
                payment_gateway=payment_gateway,
                status="pending",
                payment_details=payment_details
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)
            
            # 결제 게이트웨이 요청
            gateway_response = await self.payment_gateway.request_payment(
                payment.id,
                amount,
                payment_method,
                payment_details
            )
            
            # 결제 상태 업데이트
            payment.transaction_id = gateway_response.get("transaction_id")
            payment.status = gateway_response.get("status")
            payment.paid_at = datetime.utcnow() if payment.status == "completed" else None
            
            db.commit()
            
            # 결제 완료 알림 발송
            await self.notification_service.create_notification(
                db,
                payment.order.user_id,
                "결제가 완료되었습니다",
                f"주문 번호 {payment.order_id}의 결제가 완료되었습니다.",
                "payment"
            )
            
            # 로그 기록
            self.logging_service.log_to_db(
                db,
                "INFO",
                f"결제 생성 완료: 주문 ID {payment.order_id}",
                user_id=payment.order.user_id,
                additional_data={
                    "payment_id": payment.id,
                    "amount": payment.amount,
                    "payment_method": payment.payment_method
                }
            )
            
            return payment
            
        except Exception as e:
            db.rollback()
            # 에러 로그 기록
            self.logging_service.log_to_db(
                db,
                "ERROR",
                f"결제 처리 실패: {str(e)}",
                additional_data={"error_type": "payment_processing_error"}
            )
            raise HTTPException(status_code=500, detail=f"결제 처리 중 오류가 발생했습니다: {str(e)}")

    def get_payment_by_id(self, db: Session, payment_id: int) -> Payment:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다")
        return payment

    def get_payments_by_order_id(self, db: Session, order_id: int) -> list[Payment]:
        return db.query(Payment).filter(Payment.order_id == order_id).all()

    async def process_refund(self, db: Session, payment_id: int) -> Payment:
        payment = self.get_payment_by_id(db, payment_id)
        if payment.status != "completed":
            raise HTTPException(status_code=400, detail="완료된 결제만 환불이 가능합니다")
        
        try:
            # 결제 게이트웨이 환불 요청
            refund_response = await self.payment_gateway.request_refund(
                payment.transaction_id,
                payment.amount
            )
            
            payment.status = "refunded"
            db.commit()
            return payment
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"환불 처리 �� 오류가 발생했습니다: {str(e)}") 