from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import os
from ..models.furniture import Furniture
from ..schemas.furniture import FurnitureDetailResponse
import logging
from ..services.furniture_service import FurnitureService

logger = logging.getLogger(__name__)

class FurnitureDetailService:
    def get_item_details(self, db: Session, category_id: str, item_name: str) -> List[FurnitureDetailResponse]:
        """상품 상세 옵션 조회"""
        try:
            logger.info(f"상세 정보 조회 요청 - 카테고리: {category_id}, 아이템: {item_name}")
            
            # item_name에서 인덱스 추출
            index = int(item_name.split('-')[-1])
            logger.info(f"추출된 인덱스: {index}")
            
            # furniture_service에서 카테고리 아이템 목록 가져오기
            furniture_service = FurnitureService()
            items = furniture_service.get_items_by_category(db, category_id)
            logger.info(f"조회된 아이템 수: {len(items)}")
            
            if not items or index > len(items):
                logger.warning(f"아이템을 찾을 수 없음 - 인덱스: {index}, 전체 아이템 수: {len(items)}")
                return []
            
            selected_item = items[index - 1]
            subcategory = selected_item['name']
            base_price = selected_item['basePrice']
            logger.info(f"선택된 아이템 - 서브카테고리: {subcategory}, 기본가격: {base_price}")
            
            # 상세 옵션 생성
            if '침대' in subcategory:
                options = ['싱글', '더블', '퀸', '킹']
                multipliers = [1.0, 1.3, 1.5, 1.8]
            elif '소파' in subcategory or '쇼파' in subcategory:
                options = ['1인용', '2인용', '3인용']
                multipliers = [1.0, 1.4, 1.8]
            else:
                options = ['소형', '중형', '대형']
                multipliers = [1.0, 1.3, 1.6]
            
            return [
                FurnitureDetailResponse(
                    id=f"{item_name}-{idx}",
                    name=f"{option} {subcategory}",
                    description=f"{subcategory} {option}형",
                    size=option,
                    category_id=category_id,
                    base_price=base_price * multiplier
                ) for idx, (option, multiplier) in enumerate(zip(options, multipliers), 1)
            ]
            
        except Exception as e:
            logger.error(f"상세 정보 조회 중 오류 발생: {str(e)}")
            return []