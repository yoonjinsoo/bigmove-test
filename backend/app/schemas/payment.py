from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class PaymentBase(BaseModel):
    order_id: int = Field(..., description="주문 ID")
    amount: float = Field(..., description="결제 금액")
    payment_method: str = Field(..., description="결제 수단")
    payment_gateway: str = Field(..., description="결제 게이트웨이")

class PaymentCreate(PaymentBase):
    payment_details: Optional[Dict] = Field(None, description="결제 상세 정보")

class PaymentUpdate(BaseModel):
    status: str = Field(..., description="결제 상태")
    transaction_id: Optional[str] = None
    error_message: Optional[str] = None
    paid_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    id: int
    status: str
    transaction_id: Optional[str]
    error_message: Optional[str]
    paid_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 