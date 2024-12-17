from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class OrderBase(BaseModel):
    items: List[Dict[str, Any]]
    from_address_id: int
    to_address_id: int
    additional_options: Optional[Dict[str, Any]] = None

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    user_id: int
    status: str
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True

class OrderList(BaseModel):
    orders: List[OrderResponse] 

class OrderSummaryResponse(BaseModel):
    id: int
    user_id: int
    
    # 1단계: 상품 선택 데이터
    product_selection: Dict[str, Any]
    
    # 2단계: 날짜 선택 데이터
    date_selection: Dict[str, Any]
    
    # 3단계: 주소 정보
    address_info: Dict[str, Any]
    
    # 4단계: 추가 옵션
    additional_options: Dict[str, Any]
    
    # 가격 정보
    total_price: float
    
    # 메타 데이터
    current_step: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class AddressCreate(BaseModel):
    from_address: str
    from_detail_address: str
    to_address: str
    to_detail_address: str
    distance: float

class AddressResponse(BaseModel):
    id: int
    from_address: str
    from_detail_address: str
    to_address: str
    to_detail_address: str
    distance: float
    created_at: datetime

    class Config:
        orm_mode = True