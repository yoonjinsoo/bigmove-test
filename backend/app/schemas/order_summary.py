from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class OrderSummaryResponse(BaseModel):
    order_id: int
    items: List[Dict[str, Any]]
    addresses: Dict[str, Any]
    service_options: Dict[str, Any]
    delivery_info: Dict[str, Any]
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True 