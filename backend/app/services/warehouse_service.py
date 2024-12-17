from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from datetime import datetime
from ..models.warehouse import Warehouse
from ..models.inventory import Inventory
from sqlalchemy import func

class WarehouseService:
    def create_warehouse(
        self, 
        db: Session, 
        name: str,
        location: str,
        capacity: int,
        contact_info: Optional[str] = None
    ) -> Warehouse:
        try:
            new_warehouse = Warehouse(
                name=name,
                location=location,
                capacity=capacity,
                contact_info=contact_info,
                status='active',
                created_at=datetime.utcnow()
            )
            db.add(new_warehouse)
            db.commit()
            db.refresh(new_warehouse)
            return new_warehouse
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"창고 생성 중 오류가 발생했습니다: {str(e)}")

    def get_warehouse_capacity_status(self, db: Session, warehouse_id: int) -> Dict[str, Any]:
        try:
            warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
            if not warehouse:
                raise HTTPException(status_code=404, detail="창고를 찾을 수 없습니다")
            
            total_items = db.query(Inventory).filter(
                Inventory.warehouse_id == warehouse_id
            ).with_entities(func.sum(Inventory.quantity)).scalar() or 0
            
            return {
                'warehouse_name': warehouse.name,
                'total_capacity': warehouse.capacity,
                'current_usage': total_items,
                'available_space': warehouse.capacity - total_items,
                'usage_percentage': (total_items / warehouse.capacity * 100) if warehouse.capacity > 0 else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"창고 상태 조회 중 오류가 발생했습니다: {str(e)}")

    def get_all_warehouses(self, db: Session) -> List[Warehouse]:
        return db.query(Warehouse).filter(Warehouse.status == 'active').all() 