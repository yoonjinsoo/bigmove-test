from .furniture_service import FurnitureService
from .user_service import UserService
from .order_service import OrderService
from .payment_service import PaymentService
from .shipping_company_service import ShippingCompanyService
from .shipping_order_service import ShippingOrderService
from .address_service import AddressService
from .review_service import ReviewService
from .performance_analysis_service import PerformanceAnalysisService
from .dashboard_service import DashboardService
from .quote_service import QuoteService
from .warehouse_service import WarehouseService
from .inventory_service import InventoryService
from .order_progress_service import OrderProgressService
from .coupon_service import CouponService
from sqlalchemy.orm import Session

__all__ = [
    'FurnitureService',
    'UserService',
    'OrderService',
    'PaymentService',
    'ShippingCompanyService',
    'ShippingOrderService',
    'AddressService',
    'ReviewService',
    'PerformanceAnalysisService',
    'DashboardService',
    'QuoteService',
    'WarehouseService',
    'InventoryService',
    'OrderProgressService',
    'CouponService'
]

class ServiceContainer:
    def __init__(self, db: Session):
        self.coupon_service = CouponService(db)