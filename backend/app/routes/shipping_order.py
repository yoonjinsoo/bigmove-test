from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..services.shipping_order_service import ShippingOrderService
from ..models.shipping_order import ShippingOrder
from ..utils.auth import get_current_user

router = APIRouter()
shipping_order_service = ShippingOrderService()

@router.post("/orders")
async def create_shipping_order(
    order_id: int,
    company_id: int,
    from_address_id: int,
    to_address_id: int,
    db: Session = Depends(get_db)
):
    return shipping_order_service.create_shipping_order(
        db=db,
        order_id=order_id,
        company_id=company_id,
        from_address_id=from_address_id,
        to_address_id=to_address_id
    )
