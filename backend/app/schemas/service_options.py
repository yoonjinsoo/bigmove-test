from pydantic import BaseModel
from typing import Optional, List

class ServiceOption(BaseModel):
    id: str
    type: str  # 'floor', 'ladder', 'special'
    label: str
    description: str
    fee: Optional[int] = None
    available: bool

    class Config:
        from_attributes = True

class ServiceOptionsResponse(BaseModel):
    floor_options: List[ServiceOption]
    ladder_options: List[ServiceOption]
    special_vehicle_options: List[ServiceOption]

    class Config:
        from_attributes = True

class SelectedOptions(BaseModel):
    floor_option_id: Optional[str] = None
    ladder_option_id: Optional[str] = None
    special_vehicle_option_id: Optional[str] = None
    total_fee: int

    class Config:
        from_attributes = True