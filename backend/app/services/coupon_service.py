from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
import uuid
from ..models.coupon import Coupon
from ..models.user import User
from typing import List

class CouponService:
    def __init__(self, db: Session):
        self.db = db

    async def generate_signup_coupon(self, user_id: int) -> Coupon:
        """회원가입 축하 쿠폰 생성"""
        try:
            coupon = Coupon(
                user_id=user_id,
                code=str(uuid.uuid4()),
                amount=10000,
                expiry_date=datetime.utcnow() + timedelta(days=30)
            )
            
            self.db.add(coupon)
            self.db.flush()
            
            return coupon
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"쿠폰 생성 중 오류가 발생했습니다: {str(e)}"
            )

    async def validate_coupon(self, coupon_code: str, user_id: int) -> bool:
        """쿠폰 유효성 검증"""
        coupon = self.db.query(Coupon).filter(
            Coupon.code == coupon_code,
            Coupon.user_id == user_id
        ).first()

        if not coupon:
            return False

        if coupon.expiry_date < datetime.utcnow():
            return False

        return True 

    async def get_user_coupons(self, user_id: int) -> List[Coupon]:
        """사용자의 보유 쿠폰 목록 조회"""
        return self.db.query(Coupon).filter(
            Coupon.user_id == user_id,
            Coupon.used_at.is_(None),
            Coupon.expiry_date > datetime.utcnow()
        ).all()

    async def use_coupon(self, coupon_code: str, user_id: int, order_id: int) -> Coupon:
        """쿠폰 사용 처리"""
        coupon = self.db.query(Coupon).filter(
            Coupon.code == coupon_code,
            Coupon.user_id == user_id,
            Coupon.used_at.is_(None)
        ).first()
        
        if not coupon:
            raise HTTPException(status_code=404, detail="쿠폰을 찾을 수 없습니다")
            
        if coupon.expiry_date < datetime.utcnow():
            raise HTTPException(status_code=400, detail="만료된 쿠폰입니다")
    
        coupon.used_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(coupon)
    
        return coupon 