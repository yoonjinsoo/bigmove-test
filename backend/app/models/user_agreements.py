from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class UserAgreements(Base):
    __tablename__ = "user_agreements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    terms = Column(Boolean, default=False)
    privacy = Column(Boolean, default=False)
    privacy_third_party = Column(Boolean, default=False)
    marketing = Column(Boolean, default=False)
    agreed_at = Column(DateTime, nullable=True)

    # Relationship
    user = relationship("User", back_populates="agreements")