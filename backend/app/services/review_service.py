from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException
from ..models import Review, Order, ShippingOrder
from ..schemas.review import ReviewCreate, ReviewUpdate

class ReviewService:
    def create_review(
        self,
        db: Session,
        user_id: int,
        review_data: ReviewCreate
    ) -> Review:
        # 주문 확인
        order = db.query(Order).filter(Order.id == review_data.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")
        
        # 이미 리뷰가 있는지 확인
        existing_review = db.query(Review).filter(
            Review.order_id == review_data.order_id,
            Review.user_id == user_id
        ).first()
        if existing_review:
            raise HTTPException(status_code=400, detail="이미 이 주문에 대한 리뷰가 존재합니다")

        new_review = Review(
            user_id=user_id,
            order_id=review_data.order_id,
            shipping_order_id=review_data.shipping_order_id,
            rating=review_data.rating,
            service_rating=review_data.service_rating,
            driver_rating=review_data.driver_rating,
            price_rating=review_data.price_rating,
            comment=review_data.comment,
            detailed_feedback=review_data.detailed_feedback,
            photos=review_data.photos
        )
        
        try:
            db.add(new_review)
            db.commit()
            db.refresh(new_review)
            return new_review
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"리뷰 생성 중 오류가 발생했습니다: {str(e)}")

    def get_review_statistics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        start_date = datetime.utcnow() - timedelta(days=days)
        reviews = db.query(Review).filter(Review.created_at >= start_date).all()
        
        if not reviews:
            return {
                "average_rating": 0,
                "average_service_rating": 0,
                "average_driver_rating": 0,
                "average_price_rating": 0,
                "total_reviews": 0,
                "rating_distribution": {str(i): 0 for i in range(1, 6)}
            }

        rating_distribution = {}
        for i in range(1, 6):
            count = len([r for r in reviews if int(r.rating) == i])
            rating_distribution[str(i)] = count

        return {
            "average_rating": sum(r.rating for r in reviews) / len(reviews),
            "average_service_rating": sum(r.service_rating for r in reviews) / len(reviews),
            "average_driver_rating": sum(r.driver_rating for r in reviews) / len(reviews),
            "average_price_rating": sum(r.price_rating for r in reviews) / len(reviews),
            "total_reviews": len(reviews),
            "rating_distribution": rating_distribution
        }

    def get_driver_reviews(self, db: Session, driver_id: int) -> List[Review]:
        return db.query(Review).join(ShippingOrder).filter(
            ShippingOrder.driver_id == driver_id
        ).all()

    def get_top_rated_drivers(self, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        driver_ratings = db.query(
            ShippingOrder.driver_id,
            func.avg(Review.driver_rating).label('average_rating'),
            func.count(Review.id).label('total_reviews')
        ).join(Review).group_by(ShippingOrder.driver_id).order_by(
            desc('average_rating')
        ).limit(limit).all()

        return [
            {
                "driver_id": rating[0],
                "average_rating": float(rating[1]),
                "total_reviews": rating[2]
            }
            for rating in driver_ratings
        ]

    def update_review(
        self,
        db: Session,
        review_id: int,
        user_id: int,
        review_data: ReviewUpdate
    ) -> Review:
        review = self.get_review_by_id(db, review_id)
        if review.user_id != user_id:
            raise HTTPException(status_code=403, detail="이 리뷰를 수정할 권한이 없습니다")

        for field, value in review_data.dict(exclude_unset=True).items():
            setattr(review, field, value)

        try:
            db.commit()
            db.refresh(review)
            return review
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"리뷰 수정 중 오류가 발생했습니다: {str(e)}")

    def get_review_by_id(self, db: Session, review_id: int):
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다")
        return review

    def get_reviews_by_order_id(self, db: Session, order_id: int) -> List[Review]:
        return db.query(Review).filter(Review.order_id == order_id).all()

    def get_reviews_by_user_id(self, db: Session, user_id: int) -> List[Review]:
        return db.query(Review).filter(Review.user_id == user_id).all()

    def delete_review(self, db: Session, review_id: int):
        review = self.get_review_by_id(db, review_id)
        try:
            db.delete(review)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"리뷰 삭제 중 오류가 발생했습니다: {str(e)}")

    def get_reviews_in_date_range(self, db: Session, start_date: datetime, end_date: datetime) -> List[Review]:
        return db.query(Review).filter(
            Review.created_at >= start_date,
            Review.created_at <= end_date
        ).all() 