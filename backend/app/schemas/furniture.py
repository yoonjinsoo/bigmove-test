from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class FurnitureBase(BaseModel):
    name: str
    category: str
    subcategory: str
    base_price: float
    description: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    weight: Optional[float] = None

class FurnitureCreate(FurnitureBase):
    pass

class FurnitureUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    base_price: Optional[float] = None
    description: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    weight: Optional[float] = None

class FurnitureResponse(FurnitureBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FurnitureList(BaseModel):
    items: list[FurnitureResponse]
    total: int 

class FurnitureDetailResponse(BaseModel):
    id: str
    name: str
    description: str
    size: str
    category_id: str
    base_price: int

    class Config:
        from_attributes = True