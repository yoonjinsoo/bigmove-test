from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class ShippingOrder(Base):
    __tablename__ = "shipping_orders"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    company_id = Column(Integer, ForeignKey("shipping_companies.id"))
    from_address_id = Column(Integer, ForeignKey("addresses.id"))
    to_address_id = Column(Integer, ForeignKey("addresses.id"))
    driver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    tracking_number = Column(String, unique=True)
    current_location = Column(String, nullable=True)
    estimated_delivery = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="shipping_orders")
    company = relationship("ShippingCompany", back_populates="shipping_orders")
    from_address = relationship("Address", foreign_keys=[from_address_id])
    to_address = relationship("Address", foreign_keys=[to_address_id])
    driver = relationship("User", foreign_keys=[driver_id])
    review = relationship("Review", back_populates="shipping_order", uselist=False)
