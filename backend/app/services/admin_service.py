from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi import HTTPException
from datetime import datetime, timedelta
from ..models import User, Order, ShippingOrder, Review
from ..services.analytics_service import AnalyticsService

class AdminService:
    def __init__(self, analytics_service: AnalyticsService):
        self.analytics_service = analytics_service

    def get_system_overview(self, db: Session) -> Dict[str, Any]:
        try:
            total_users = db.query(User).count()
            total_orders = db.query(Order).count()
            total_reviews = db.query(Review).count()
            
            recent_date = datetime.utcnow() - timedelta(days=30)
            active_orders = db.query(Order).filter(
                Order.created_at >= recent_date
            ).count()
            
            return {
                'total_users': total_users,
                'total_orders': total_orders,
                'total_reviews': total_reviews,
                'active_orders': active_orders,
                'last_updated': datetime.utcnow()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"시스템 개요 조회 중 오류가 발생했습니다: {str(e)}")

    def get_user_management_stats(self, db: Session) -> Dict[str, Any]:
        try:
            total_users = db.query(User).count()
            admin_users = db.query(User).filter(User.is_admin == True).count()
            recent_users = db.query(User).filter(
                User.created_at >= datetime.utcnow() - timedelta(days=30)
            ).count()
            
            return {
                'total_users': total_users,
                'admin_users': admin_users,
                'recent_users': recent_users,
                'user_growth_rate': (recent_users / total_users * 100) if total_users > 0 else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"사용자 통계 조회 중 오류가 발생했습니다: {str(e)}")

    def get_system_alerts(self, db: Session) -> List[Dict[str, Any]]:
        alerts = []
        try:
            # 미처리 주문 체크
            pending_orders = db.query(Order).filter(Order.status == 'pending').count()
            if pending_orders > 100:
                alerts.append({
                    'type': 'warning',
                    'message': f'미처리 주문이 {pending_orders}건 있습니다',
                    'timestamp': datetime.utcnow()
                })
            
            # 배송 지연 체크
            delayed_shipments = db.query(ShippingOrder).filter(
                ShippingOrder.status == 'delayed'
            ).count()
            if delayed_shipments > 0:
                alerts.append({
                    'type': 'error',
                    'message': f'배송 지연이 {delayed_shipments}건 발생했습니다',
                    'timestamp': datetime.utcnow()
                })
            
            return alerts
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"시스템 알림 조회 중 오류가 발생했습니다: {str(e)}")

    def get_user_stats(self, db: Session) -> Dict[str, Any]:
        try:
            total_users = db.query(User).count()
            active_users = db.query(User).filter(User.is_active == True).count()
            today = datetime.utcnow().date()
            new_users_today = db.query(User).filter(
                User.created_at >= today
            ).count()

            return {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users,
                "new_users_today": new_users_today
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"사용자 통계 조회 중 오류가 발생했습니다: {str(e)}")