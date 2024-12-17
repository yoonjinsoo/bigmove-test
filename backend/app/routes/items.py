from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
import pandas as pd
from pathlib import Path

router = APIRouter(prefix="/categories/{category_id}/items", tags=["items"])

@router.get("/{item_id}/details")
async def get_item_details(category_id: str, item_id: str, db: Session = Depends(get_db)):
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
        
        return details
        
    except Exception as e:
        print(f"Error: {str(e)}")  # 로깅 추가
        raise HTTPException(status_code=404, detail="Item details not found")