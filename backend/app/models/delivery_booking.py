from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class DeliveryBooking(Base):
    __tablename__ = "delivery_bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    date = Column(Date, index=True)  # String에서 Date로 변경
    loading_time = Column(String)
    unloading_time = Column(String)
    items = Column(JSON)
    delivery_option = Column(String)
    area_code = Column(String, index=True)  # 지역 코드 추가
    total_fee = Column(Integer)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 예약 상태 검증을 위한 메서드 추가
    def is_valid_booking(self) -> bool:
        """예약의 유효성을 검사합니다."""
        return (
            self.date is not None
            and self.loading_time is not None
            and self.unloading_time is not None
            and self.loading_time < self.unloading_time
        )