from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from app.schemas.user import UserRole
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String, nullable=True)
    provider = Column(String, nullable=True)
    provider_id = Column(String, nullable=True)
    role = Column(String, default="USER")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agreements = relationship("UserAgreements", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user")
    orders = relationship("Order", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    quotes = relationship("Quote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    system_logs = relationship("SystemLog", back_populates="user")

class UserAgreements(Base):
    __tablename__ = "user_agreements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    terms = Column(Boolean, nullable=False)
    privacy = Column(Boolean, nullable=False)
    privacy_third_party = Column(Boolean, nullable=False)
    marketing = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 명시적으로 제약 조건 이름 지정
    __table_args__ = (
        UniqueConstraint('user_id', name='uq_user_agreements_user_id'),
    )

    # Relationship
    user = relationship("User", back_populates="agreements")

