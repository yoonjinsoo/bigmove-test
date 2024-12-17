from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import datetime, timedelta
from ..models import Order, ShippingOrder, Review, User
from fastapi import HTTPException

class AnalyticsService:
    def get_revenue_analytics(self, db: Session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        try:
            orders = db.query(Order).filter(
                Order.created_at.between(start_date, end_date),
                Order.status != 'cancelled'
            ).all()
            
            total_revenue = sum(order.total_price for order in orders)
            avg_order_value = total_revenue / len(orders) if orders else 0
            
            return {
                'total_revenue': total_revenue,
                'total_orders': len(orders),
                'average_order_value': round(avg_order_value, 2),
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"매출 분석 중 오류가 발생했습니다: {str(e)}")

    def get_customer_analytics(self, db: Session) -> Dict[str, Any]:
        try:
            total_users = db.query(User).count()
            active_users = db.query(User).join(Order).distinct().count()
            
            repeat_customers = db.query(
                Order.user_id
            ).group_by(
                Order.user_id
            ).having(
                func.count(Order.id) > 1
            ).count()
            
            return {
                'total_users': total_users,
                'active_users': active_users,
                'repeat_customers': repeat_customers,
                'customer_retention_rate': round((repeat_customers / active_users * 100), 2) if active_users > 0 else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"고객 분석 중 오류가 발생했습니다: {str(e)}")

    def get_shipping_analytics(self, db: Session, period_days: int = 30) -> Dict[str, Any]:
        try:
            start_date = datetime.utcnow() - timedelta(days=period_days)
            shipping_orders = db.query(ShippingOrder).filter(
                ShippingOrder.created_at >= start_date
            ).all()
            
            total_orders = len(shipping_orders)
            completed_orders = len([so for so in shipping_orders if so.status == 'delivered'])
            delayed_orders = len([so for so in shipping_orders if so.status == 'delayed'])
            
            return {
                'total_deliveries': total_orders,
                'completed_deliveries': completed_orders,
                'delayed_deliveries': delayed_orders,
                'completion_rate': round((completed_orders / total_orders * 100), 2) if total_orders > 0 else 0,
                'delay_rate': round((delayed_orders / total_orders * 100), 2) if total_orders > 0 else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"배송 분석 중 오류가 발생했습니다: {str(e)}") 