from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import User
from ..schemas.warehouse import WarehouseCreate, WarehouseResponse, WarehouseUpdate
from ..utils.auth import get_current_user, check_admin_permission
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=WarehouseResponse)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """새로운 창고 등록 (관리자 전용)"""
    check_admin_permission(current_user)
    try:
        warehouse = container.warehouse_service.create_warehouse(
            db,
            name=warehouse_data.name,
            location=warehouse_data.location,
            capacity=warehouse_data.capacity,
            contact_info=warehouse_data.contact_info
        )
        return warehouse
    except Exception as e:
        logger.error(f"창고 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="창고 등록 중 오류가 발생했습니다")

@router.get("/{warehouse_id}/capacity", response_model=Dict[str, Any])
async def get_warehouse_capacity(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """창고 용량 상태 조회"""
    check_admin_permission(current_user)
    return container.warehouse_service.get_warehouse_capacity_status(db, warehouse_id)