from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    shipping_order_id = Column(Integer, ForeignKey("shipping_orders.id"))
    rating = Column(Float)
    service_rating = Column(Float)
    driver_rating = Column(Float)
    price_rating = Column(Float)
    comment = Column(String, nullable=True)
    detailed_feedback = Column(JSON, nullable=True)
    photos = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")
    shipping_order = relationship("ShippingOrder", back_populates="review")

