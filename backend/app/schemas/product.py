from pydantic import BaseModel
from typing import List, Optional

class ProductVariantBase(BaseModel):
    id: int
    name: str
    base_price: Optional[int]
    additional_info: Optional[str]

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    id: int
    name: str
    variants: List[ProductVariantBase] = []

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    id: int
    name: str
    products: List[ProductBase] = []

    class Config:
        from_attributes = True
