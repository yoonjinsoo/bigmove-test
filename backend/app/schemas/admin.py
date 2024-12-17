from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class UserBase(BaseModel):
    email: str
    name: str
    phone: str
    is_active: bool

class UserList(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecentUser(BaseModel):
    id: int
    email: str
    name: str
    provider: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class UserStats(BaseModel):
    total_users: int
    social_stats: Dict[str, int]
    recent_users: List[RecentUser]

    class Config:
        from_attributes = True

class UserDetail(UserList):
    last_login: Optional[datetime] = None
    orders_count: Optional[int] = None
    total_spent: Optional[float] = None

    class Config:
        from_attributes = True

# 배송 시간대 스키마
class DeliveryTimeSlotBase(BaseModel):
    date: str
    time: str
    area_code: str
    max_capacity: int = 10
    is_loading_available: bool = True
    is_unloading_available: bool = True

    class Config:
        from_attributes = True

class DeliveryTimeSlotCreate(DeliveryTimeSlotBase):
    pass

class DeliveryTimeSlotResponse(DeliveryTimeSlotBase):
    id: int
    current_bookings: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# 지역 제한 스키마
class DeliveryAreaRestrictionBase(BaseModel):
    area_code: str
    date: str
    is_available: bool = True
    max_daily_capacity: int = 50
    reason: Optional[str] = None

    class Config:
        from_attributes = True

class DeliveryAreaRestrictionCreate(DeliveryAreaRestrictionBase):
    pass

class DeliveryAreaRestrictionResponse(DeliveryAreaRestrictionBase):
    id: int
    current_bookings: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# 배송 통계 스키마
class DeliveryStatisticsResponse(BaseModel):
    total_bookings: int
    today_bookings: int

    class Config:
        from_attributes = True