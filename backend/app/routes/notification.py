from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..schemas.notification import NotificationResponse, NotificationUpdate
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """사용자의 알림 목록 조회"""
    try:
        notifications = container.notification_service.get_user_notifications(
            db, current_user.id, skip, limit
        )
        return notifications
    except Exception as e:
        logger.error(f"알림 목록 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="알림 목록을 불러오는 중 오류가 발생했습니다")

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """알림을 읽음 상태로 변경"""
    try:
        notification = container.notification_service.mark_as_read(
            db, notification_id, current_user.id
        )
        return notification
    except Exception as e:
        logger.error(f"알림 상태 업데이트 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="알림 상태 업데이트 중 오류가 발생했습니다")

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    container = Depends(get_service_container)
):
    """알림 삭제"""
    try:
        container.notification_service.delete_notification(db, notification_id, current_user.id)
        return {"message": "알림이 삭제되었습니다"}
    except Exception as e:
        logger.error(f"알림 삭제 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="알림 삭제 중 오류가 발생했습니다") 