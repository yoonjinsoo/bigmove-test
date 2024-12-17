from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 데이터베이스 테이블 생성 함수
def create_tables():
    Base.metadata.create_all(bind=engine)

def init_db():
    # 모든 모델을 임포트하여 Base.metadata에 등록
    from .models.furniture import Furniture
    from .models.order import Order
    from .models.review import Review
    from .models.user import User
    from .models.address import Address
    from .models.quote import Quote
    from .models.shipping_order import ShippingOrder
    from .models.notification import Notification
    from .models.system_log import SystemLog
    from .models.inventory import Inventory
    from .models.warehouse import Warehouse
    from .models.delivery_booking import DeliveryBooking
    
    # 테이블 생성
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()