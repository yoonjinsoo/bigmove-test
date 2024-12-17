from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy import func, desc, and_
from ..models import Order, ShippingOrder, Review, User, Furniture
from ..services.order_service import OrderService
from ..services.shipping_order_service import ShippingOrderService
from ..services.review_service import ReviewService
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class DashboardService:
    def __init__(self, order_service: OrderService, shipping_service: ShippingOrderService, 
                 review_service: ReviewService):
        self.order_service = order_service
        self.shipping_service = shipping_service
        self.review_service = review_service

    def get_dashboard_stats(self, db: Session, days: int = 30) -> Dict[str, Any]:
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # 주문 통계
            orders = self.order_service.get_orders_in_date_range(db, start_date, datetime.utcnow())
            total_orders = len(orders)
            total_revenue = sum(order.total_price for order in orders)
            
            # 일별 주문 추이
            daily_orders = (
                db.query(
                    func.date(Order.created_at).label('date'),
                    func.count(Order.id).label('count'),
                    func.sum(Order.total_price).label('revenue')
                )
                .filter(Order.created_at >= start_date)
                .group_by(func.date(Order.created_at))
                .order_by(func.date(Order.created_at))
                .all()
            )

            # 배송 통계
            shipping_stats = self._get_shipping_stats(db, start_date)
            
            # 리뷰 통계
            review_stats = self._get_review_stats(db, start_date)
            
            # 인기 가구 통계
            popular_items = self._get_popular_items(db, start_date)
            
            # 지역별 통계
            regional_stats = self._get_regional_stats(db, start_date)

            return {
                'summary': {
                    'total_orders': total_orders,
                    'total_revenue': total_revenue,
                    'completed_deliveries': shipping_stats['completed_deliveries'],
                    'pending_deliveries': shipping_stats['pending_deliveries'],
                    'average_rating': review_stats['average_rating'],
                    'total_reviews': review_stats['total_reviews']
                },
                'trends': {
                    'daily_orders': [
                        {
                            'date': str(day.date),
                            'count': day.count,
                            'revenue': float(day.revenue or 0)
                        }
                        for day in daily_orders
                    ],
                    'shipping_status_distribution': shipping_stats['status_distribution'],
                    'review_distribution': review_stats['rating_distribution']
                },
                'popular_items': popular_items,
                'regional_stats': regional_stats,
                'performance_metrics': {
                    'average_delivery_time': shipping_stats['average_delivery_time'],
                    'customer_satisfaction': review_stats['satisfaction_score'],
                    'delivery_success_rate': shipping_stats['success_rate']
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"대시보드 통계 조회 중 오류가 발생했습니다: {str(e)}")

    def _get_shipping_stats(self, db: Session, start_date: datetime) -> Dict[str, Any]:
        shipping_orders = db.query(ShippingOrder).filter(
            ShippingOrder.created_at >= start_date
        ).all()
        
        status_counts = {}
        delivery_times = []
        completed = 0
        
        for order in shipping_orders:
            status_counts[order.status] = status_counts.get(order.status, 0) + 1
            if order.status == 'delivered':
                completed += 1
                if order.delivered_at and order.created_at:
                    delivery_time = (order.delivered_at - order.created_at).total_seconds() / 3600
                    delivery_times.append(delivery_time)
        
        return {
            'completed_deliveries': completed,
            'pending_deliveries': len(shipping_orders) - completed,
            'status_distribution': status_counts,
            'average_delivery_time': sum(delivery_times) / len(delivery_times) if delivery_times else 0,
            'success_rate': (completed / len(shipping_orders) * 100) if shipping_orders else 0
        }

    def _get_review_stats(self, db: Session, start_date: datetime) -> Dict[str, Any]:
        reviews = db.query(Review).filter(Review.created_at >= start_date).all()
        
        if not reviews:
            return {
                'average_rating': 0,
                'total_reviews': 0,
                'rating_distribution': {str(i): 0 for i in range(1, 6)},
                'satisfaction_score': 0
            }
        
        rating_dist = {str(i): 0 for i in range(1, 6)}
        for review in reviews:
            rating_dist[str(int(review.rating))] += 1
        
        satisfaction_score = (
            sum(review.rating >= 4 for review in reviews) / len(reviews) * 100
        )
        
        return {
            'average_rating': sum(review.rating for review in reviews) / len(reviews),
            'total_reviews': len(reviews),
            'rating_distribution': rating_dist,
            'satisfaction_score': satisfaction_score
        }

    def _get_popular_items(self, db: Session, start_date: datetime) -> List[Dict[str, Any]]:
        popular_items = (
            db.query(
                Furniture.id,
                Furniture.name,
                func.count(Order.id).label('order_count'),
                func.sum(Order.total_price).label('total_revenue')
            )
            .join(Order, Order.items.contains(Furniture.id))
            .filter(Order.created_at >= start_date)
            .group_by(Furniture.id, Furniture.name)
            .order_by(desc('order_count'))
            .limit(10)
            .all()
        )
        
        return [
            {
                'id': item.id,
                'name': item.name,
                'order_count': item.order_count,
                'total_revenue': float(item.total_revenue or 0)
            }
            for item in popular_items
        ]

    def get_user_stats(self, db: Session) -> Dict[str, Any]:
        try:
            # 전체 회원 수
            total_users = db.query(User).count()
            
            # 소셜 로그인 별 회원 수
            social_stats = (
                db.query(
                    User.provider,
                    func.count(User.id).label('count')
                )
                .group_by(User.provider)
                .all()
            )
            
            # 최근 가입한 회원들
            recent_users = (
                db.query(User)
                .order_by(User.created_at.desc())
                .limit(10)
                .all()
            )
            
            return {
                "total_users": total_users,
                "social_stats": {stat.provider: stat.count for stat in social_stats},
                "recent_users": [
                    {
                        "id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "provider": user.provider,
                        "created_at": user.created_at,
                        "is_active": user.is_active
                    }
                    for user in recent_users
                ]
            }
        except Exception as e:
            logger.error(f"회원 통계 조회 중 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))