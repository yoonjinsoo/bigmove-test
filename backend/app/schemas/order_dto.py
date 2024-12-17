from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class AddressInfo(BaseModel):
    from_address_id: int
    to_address_id: int
    distance: float

class ServiceOptions(BaseModel):
    floor_option_id: Optional[str]
    ladder_option_id: Optional[str]
    special_vehicle_id: Optional[str]

class DeliveryInfo(BaseModel):
    date: datetime
    time_slot: str
    delivery_option: str

class OrderDTO(BaseModel):
    items: List[Dict[str, Any]]
    addresses: AddressInfo
    service_options: ServiceOptions
    delivery_info: DeliveryInfo 