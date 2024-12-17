import sys
import os
from pathlib import Path

# 백엔드 앱 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.services.furniture_service import FurnitureService

def init_furniture_data():
    # 데이터베이스 초기화
    init_db()
    
    db = SessionLocal()
    try:
        service = FurnitureService()
        success = service.import_csv_data(db)
        if success:
            print("가구 데이터 초기화 완료")
        else:
            print("가구 데이터 초기화 실패")
    except Exception as e:
        print(f"오류 발생: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    init_furniture_data() 