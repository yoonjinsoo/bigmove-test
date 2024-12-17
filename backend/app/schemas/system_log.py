from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class SystemLogBase(BaseModel):
    level: str = Field(..., description="로그 레벨")
    message: str = Field(..., description="로그 메시지")
    user_id: Optional[int] = Field(None, description="관련 사용자 ID")
    additional_data: Optional[Dict[str, Any]] = Field(None, description="추가 데이터")

class SystemLogCreate(SystemLogBase):
    pass

class SystemLogResponse(SystemLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 