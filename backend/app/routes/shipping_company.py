from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..services.shipping_company_service import ShippingCompanyService
from ..models.shipping_company import ShippingCompany
from ..utils.auth import get_current_user

router = APIRouter()
shipping_company_service = ShippingCompanyService()

@router.post("/companies")
async def create_shipping_company(
    name: str,
    api_key: str,
    contact_info: Dict[str, Any],
    db: Session = Depends(get_db)
):
    return shipping_company_service.add_company(db, name, api_key, contact_info)
