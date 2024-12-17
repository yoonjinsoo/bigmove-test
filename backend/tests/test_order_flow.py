import sys
import os
from pathlib import Path

# 백엔드 디렉토리를 Python 경로에 추가
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_complete_order_flow():
    # 테스트 데이터 세트
    test_data = {
        "product_selection": {
            "category": "medium",
            "product": "가정이사",
            "details": {
                "items": ["침대", "책상", "의자"]
            }
        },
        "date_selection": {
            "date": "2024-03-20",
            "loading_time": "10:00",
            "unloading_time": "14:00"
        },
        "address_input": {
            "loading_address": {
                "address": "서울시 강남구",
                "detail_address": "123-45",
                "postal_code": "12345"
            },
            "unloading_address": {
                "address": "서울시 서초구",
                "detail_address": "67-89",
                "postal_code": "67890"
            }
        },
        "additional_options": {
            "selected_options": [
                {"name": "사다리차", "price": 50000},
                {"name": "포장", "price": 30000}
            ]
        }
    }

    try:
        # 전체 프로세스 테스트
        for step, data in test_data.items():
            print(f"\n{step} 테스트 시작...")
            response = client.post(
                f"/api/orders/progress/{step}",
                json=data
            )
            print(f"{step} 응답:", response.json())
            assert response.status_code == 200

        # 최종 요약 확인
        print("\n주문 요약 조회 중...")
        summary = client.get("/api/orders/summary")
        print("주문 요약:", json.dumps(summary.json(), indent=2, ensure_ascii=False))
        
        # 주문 확정
        print("\n주문 확정 중...")
        confirm = client.post("/api/orders/confirm")
        print("주문 확정:", confirm.json())

    except Exception as e:
        print(f"\n오류 발생: {str(e)}")
        raise

if __name__ == "__main__":
    test_complete_order_flow() 