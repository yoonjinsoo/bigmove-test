from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.product_service import ProductService
from app.schemas.product import CategoryBase, ProductBase, ProductVariantBase

router = APIRouter()

@router.get("/categories", response_model=List[CategoryBase])
async def get_categories(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_categories()

@router.get("/categories/{category_id}/products", response_model=List[ProductBase])
async def get_products(category_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_products(category_id)

@router.get("/products/{product_id}/variants", response_model=List[ProductVariantBase])
async def get_variants(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_variants(product_id)
