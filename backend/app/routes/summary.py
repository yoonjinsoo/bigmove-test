from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Optional
from app.services.session_service import SessionService
from app.services.user_service import UserService

router = APIRouter()

@router.get("/api/summary")
async def get_summary(
    session_id: Optional[str] = Header(None, alias="Session-ID"),
    user_id: Optional[int] = Header(None),
    session_service: SessionService = Depends(),
    user_service: UserService = Depends()
):
    if user_id:
        return await user_service.get_order_summary(user_id)
    elif session_id:
        return await session_service.get_session_data(session_id)
    else:
        raise HTTPException(status_code=400, detail="세션 ID 또는 사용자 ID가 필요합니다") 