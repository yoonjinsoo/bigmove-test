from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from app.schemas.item import ItemResponse, ItemBase, FurnitureDetailResponse
from app.services.furniture_service import FurnitureService
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.service_container import get_service_container
import logging
import pandas as pd
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/items")
async def get_all_category_items(
    db: Session = Depends(get_db),
    container = Depends(get_service_container)
) -> Dict[str, List[ItemBase]]:
    categories = [
        "bedroom-living", "kitchen", "study", "etc", 
        "digital-appliances", "exercise-transport"
    ]
    result = {}
    for category in categories:
        try:
            items = container.furniture_service.get_items_by_category(category, db)
            result[category] = items
        except Exception:
            result[category] = []
    return result

@router.get("/{category_id}/items")
async def get_items(category_id: str, db: Session = Depends(get_db)):
    df = pd.read_csv('data/furniture_data.csv')
    
    # category로 필터링하고 subcategory로 그룹화
    category_items = df[df['category'] == category_id]
    grouped_items = category_items.groupby('subcategory').first().reset_index()
    
    items = []
    for _, row in grouped_items.iterrows():
        items.append({
            "id": row['id'],  # CSV 파일의 실제 id 사용
            "name": row['subcategory'],  # subcategory를 name으로 사용
            "description": row['description'],
            "base_price": row['base_price']
        })
    
    return items

@router.get("/{category_id}/items/{item_name}", response_model=List[FurnitureDetailResponse])
async def get_item_details(
    category_id: str,
    item_name: str,
    db: Session = Depends(get_db),
    container = Depends(get_service_container)
):
    try:
        return container.furniture_detail_service.get_item_details(db, category_id, item_name)
    except Exception as e:
        logger.error(f"상품 상세 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="상품 상세 정보를 불러오는 중 오류가 발생했습니다")

@router.get("/{category_id}/items/{item_id}/details")
async def get_item_details(category_id: str, item_id: str):
    try:
        csv_path = Path(__file__).parent.parent.parent / 'data' / 'furniture_data.csv'
        df = pd.read_csv(csv_path)
        
        # 선택된 아이템의 subcategory 찾기
        selected_item = df[df['id'] == item_id].iloc[0]
        subcategory = selected_item['subcategory']
        
        # 같은 subcategory의 모든 옵션 가져오기
        related_items = df[
            (df['category'] == category_id) & 
            (df['subcategory'] == subcategory)
        ]
        
        details = []
        for _, item in related_items.iterrows():
            details.append({
                'id': item['id'],
                'name': item['name'],
                'description': item['description'],
                'base_price': float(item['base_price'])
            })
        
        if not details:
            raise HTTPException(status_code=404, detail="No details found")
            
        return details
        
    except Exception as e:
        print(f"Error: {str(e)}")  # 로깅 추가
        raise HTTPException(status_code=404, detail="Item details not found")

