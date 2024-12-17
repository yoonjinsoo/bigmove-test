from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException
from ..models import ShippingOrder, Review, Order, User, ShippingCompany
from ..services.shipping_order_service import ShippingOrderService
from ..services.review_service import ReviewService

class PerformanceAnalysisService:
    def __init__(self, shipping_order_service: ShippingOrderService, review_service: ReviewService):
        self.shipping_order_service = shipping_order_service
        self.review_service = review_service

    def analyze_company_performance(
        self, 
        db: Session, 
        company_id: int, 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        try:
            shipping_orders = self._get_company_orders(db, company_id, start_date, end_date)
            delivery_stats = self._analyze_delivery_performance(shipping_orders)
            review_stats = self._analyze_review_performance(db, shipping_orders)
            financial_stats = self._analyze_financial_performance(shipping_orders)
            driver_stats = self._analyze_driver_performance(db, company_id, start_date, end_date)

            return {
                'summary': {
                    'total_orders': delivery_stats['total_orders'],
                    'completed_orders': delivery_stats['completed_orders'],
                    'completion_rate': delivery_stats['completion_rate'],
                    'avg_delivery_time': delivery_stats['avg_delivery_time'],
                    'avg_rating': review_stats['avg_rating'],
                    'total_revenue': financial_stats['total_revenue']
                },
                'delivery_performance': delivery_stats,
                'customer_satisfaction': review_stats,
                'financial_metrics': financial_stats,
                'driver_performance': driver_stats,
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"성능 분석 중 오류가 발생했습니다: {str(e)}"
            )

    def _get_company_orders(
        self, 
        db: Session, 
        company_id: int, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[ShippingOrder]:
        return db.query(ShippingOrder).filter(
            and_(
                ShippingOrder.company_id == company_id,
                ShippingOrder.created_at.between(start_date, end_date)
            )
        ).all()

    def _analyze_delivery_performance(self, orders: List[ShippingOrder]) -> Dict[str, Any]:
        total_orders = len(orders)
        completed_orders = len([o for o in orders if o.status == 'delivered'])
        delayed_orders = len([o for o in orders if o.status == 'delayed'])
        
        delivery_times = []
        for order in orders:
            if order.delivered_at and order.created_at:
                delivery_time = (order.delivered_at - order.created_at).total_seconds() / 3600
                delivery_times.append(delivery_time)

        return {
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'completion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
            'delayed_orders': delayed_orders,
            'delay_rate': (delayed_orders / total_orders * 100) if total_orders > 0 else 0,
            'avg_delivery_time': sum(delivery_times) / len(delivery_times) if delivery_times else 0,
            'delivery_time_distribution': self._calculate_time_distribution(delivery_times)
        }

    def _analyze_review_performance(self, db: Session, orders: List[ShippingOrder]) -> Dict[str, Any]:
        reviews = []
        for order in orders:
            order_reviews = self.review_service.get_reviews_by_order_id(db, order.order_id)
            reviews.extend(order_reviews)

        if not reviews:
            return {
                'avg_rating': 0,
                'avg_service_rating': 0,
                'avg_driver_rating': 0,
                'total_reviews': 0,
                'rating_distribution': {str(i): 0 for i in range(1, 6)},
                'satisfaction_rate': 0
            }

        rating_dist = {str(i): 0 for i in range(1, 6)}
        for review in reviews:
            rating_dist[str(int(review.rating))] += 1

        return {
            'avg_rating': sum(r.rating for r in reviews) / len(reviews),
            'avg_service_rating': sum(r.service_rating for r in reviews) / len(reviews),
            'avg_driver_rating': sum(r.driver_rating for r in reviews) / len(reviews),
            'total_reviews': len(reviews),
            'rating_distribution': rating_dist,
            'satisfaction_rate': len([r for r in reviews if r.rating >= 4]) / len(reviews) * 100
        }

    def _analyze_financial_performance(self, orders: List[ShippingOrder]) -> Dict[str, Any]:
        total_revenue = sum(order.shipping_fee for order in orders if order.shipping_fee)
        completed_revenue = sum(
            order.shipping_fee for order in orders 
            if order.shipping_fee and order.status == 'delivered'
        )

        return {
            'total_revenue': total_revenue,
            'completed_revenue': completed_revenue,
            'avg_order_value': total_revenue / len(orders) if orders else 0,
            'revenue_completion_rate': (completed_revenue / total_revenue * 100) if total_revenue > 0 else 0
        }

    def _analyze_driver_performance(
        self, 
        db: Session, 
        company_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        driver_stats = db.query(
            ShippingOrder.driver_id,
            func.count(ShippingOrder.id).label('total_deliveries'),
            func.avg(Review.driver_rating).label('avg_rating')
        ).join(
            Review, ShippingOrder.order_id == Review.order_id
        ).filter(
            and_(
                ShippingOrder.company_id == company_id,
                ShippingOrder.created_at.between(start_date, end_date)
            )
        ).group_by(
            ShippingOrder.driver_id
        ).order_by(
            desc('avg_rating')
        ).all()

        return [
            {
                'driver_id': stat.driver_id,
                'total_deliveries': stat.total_deliveries,
                'avg_rating': float(stat.avg_rating) if stat.avg_rating else 0
            }
            for stat in driver_stats
        ]

    def _calculate_time_distribution(self, delivery_times: List[float]) -> Dict[str, int]:
        if not delivery_times:
            return {}

        ranges = {
            '0-2h': 0,
            '2-4h': 0,
            '4-8h': 0,
            '8-24h': 0,
            '24h+': 0
        }

        for time in delivery_times:
            if time <= 2:
                ranges['0-2h'] += 1
            elif time <= 4:
                ranges['2-4h'] += 1
            elif time <= 8:
                ranges['4-8h'] += 1
            elif time <= 24:
                ranges['8-24h'] += 1
            else:
                ranges['24h+'] += 1

        return ranges 