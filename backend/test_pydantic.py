from pydantic import BaseModel
from pydantic_settings import BaseSettings

# Pydantic 모델 정의
class Item(BaseModel):
    name: str
    price: float

# Pydantic Settings 클래스 정의
class Settings(BaseSettings):
    app_name: str
    app_version: str

# 테스트 데이터 생성
item = Item(name="Test Item", price=10.99)
print(item)

# 설정 데이터 생성
settings = Settings(app_name="My App", app_version="1.0.0")
print(settings)
