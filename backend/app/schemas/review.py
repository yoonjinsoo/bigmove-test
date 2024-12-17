from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class ReviewBase(BaseModel):
    order_id: int
    rating: int = Field(..., ge=1, le=5)
    content: str
    shipping_order_id: Optional[int] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: Optional[str] = None

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ReviewTrend(BaseModel):
    date: datetime
    count: int
    avg_rating: float

class ReviewStatistics(BaseModel):
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[int, int]
    recent_reviews_count: int
    review_trend: List[ReviewTrend]

    class Config:
        from_attributes = True