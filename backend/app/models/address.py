from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="addresses")
    shipping_orders_from = relationship("ShippingOrder", foreign_keys="[ShippingOrder.from_address_id]", back_populates="from_address")
    shipping_orders_to = relationship("ShippingOrder", foreign_keys="[ShippingOrder.to_address_id]", back_populates="to_address")

