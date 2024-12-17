from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True)
    category_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    base_price = Column(Integer, default=0)

    details = relationship("ItemDetail", back_populates="item")