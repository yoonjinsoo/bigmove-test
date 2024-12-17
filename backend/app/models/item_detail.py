from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ItemDetail(Base):
    __tablename__ = "item_details"

    id = Column(String, primary_key=True)
    item_id = Column(String, ForeignKey("items.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    size = Column(String)
    condition = Column(String)
    additional_notes = Column(String)
    price_modifier = Column(Float, default=0.0)

    item = relationship("Item", back_populates="details") 