from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class DeliveryOption(BaseModel):
    type: Literal['same-day', 'next-day', 'regular']
    label: str
    additional_fee: int = Field(alias='additionalFee')

    class Config:
        populate_by_name = True

class Surcharge(BaseModel):
    type: str
    label: str
    additional_fee: int = Field(alias='additionalFee')

    class Config:
        populate_by_name = True

class TimeSlotStatus(BaseModel):
    time: str
    max_capacity: int = 100
    current_bookings: int = 0
    available: bool = True
    is_full: bool = False

class DeliveryTimeSlots(BaseModel):
    loadingTimes: List[TimeSlotStatus]
    unloadingTimes: List[TimeSlotStatus]

class AvailableDate(BaseModel):
    date: str
    surcharges: List[Surcharge] = []

# 응답 모델 추가
class DeliveryOptionsResponse(BaseModel):
    options: List[DeliveryOption]

class AvailableDatesResponse(BaseModel):
    dates: List[AvailableDate]

class TimeSlotsResponse(BaseModel):
    timeSlots: List[TimeSlotStatus]

# 예약 관련 모델
class DeliveryBookingRequest(BaseModel):
    date: str
    loading_time: str
    unloading_time: str
    customer_id: str
    items: List[str]
    delivery_option: str

class DeliveryBookingResponse(BaseModel):
    booking_id: str
    status: str
    total_fee: int
    created_at: datetime

class DistanceCalculationRequest(BaseModel):
    start_address: dict = Field(..., example={
        "x": "127.1058342",
        "y": "37.359708"
    })
    end_address: dict = Field(..., example={
        "x": "127.1058342",
        "y": "37.359708"
    })

class DistanceCalculationResponse(BaseModel):
    total_distance: float
    base_distance: float = 10.0
    extra_distance: float
    base_fee: int
    extra_fee: int
    total_fee: int

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class DeliveryTimeSlot(Base):
    __tablename__ = "delivery_time_slots"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    area_code = Column(String, nullable=False)
    max_capacity = Column(Integer, default=10)
    current_bookings = Column(Integer, default=0)
    is_loading_available = Column(Boolean, default=True)
    is_unloading_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def is_available(self) -> bool:
        """해당 시간대가 예약 가능한지 확인"""
        return self.current_bookings < self.max_capacity

    def increment_bookings(self) -> bool:
        """예약 수 증가"""
        if not self.is_available():
            return False
        self.current_bookings += 1
        return True

    def decrement_bookings(self) -> bool:
        """예약 수 감소"""
        if self.current_bookings <= 0:
            return False
        self.current_bookings -= 1
        return True

class DeliveryAreaRestriction(Base):
    __tablename__ = "delivery_area_restrictions"

    id = Column(Integer, primary_key=True, index=True)
    area_code = Column(String, nullable=False)
    date = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    max_daily_capacity = Column(Integer, default=50)
    current_bookings = Column(Integer, default=0)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def can_accept_booking(self) -> bool:
        """해당 지역이 추가 예약을 받을 수 있는지 확인"""
        return self.is_available and self.current_bookings < self.max_daily_capacity

    def increment_bookings(self) -> bool:
        """예약 수 증가"""
        if not self.can_accept_booking():
            return False
        self.current_bookings += 1
        return True

    def decrement_bookings(self) -> bool:
        """예약 수 감소"""
        if self.current_bookings <= 0:
            return False
        self.current_bookings -= 1
        return True