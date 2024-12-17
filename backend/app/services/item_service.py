from sqlalchemy.orm import Session
import pandas as pd
from pathlib import Path

class ItemService:
    def __init__(self, db: Session):
        self.db = db
        self.csv_path = Path(__file__).parent.parent.parent / 'data' / 'furniture_data.csv'
        self.df = pd.read_csv(self.csv_path)

    def get_item_details(self, category_id: str, item_id: str):
        print(f"Looking for item details in CSV. category_id: {category_id}, item_id: {item_id}")
        print(f"Available IDs in CSV: {self.df['id'].tolist()}")
        
        # 선택된 아이템의 subcategory 찾기
        try:
            selected_item = self.df[self.df['id'] == item_id].iloc[0]
        except IndexError:
            print(f"No item found with id: {item_id}")
            return []
        
        subcategory = selected_item['subcategory']
        
        # 같은 subcategory의 모든 옵션 가져오기
        related_items = self.df[
            (self.df['category'] == selected_item['category']) & 
            (self.df['subcategory'] == subcategory)
        ]
        
        # 상세 정보 리스트 구성
        details = []
        for _, item in related_items.iterrows():
            details.append({
                'id': item['id'],
                'name': item['name'],
                'description': item['description'],
                'base_price': item['base_price']
            })
        
        return details 