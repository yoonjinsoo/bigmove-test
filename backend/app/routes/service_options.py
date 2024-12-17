from fastapi import APIRouter, Depends
from ..services.service_options_service import ServiceOptionsService
from ..schemas.service_options import ServiceOptionsResponse, SelectedOptions

router = APIRouter(tags=["service_options"])

@router.get("", response_model=ServiceOptionsResponse)
async def get_service_options():
    service = ServiceOptionsService()
    return service.get_all_options()

@router.post("/calculate")
async def calculate_total_fee(selected_options: SelectedOptions):
    # 선택된 옵션들의 총 금액 계산 로직
    service = ServiceOptionsService()
    all_options = service.get_all_options()
    
    total_fee = 0
    
    # 층수 옵션 요금 계산
    if selected_options.floor_option_id:
        floor_option = next(
            (opt for opt in all_options.floor_options if opt.id == selected_options.floor_option_id),
            None
        )
        if floor_option and floor_option.fee:
            total_fee += floor_option.fee
    
    # 사다리차 옵션 요금 계산
    if selected_options.ladder_option_id:
        ladder_option = next(
            (opt for opt in all_options.ladder_options if opt.id == selected_options.ladder_option_id),
            None
        )
        if ladder_option and ladder_option.fee:
            total_fee += ladder_option.fee
    
    return {"total_fee": total_fee} 