from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.oauth_service import OAuthService
from app.services.auth_service import AuthService
from app.services.coupon_service import CouponService

class ServiceContainer:
    def __init__(self, db=None):
        self.oauth_service = OAuthService()
        if db:
            self.auth_service = AuthService()
            self.coupon_service = CouponService(db)

def get_service_container(db: Session = Depends(get_db)):
    return ServiceContainer(db) 