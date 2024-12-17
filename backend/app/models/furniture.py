from sqlalchemy import Column, Float, String
from sqlalchemy.orm import relationship
from ..database import Base

class Furniture(Base):
    __tablename__ = "furniture"

    id = Column(String, primary_key=True)
    category = Column(String)
    subcategory = Column(String)
    name = Column(String)
    description = Column(String)
    base_price = Column(Float)
    price_type = Column(String)  # 'fixed' 또는 'contact'

    # Relationships
    inventory_items = relationship("Inventory", back_populates="furniture")
