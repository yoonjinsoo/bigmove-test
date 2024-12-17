from sqlalchemy import Column, Integer, Float, String, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime
import enum

class QuoteStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class Quote(Base):
    """견적 모델
    
    이사 서비스 견적 정보를 저장하는 모델입니다.
    """
    __tablename__ = "quotes"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"))
    from_address_id = Column(Integer, ForeignKey("addresses.id"))
    to_address_id = Column(Integer, ForeignKey("addresses.id"))
    
    # Item Details
    furniture_details = Column(JSON, comment="가구 상세 정보")
    items = Column(JSON, comment="이사 물품 목록")
    
    # Price Components
    total_price = Column(Float, comment="총 가격")
    shipping_fee = Column(Float, comment="배송 요금")
    distance = Column(Float, comment="배송 거리(km)")
    floor_info = Column(JSON, comment="층수 정보")
    special_requirements = Column(JSON, nullable=True, comment="특수 요구사항")
    
    # Fee Breakdown
    base_price = Column(Float, comment="기본 가격")
    distance_fee = Column(Float, comment="거리 요금")
    floor_fee = Column(Float, comment="층수 요금")
    special_fee = Column(Float, comment="특수 요구사항 요금")
    discount_amount = Column(Float, default=0, comment="할인 금액")
    final_price = Column(Float, comment="최종 가격")
    
    # Status and Timestamps
    status = Column(Enum(QuoteStatus), default=QuoteStatus.PENDING)
    valid_until = Column(DateTime, comment="견적 유효기간")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="quotes")
    from_address = relationship("Address", foreign_keys=[from_address_id])
    to_address = relationship("Address", foreign_keys=[to_address_id])