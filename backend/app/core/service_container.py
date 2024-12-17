from functools import lru_cache
from typing import Dict, Any
from ..services.order_service import OrderService
from ..services.payment_service import PaymentService
from ..services.warehouse_service import WarehouseService
from ..services.notification_service import NotificationService
from ..services.furniture_service import FurnitureService
from ..services.quote_service import QuoteService
from ..services.review_service import ReviewService
from ..services.order_progress_service import OrderProgressService

class ServiceContainer:
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self.email_config = {
            "smtp_server": "smtp.gmail.com",
            "smtp_port": 587,
            "sender": "bigmove@example.com",
            "username": "your_username",
            "password": "your_password"
        }
        self.order_progress_service = OrderProgressService()
        
    @property
    def order_service(self) -> OrderService:
        return self._get_service('order', OrderService)
        
    @property
    def payment_service(self) -> PaymentService:
        return self._get_service('payment', PaymentService)
        
    @property
    def warehouse_service(self) -> WarehouseService:
        return self._get_service('warehouse', WarehouseService)
        
    @property
    def notification_service(self) -> NotificationService:
        if 'notification' not in self._services:
            self._services['notification'] = NotificationService(self.email_config)
        return self._services['notification']
        
    @property
    def furniture_service(self) -> FurnitureService:
        return self._get_service('furniture', FurnitureService)
        
    @property
    def quote_service(self) -> QuoteService:
        return self._get_service('quote', QuoteService)
        
    @property
    def review_service(self) -> ReviewService:
        return self._get_service('review', ReviewService)

    def _get_service(self, service_name: str, service_class: type) -> Any:
        if service_name not in self._services:
            self._services[service_name] = service_class()
        return self._services[service_name]

@lru_cache()
def get_service_container() -> ServiceContainer:
    return ServiceContainer()
