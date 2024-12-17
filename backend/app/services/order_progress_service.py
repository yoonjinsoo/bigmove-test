from fastapi import HTTPException
from typing import Dict, Any, Optional
from ..models.order_progress import OrderProgress
from .validators.order_validator import OrderValidator
from .price_calculator import PriceCalculator
import logging

logger = logging.getLogger(__name__)

class OrderProgressService:
    def __init__(self):
        self.STEPS = ['product_selection', 'date_selection', 'address_input', 'additional_options']
        self.validator = OrderValidator()

    async def save_step_data(
        self,
        user_id: int,
        step: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            # 데이터 검증
            validation_method = getattr(self.validator, f'validate_{step}')
            validation_method(data)

            # 이전 단계 완료 여부 확인
            current_progress = await self.get_progress(user_id) or {}
            step_index = self.STEPS.index(step)
            if step_index > 0:
                previous_step = self.STEPS[step_index - 1]
                if previous_step not in current_progress:
                    raise HTTPException(
                        status_code=400,
                        detail=f"이전 단계 ({previous_step}) 완료 필요"
                    )

            return data

        except Exception as e:
            logger.error(f"단계 데이터 저장 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"데이터 저장 실패: {str(e)}")

    async def get_progress(
        self,
        user_id: int
    ) -> Optional[Dict[str, Any]]:
        try:
            return None
        except Exception as e:
            logger.error(f"진행상황 조회 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"진행상황 조회 실패: {str(e)}")

    async def calculate_current_price(
        self,
        user_id: int
    ) -> float:
        try:
            current_progress = await self.get_progress(user_id)
            if not current_progress:
                return 0.0
                
            calculator = PriceCalculator()
            total_price = calculator.calculate_total_price(current_progress)
            return total_price
            
        except Exception as e:
            logger.error(f"가격 계산 중 오류 발생: {str(e)}")
            return 0.0 