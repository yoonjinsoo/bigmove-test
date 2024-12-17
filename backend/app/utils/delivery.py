from sqlalchemy.orm import Session
from ..models.delivery_booking import DeliveryBooking

async def check_time_slot_availability(
    db: Session,
    date: str,
    loading_time: str,
    unloading_time: str
) -> bool:
    # 해당 시간대의 예약 건수 확인
    loading_count = db.query(DeliveryBooking).filter(
        DeliveryBooking.date == date,
        DeliveryBooking.loading_time == loading_time
    ).count()
    
    unloading_count = db.query(DeliveryBooking).filter(
        DeliveryBooking.date == date,
        DeliveryBooking.unloading_time == unloading_time
    ).count()
    
    return loading_count < 100 and unloading_count < 100

def calculate_delivery_fee(delivery_option: str) -> int:
    base_fee = {
        "same-day": 50000,
        "next-day": 30000,
        "regular": 0
    }
    return base_fee.get(delivery_option, 0) 