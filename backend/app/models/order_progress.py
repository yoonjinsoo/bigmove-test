from sqlalchemy import Column, Integer, String, JSON, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class OrderProgress(Base):
    __tablename__ = "order_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # 1단계: 상품 선택
    product_selection = Column(JSON, nullable=True)  # {category, product, details}
    
    # 2단계: 날짜 선택
    date_selection = Column(JSON, nullable=True)     # {date, loading_time, unloading_time}
    
    # 3단계: 주소 입력
    address_info = Column(JSON, nullable=True)       # {loading_address, unloading_address, distance_fee}
    
    # 4단계: 추가 옵션
    additional_options = Column(JSON, nullable=True)  # {options, fees}
    
    # 공통 정보
    current_step = Column(String, default="product_selection")
    total_price = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 