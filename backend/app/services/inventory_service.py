from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from datetime import datetime
from ..models.inventory import Inventory
from ..models.furniture import Furniture

class InventoryService:
    def add_inventory_item(
        self, 
        db: Session, 
        furniture_id: int,
        quantity: int,
        warehouse_id: int,
        min_quantity: int = 0
    ) -> Inventory:
        try:
            new_item = Inventory(
                furniture_id=furniture_id,
                quantity=quantity,
                warehouse_id=warehouse_id,
                min_quantity=min_quantity,
                last_updated=datetime.utcnow()
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            return new_item
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"재고 추가 중 오류가 발생했습니다: {str(e)}")

    def update_inventory_quantity(
        self, 
        db: Session, 
        inventory_id: int, 
        quantity_change: int
    ) -> Inventory:
        try:
            inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
            if not inventory:
                raise HTTPException(status_code=404, detail="재고 항목을 찾을 수 없습니다")
            
            new_quantity = inventory.quantity + quantity_change
            if new_quantity < 0:
                raise HTTPException(status_code=400, detail="재고가 부족합니다")
            
            inventory.quantity = new_quantity
            inventory.last_updated = datetime.utcnow()
            
            db.commit()
            db.refresh(inventory)
            return inventory
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"재고 수정 중 오류가 발생했습니다: {str(e)}")

    def check_low_inventory(self, db: Session) -> List[Dict[str, Any]]:
        try:
            low_inventory_items = db.query(Inventory).join(Furniture).filter(
                Inventory.quantity <= Inventory.min_quantity
            ).all()
            
            return [{
                'inventory_id': item.id,
                'furniture_name': item.furniture.name,
                'current_quantity': item.quantity,
                'min_quantity': item.min_quantity,
                'warehouse_id': item.warehouse_id
            } for item in low_inventory_items]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"재고 확인 중 오류가 발생했습니다: {str(e)}") 