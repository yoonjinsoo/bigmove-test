from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    items = Column(JSON)
    from_address_id = Column(Integer, ForeignKey("addresses.id"))
    to_address_id = Column(Integer, ForeignKey("addresses.id"))
    additional_options = Column(JSON, nullable=True)
    shipping_company_id = Column(Integer, ForeignKey("shipping_companies.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="orders")
    shipping_orders = relationship("ShippingOrder", back_populates="order")
    from_address = relationship("Address", foreign_keys=[from_address_id])
    to_address = relationship("Address", foreign_keys=[to_address_id])
    shipping_company = relationship("ShippingCompany")
    payment = relationship("Payment", back_populates="order", uselist=False)
    reviews = relationship("Review", back_populates="order")
