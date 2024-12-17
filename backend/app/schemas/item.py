from pydantic import BaseModel
from typing import Optional

class ItemBase(BaseModel):
    id: str
    categoryId: str
    name: str
    description: str
    basePrice: float

class ItemResponse(ItemBase):
    class Config:
        from_attributes = True

class FurnitureDetailResponse(BaseModel):
    id: str
    name: str
    description: str
    size: str
    category_id: str
    base_price: float

    class Config:
        from_attributes = True 