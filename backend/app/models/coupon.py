from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from ..database import Base
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code = Column(String, unique=True, index=True)
    amount = Column(Integer)
    expiry_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow) 