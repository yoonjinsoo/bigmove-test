from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..services.furniture_service import FurnitureService
from ..services.order_service import OrderService
from ..services.payment_service import PaymentService
from ..services.shipping_company_service import ShippingCompanyService
from ..services.shipping_order_service import ShippingOrderService
from ..services.address_service import AddressService
from ..services.review_service import ReviewService
from ..services.performance_analysis_service import PerformanceAnalysisService
from ..services.dashboard_service import DashboardService
from ..services.quote_service import QuoteService
from ..utils.auth import get_current_user
from ..core.service_container import get_service_container, ServiceContainer
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 서비스 컨테이너 의존성 주입 메서드
def get_services(container: ServiceContainer = Depends(get_service_container)):
    """
    서비스 컨테이너 인스턴스를 반환합니다.
    새로운 엔드포인트는 이 메서드를 통해 서비스를 주입받아야 합니다.
    """
    return container

# 기존 서비스 인스턴스 유지 (하위 호환성)
furniture_service = FurnitureService()
order_service = OrderService()
payment_service = PaymentService()
shipping_company_service = ShippingCompanyService()
shipping_order_service = ShippingOrderService()
address_service = AddressService()

# TODO: 향후 기존 서비스 인스턴스들을 점진적으로 서비스 컨테이너로 마이그레이션

# 주소 관련 엔드포인트 추가
@router.post("/address/search")
async def search_address(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return {"message": "주소 검색 성공", "addresses": []}  # 카카오맵 API 연동 필요
    except Exception as e:
        logger.error(f"주소 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/address/save")
async def save_addresses(
    from_address: str,
    to_address: str,
    from_lat: float,
    from_lng: float,
    to_lat: float,
    to_lng: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 출발지 주소 저장
        from_addr = address_service.add_address(
            db=db,
            user_id=current_user.id,
            address=from_address,
            latitude=from_lat,
            longitude=from_lng
        )
        
        # 도착지 주소 저장
        to_addr = address_service.add_address(
            db=db,
            user_id=current_user.id,
            address=to_address,
            latitude=to_lat,
            longitude=to_lng
        )
        
        # 거리 계산
        distance = address_service.calculate_distance(from_addr, to_addr)
        
        return {
            "message": "주소 저장 성공",
            "from_address": from_addr,
            "to_address": to_addr,
            "distance": distance
        }
    except Exception as e:
        logger.error(f"주소 저장 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/address/{order_id}")
async def get_order_addresses(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 주문에 연결된 주소 정보 조회
        from_addr = address_service.get_address(db, order_id)
        to_addr = address_service.get_address(db, order_id)
        
        if not from_addr or not to_addr:
            raise HTTPException(status_code=404, detail="주소 정보를 찾을 수 없습니다")
            
        distance = address_service.calculate_distance(from_addr, to_addr)
        
        return {
            "from_address": from_addr,
            "to_address": to_addr,
            "distance": distance
        }
    except Exception as e:
        logger.error(f"주소 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
