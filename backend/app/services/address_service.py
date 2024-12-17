from sqlalchemy.orm import Session
from ..models.address import Address
from fastapi import HTTPException
from typing import List, Optional, Dict
from datetime import datetime
import math
import requests
from ..config import KAKAO_API_KEY

class AddressService:
    def __init__(self):
        self.kakao_api_key = KAKAO_API_KEY
        
    def add_address(
        self, 
        db: Session, 
        user_id: int, 
        address: str, 
        latitude: float, 
        longitude: float
    ) -> Address:
        try:
            new_address = Address(
                user_id=user_id,
                address=address,
                latitude=latitude,
                longitude=longitude,
                created_at=datetime.utcnow()
            )
            db.add(new_address)
            db.commit()
            db.refresh(new_address)
            return new_address
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"주소 추가 중 오류가 발생했습니다: {str(e)}")

    def get_address(self, db: Session, address_id: int) -> Optional[Address]:
        address = db.query(Address).filter(Address.id == address_id).first()
        if not address:
            raise HTTPException(status_code=404, detail="주소를 찾을 수 없습니다")
        return address

    def calculate_distance(self, address1: Address, address2: Address) -> float:
        R = 6371  # 지구의 반경 (km)
        lat1, lon1 = math.radians(address1.latitude), math.radians(address1.longitude)
        lat2, lon2 = math.radians(address2.latitude), math.radians(address2.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return round(distance, 2) 

    def search_address(self, query: str) -> List[Dict]:
        """카카오 주소 검색 API를 사용하여 주소 검색"""
        headers = {
            'Authorization': f'KakaoAK {self.kakao_api_key}'
        }
        
        response = requests.get(
            'https://dapi.kakao.com/v2/local/search/address',
            headers=headers,
            params={'query': query}
        )
        
        if response.status_code == 200:
            return response.json()['documents']
        return []
        
    def save_delivery_addresses(self, order_id: str, from_address: str, to_address: str) -> Dict:
        """배송 주소 정보 저장"""
        # DB에 주소 정보 저장
        order = self.db.orders.update_one(
            {'_id': order_id},
            {
                '$set': {
                    'from_address': from_address,
                    'to_address': to_address,
                    'updated_at': datetime.now()
                }
            }
        )
        return {'success': True}
        
    def get_delivery_addresses(self, order_id: str) -> Dict:
        """주문의 배송 주소 정보 조회"""
        order = self.db.orders.find_one({'_id': order_id})
        if order:
            return {
                'from_address': order.get('from_address'),
                'to_address': order.get('to_address')
            }
        return None