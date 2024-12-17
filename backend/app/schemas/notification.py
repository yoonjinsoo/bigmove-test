from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str = Field(..., description="알림 제목")
    content: str = Field(..., description="알림 내용")
    type: str = Field(..., description="알림 유형")

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    is_read: bool = Field(..., description="읽음 상태")

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True 