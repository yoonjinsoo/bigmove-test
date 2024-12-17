from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Literal
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from ..database import get_db
from ..models.delivery import DeliveryTimeSlot, DeliveryAreaRestriction
from ..models.delivery_booking import DeliveryBooking
from ..schemas.delivery import (
    TimeSlotStatus,
    AvailableTimeSlotsResponse,
    DeliveryDateRequest,
    TemporaryBookingCreate,
    TemporaryBookingResponse,
    AvailableDatesResponse
)
from ..utils.auth import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/available-dates", response_model=AvailableDatesResponse)
async def get_available_dates(
    delivery_type: Literal['SAME_DAY', 'NEXT_DAY', 'REGULAR'],
    db: Session = Depends(get_db)
):
    """배송 타입에 따른 배송 가능한 날짜 목록 조회"""
    try:
        # 오늘부터 30일간의 날짜 범위 생성
        kr_now = datetime.now(ZoneInfo("Asia/Seoul"))
        start_date = kr_now.date()
        current_hour = kr_now.hour
        
        # 당일배송인 경우 오늘만 반환
        if delivery_type == 'SAME_DAY':
            # 14시 이후에는 당일 배송 불가능
            if current_hour >= 14:
                return AvailableDatesResponse(
                    success=True,
                    dates=[],
                    message="죄송합니다. 당일 배송은 14시까지만 가능합니다. 익일 배송이나 일반 배송을 이용해주세요."
                )
            date_range = [start_date.strftime('%Y-%m-%d')]
        # 익일배송인 경우 내일만 반환
        elif delivery_type == 'NEXT_DAY':
            tomorrow = start_date + timedelta(days=1)
            date_range = [tomorrow.strftime('%Y-%m-%d')]
        # 일반배송인 경우 30일치 반환
        else:
            date_range = [(start_date + timedelta(days=x)).strftime('%Y-%m-%d') for x in range(30)]
        
        return AvailableDatesResponse(
            success=True,
            dates=date_range,
            message="배송 가능 날짜 조회 성공"
        )
    except Exception as e:
        logger.error(f"배송 가능 날짜 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 가능 날짜 조회 중 오류가 발생했습니다")

@router.get("/delivery-slots/{delivery_type}", response_model=AvailableTimeSlotsResponse)
async def get_delivery_slots(
    delivery_type: Literal['SAME_DAY', 'NEXT_DAY', 'REGULAR'],
    date: str,
    db: Session = Depends(get_db)
):
    """배송 타입과 날짜에 따른 배송 가능 시간대 조회"""
    try:
        # 상차 시간대 설정 (9시, 12시, 15시, 17시)
        loading_base_hours = [9, 12, 15, 17]
        
        # 하차 시간대 설정 (12시, 15시, 18시, 20시)
        unloading_base_hours = [12, 15, 18, 20]
        
        # 현재 시간 (한국 시간)
        current_hour = datetime.now(ZoneInfo("Asia/Seoul")).hour
        
        if delivery_type == 'SAME_DAY':
            # 현재 시간이 14시 이후면 빈 배열 반환
            if current_hour >= 14:
                return AvailableTimeSlotsResponse(
                    success=True,
                    loading_times=[],
                    unloading_times=[],
                    message="오늘은 더 이상 예약 가능한 시간이 없습니다"
                )
            
            # 현재 시간 기준으로 가능한 가장 빠른 시간대 찾기
            next_available_hour = current_hour + 3
            
            # 상차 시간: 현재 시간 + 3시간 이후의 가장 가까운 시간대
            available_loading_hours = [hour for hour in loading_base_hours if hour >= next_available_hour]
            
            if not available_loading_hours:
                return AvailableTimeSlotsResponse(
                    success=True,
                    loading_times=[],
                    unloading_times=[],
                    message="오늘은 더 이상 예약 가능한 시간이 없습니다"
                )
            
            # 첫 번째 가능한 상차 시간 기준으로 3시간 이후의 하차 시간대 찾기
            first_available_loading = available_loading_hours[0]
            available_unloading_hours = [hour for hour in unloading_base_hours if hour >= (first_available_loading + 3)]
        else:
            available_loading_hours = loading_base_hours
            available_unloading_hours = unloading_base_hours

        # 상차 시간대 생성
        loading_times = [
            TimeSlotStatus(
                time=f"{hour:02d}:00",
                available=True,
                remaining_capacity=10
            )
            for hour in available_loading_hours
        ]

        # 하차 시간대 생성
        unloading_times = [
            TimeSlotStatus(
                time=f"{hour:02d}:00",
                available=True,
                remaining_capacity=10
            )
            for hour in available_unloading_hours
        ]
        
        return AvailableTimeSlotsResponse(
            success=True,
            loading_times=loading_times,
            unloading_times=unloading_times,
            message="배송 시간대 조회 성공"
        )
    except Exception as e:
        logger.error(f"배송 시간대 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="배송 시간대 조회 중 오류가 발생했습니다")

@router.post("/temporary-booking", response_model=TemporaryBookingResponse)
async def create_temporary_booking(
    booking: TemporaryBookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """배송 시간대 임시 예약"""
    try:
        # 임시 예약 생성
        temp_booking = DeliveryBooking(
            user_id=current_user.id,
            time_slot_id=booking.time_slot_id,
            status="temporary",
            expires_at=datetime.now(ZoneInfo("Asia/Seoul")) + timedelta(minutes=30)  # 30분 후 만료
        )
        
        db.add(temp_booking)
        db.commit()
        db.refresh(temp_booking)
        
        return TemporaryBookingResponse(
            booking_id=temp_booking.id,
            time_slot_id=temp_booking.time_slot_id,
            date=temp_booking.date,
            time=temp_booking.time,
            expires_at=temp_booking.expires_at
        )
    except Exception as e:
        db.rollback()
        logger.error(f"임시 예약 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="임시 예약 생성 중 오류가 발생했습니다")