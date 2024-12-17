from typing import Dict, Any
from fastapi import HTTPException

class OrderValidator:
    @staticmethod
    def validate_product_selection(data: Dict[str, Any]):
        """1단계: 상품 선택 데이터 검증"""
        required_fields = ['category', 'product', 'details']
        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"상품 선택 정보 누락: {field} 필드가 필요합니다"
                )
        
        if not data['category'] or not data['product']:
            raise HTTPException(
                status_code=400,
                detail="카테고리와 상품은 필수 선택사항입니다"
            )

    @staticmethod
    def validate_date_selection(data: Dict[str, Any]):
        """2단계: 날짜 선택 데이터 검증"""
        required_fields = ['date', 'loading_time', 'unloading_time']
        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"날짜 선택 정보 누락: {field} 필드가 필요합니다"
                )

    @staticmethod
    def validate_address_input(data: Dict[str, Any]):
        """3단계: 주소 정보 데이터 검증"""
        required_fields = ['loading_address', 'unloading_address']
        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"주소 정보 누락: {field} 필드가 필요합니다"
                )
        
        # 주소 세부 정보 검증
        address_fields = ['address', 'detail_address', 'postal_code']
        for address_type in ['loading_address', 'unloading_address']:
            for field in address_fields:
                if field not in data[address_type]:
                    raise HTTPException(
                        status_code=400,
                        detail=f"{address_type}의 {field} 정보가 필요합니다"
                    )

    @staticmethod
    def validate_additional_options(data: Dict[str, Any]):
        """4단계: 추가 옵션 데이터 검증"""
        if 'selected_options' not in data:
            raise HTTPException(
                status_code=400,
                detail="선택된 추가 옵션 정보가 필요합니다"
            ) 