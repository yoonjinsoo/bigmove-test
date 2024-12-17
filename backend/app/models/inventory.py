from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    furniture_id = Column(String, ForeignKey("furniture.id"))
    quantity = Column(Integer, default=0)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    min_quantity = Column(Integer, default=0)
    status = Column(String, default="available")
    unit_price = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    furniture = relationship("Furniture", back_populates="inventory_items")
    warehouse = relationship("Warehouse", back_populates="inventory_items")