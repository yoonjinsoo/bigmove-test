from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Literal

class DeliveryDateRequest(BaseModel):
    area_code: str  # 지역 코드

class TimeSlotStatus(BaseModel):
    time: str
    available: bool = True

class AvailableTimeSlotsResponse(BaseModel):
    success: bool
    loading_times: List[TimeSlotStatus]
    unloading_times: List[TimeSlotStatus]
    message: str

class TemporaryBookingCreate(BaseModel):
    time_slot_id: int  # 예약할 시간대 ID

class TemporaryBookingResponse(BaseModel):
    booking_id: int  # 생성된 예약 ID
    time_slot_id: int
    date: str
    time: str
    expires_at: datetime  # 임시 예약 만료 시간

    class Config:
        from_attributes = True

# 공통 응답 속성을 위한 기본 클래스
class DeliveryResponseBase(BaseModel):
    success: bool = True
    message: Optional[str] = None

# 가능한 날짜 목록 응답 모델
class AvailableDatesResponse(DeliveryResponseBase):
    dates: List[str]

    class Config:
        from_attributes = True