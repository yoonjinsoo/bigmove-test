from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from ..models import Order, ShippingOrder, Review
from fastapi import HTTPException
from datetime import datetime

class SearchService:
    def search_orders(
        self, 
        db: Session, 
        query: str = None, 
        status: str = None, 
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[Order]:
        try:
            search_query = db.query(Order)
            
            if query:
                search_query = search_query.filter(
                    or_(
                        Order.id.contains(query),
                        Order.user_id.contains(query)
                    )
                )
            
            if status:
                search_query = search_query.filter(Order.status == status)
                
            if start_date:
                search_query = search_query.filter(Order.created_at >= start_date)
                
            if end_date:
                search_query = search_query.filter(Order.created_at <= end_date)
            
            return search_query.all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"주문 검색 중 오류가 발생했습니다: {str(e)}")

    def search_reviews(
        self, 
        db: Session, 
        query: str = None,
        rating: int = None,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[Review]:
        try:
            search_query = db.query(Review)
            
            if query:
                search_query = search_query.filter(Review.comment.ilike(f"%{query}%"))
            
            if rating:
                search_query = search_query.filter(Review.rating == rating)
                
            if start_date:
                search_query = search_query.filter(Review.created_at >= start_date)
                
            if end_date:
                search_query = search_query.filter(Review.created_at <= end_date)
            
            return search_query.all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"리뷰 검색 중 오류가 발생했습니다: {str(e)}") 