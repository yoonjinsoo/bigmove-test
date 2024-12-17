from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class PriceCalculator:
    def __init__(self):
        # 기본 요금 설정
        self.BASE_PRICES = {
            "small": 50000,    # 소형 이사
            "medium": 100000,  # 중형 이사
            "large": 150000    # 대형 이사
        }
        
        # 거리별 추가 요금
        self.DISTANCE_FEES = {
            "base": 20000,      # 기본 20km 이내
            "per_km": 1000      # km당 추가 요금
        }
        
        # 날짜/시간대별 할증
        self.TIME_SURCHARGES = {
            "weekend": 1.2,     # 주말 20% 할증
            "holiday": 1.3,     # 공휴일 30% 할증
            "night": 1.2        # 야간 20% 할증
        }

    def calculate_total_price(self, order_data: Dict[str, Any]) -> float:
        try:
            total_price = 0.0
            
            # 1. 기본 요금 계산 (상품 선택 기반)
            product_data = order_data.get('product_selection', {})
            category = product_data.get('category', 'small')
            total_price += self.BASE_PRICES.get(category, self.BASE_PRICES['small'])
            
            # 2. 거리 추가 요금
            address_data = order_data.get('address_input', {})
            distance_fee = self._calculate_distance_fee(address_data)
            total_price += distance_fee
            
            # 3. 날짜/시간 할증
            date_data = order_data.get('date_selection', {})
            surcharge = self._calculate_time_surcharge(date_data)
            total_price *= surcharge
            
            # 4. 추가 옵션 요금
            options_data = order_data.get('additional_options', {})
            options_fee = self._calculate_options_fee(options_data)
            total_price += options_fee
            
            return round(total_price)  # 원 단위로 반올림
            
        except Exception as e:
            logger.error(f"가격 계산 중 오류 발생: {str(e)}")
            return 0.0

    def _calculate_distance_fee(self, address_data: Dict[str, Any]) -> float:
        try:
            distance = address_data.get('distance_km', 0)
            if distance <= 20:  # 기본 20km 이내
                return self.DISTANCE_FEES['base']
            else:
                extra_distance = distance - 20
                return self.DISTANCE_FEES['base'] + (extra_distance * self.DISTANCE_FEES['per_km'])
        except Exception as e:
            logger.error(f"거리 요금 계산 중 오류: {str(e)}")
            return 0.0

    def _calculate_time_surcharge(self, date_data: Dict[str, Any]) -> float:
        try:
            surcharge = 1.0
            if date_data.get('is_weekend'):
                surcharge *= self.TIME_SURCHARGES['weekend']
            if date_data.get('is_holiday'):
                surcharge *= self.TIME_SURCHARGES['holiday']
            if date_data.get('is_night'):
                surcharge *= self.TIME_SURCHARGES['night']
            return surcharge
        except Exception as e:
            logger.error(f"시간 할증 계산 중 오류: {str(e)}")
            return 1.0

    def _calculate_options_fee(self, options_data: Dict[str, Any]) -> float:
        try:
            total_options_fee = 0.0
            selected_options = options_data.get('selected_options', [])
            
            for option in selected_options:
                option_price = option.get('price', 0)
                quantity = option.get('quantity', 1)
                total_options_fee += option_price * quantity
                
            return total_options_fee
        except Exception as e:
            logger.error(f"옵션 요금 계산 중 오류: {str(e)}")
            return 0.0 