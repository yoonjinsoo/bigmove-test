from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String)  # 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    message = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    additional_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="system_logs") 