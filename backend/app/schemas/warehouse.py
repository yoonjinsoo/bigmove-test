from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WarehouseBase(BaseModel):
    name: str = Field(..., description="창고 이름")
    location: str = Field(..., description="창고 위치")
    capacity: int = Field(..., description="최대 수용 용량")
    contact_info: Optional[str] = Field(None, description="연락처 정보")

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    contact_info: Optional[str] = None
    status: Optional[str] = None

class WarehouseResponse(WarehouseBase):
    id: int
    status: str
    current_usage: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True 