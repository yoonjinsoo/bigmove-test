from fastapi import HTTPException
from sqlalchemy.orm import Session
import pandas as pd
from typing import List, Dict, Any
from ..models.furniture import Furniture
import logging
import os
import chardet
from ..schemas.furniture import FurnitureDetailResponse
from ..schemas.item import ItemResponse

logger = logging.getLogger(__name__)

class FurnitureService:
    def import_csv_data(self, db: Session):
        """CSV 파일에서 가구 데이터를 임포트"""
        try:
            current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            csv_path = os.path.join(current_dir, 'data', 'furniture_data.csv')
            
            print(f"현재 디렉토리: {current_dir}")
            print(f"CSV 파일 경로: {csv_path}")
            
            if not os.path.exists(csv_path):
                raise FileNotFoundError(f"CSV 파일을 찾을 수 없습니다: {csv_path}")
            
            df = pd.read_csv(csv_path, encoding='utf-8-sig')
            
            # 중복 ID 체크 및 제거
            df = df.drop_duplicates(subset=['id'], keep='first')
            
            # 기존 데이터 삭제
            db.query(Furniture).delete()
            db.commit()  # 삭제 후 즉시 커밋
            
            # 데이터 검증 및 삽입
            for _, row in df.iterrows():
                if pd.isna(row['id']) or pd.isna(row['name']):
                    continue
                    
                price_type = 'contact' if float(row['base_price']) == 0 else 'fixed'
                furniture = Furniture(
                    id=str(row['id']).strip(),  # 공백 제거
                    category=str(row['category']).strip() if not pd.isna(row['category']) else None,
                    subcategory=str(row['subcategory']).strip() if not pd.isna(row['subcategory']) else None,
                    name=str(row['name']).strip(),
                    description=str(row['description']).strip() if not pd.isna(row['description']) else None,
                    base_price=float(row['base_price']),
                    price_type=price_type
                )
                db.add(furniture)
            
            db.commit()
            logger.info("가구 데이터 임포트 완료")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"가구 데이터 임포트 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail="데이터 임포트 중 오류가 발생했습니다")

    def get_items_by_category(self, category_id: str, db: Session):
        """카테고리별 대표 상품 조회"""
        category_mapping = {
            'bedroom-living': ['침대', '쇼파', '옷장', '행거', '수납장', '식탁', '화장대', '커튼', '거울'],
            'study': ['책상', '의자', '책장'],
            'digital-appliances': ['TV/모니터', 'PC/노트북', '에어컨', '세탁기', '냉장고', '건조기', 
                                 '공기청정기', '의류관리기', '청소기'],
            'kitchen': ['식기세척기', '음식물처리기', '정수기', '가스레인지', '주방 테이블', '식탁 의자'],
            'exercise-transport': ['자전거', '킥보드', '스쿠터', '전동차'],
            'etc': ['운동용품', '화분', '안마의자', '캣타워', '유모차', '빨래 건조대']
        }
        
        try:
            items = []
            subcategories = category_mapping.get(category_id, [])
            
            base_prices = {
                'bedroom-living': 500000,
                'study': 300000,
                'digital-appliances': 1000000,
                'kitchen': 800000,
                'exercise-transport': 400000,
                'etc': 200000
            }
            
            for idx, name in enumerate(subcategories, 1):
                item = ItemResponse(
                    id=f"{category_id}-{idx}",
                    categoryId=category_id,
                    name=name,
                    description=f"{name} 기본형",
                    basePrice=float(base_prices[category_id])
                )
                items.append(item)
            
            return items
        except Exception as e:
            logger.error(f"카테고리 {category_id}의 아이템 조회 중 오류 발생: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"아이템 조회 중 오류가 발생했습니다: {str(e)}"
            )