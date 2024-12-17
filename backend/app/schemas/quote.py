from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class QuoteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class FloorInfo(BaseModel):
    from_floor: int = Field(..., description="출발지 층수")
    to_floor: int = Field(..., description="도착지 층수")
    has_elevator_from: bool = Field(..., description="출발지 엘리베이터 유무")
    has_elevator_to: bool = Field(..., description="도착지 엘리베이터 유무")

class QuoteCreate(BaseModel):
    items: List[Dict[str, Any]] = Field(..., description="이사 물품 목록")
    from_address_id: int = Field(..., description="출발지 주소 ID")
    to_address_id: int = Field(..., description="도착지 주소 ID")
    floor_info: FloorInfo
    special_requirements: Optional[Dict[str, Any]] = Field(None, description="특수 요구사항")

class QuoteResponse(BaseModel):
    id: int
    user_id: int
    furniture_details: List[Dict[str, Any]]
    distance: float
    floor_info: Dict[str, Any]
    special_requirements: Optional[Dict[str, Any]]
    base_price: float
    distance_fee: float
    floor_fee: float
    special_fee: float
    discount_amount: float
    final_price: float
    status: QuoteStatus
    valid_until: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 