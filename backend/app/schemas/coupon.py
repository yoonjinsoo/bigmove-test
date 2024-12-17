from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CouponBase(BaseModel):
    amount: int
    expiry_date: datetime

class CouponCreate(CouponBase):
    user_id: int
    code: str

class CouponResponse(CouponBase):
    id: int
    code: str
    user_id: int
    created_at: datetime
    used_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CouponUse(BaseModel):
    coupon_code: str
    order_id: int 