from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import Quote
from ..utils.price_calculator import PriceCalculator
from fastapi import HTTPException

class QuoteService:
    def __init__(self):
        self.price_calculator = PriceCalculator()

    async def create_quote(
        self,
        db: Session,
        user_id: int,
        items: List[Dict[str, Any]],
        from_address_id: int,
        to_address_id: int,
        floor_info: Dict[str, Any],
        special_requirements: Optional[Dict[str, Any]] = None
    ) -> Quote:
        try:
            price_details = self.price_calculator.calculate_total_price({
                'items': items,
                'from_address_id': from_address_id,
                'to_address_id': to_address_id,
                'floor_info': floor_info,
                'special_requirements': special_requirements
            })

            quote = Quote(
                user_id=user_id,
                furniture_details=items,
                floor_info=floor_info,
                special_requirements=special_requirements,
                **price_details,
                valid_until=datetime.utcnow() + timedelta(days=7)
            )

            db.add(quote)
            db.commit()
            db.refresh(quote)
            return quote

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"견적 생성 중 오류가 발생했습니다: {str(e)}")