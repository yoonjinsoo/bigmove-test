from sqlalchemy.orm import Session
from ..models.shipping_company import ShippingCompany
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional, Dict, Any

class ShippingCompanyService:
    def add_company(
        self, 
        db: Session, 
        name: str, 
        api_key: str, 
        contact_info: Dict[str, Any]
    ) -> ShippingCompany:
        try:
            new_company = ShippingCompany(
                name=name,
                api_key=api_key,
                contact_info=contact_info,
                status='active',
                created_at=datetime.utcnow()
            )
            db.add(new_company)
            db.commit()
            db.refresh(new_company)
            return new_company
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"배송사 추가 중 오류가 발생했습니다: {str(e)}")

    def get_company(self, db: Session, company_id: int) -> Optional[ShippingCompany]:
        company = db.query(ShippingCompany).filter(ShippingCompany.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="배송사를 찾을 수 없습니다")
        return company

    def get_all_companies(self, db: Session) -> List[ShippingCompany]:
        return db.query(ShippingCompany).filter(ShippingCompany.status == 'active').all()

    def update_company_status(self, db: Session, company_id: int, new_status: str) -> ShippingCompany:
        company = self.get_company(db, company_id)
        try:
            company.status = new_status
            db.commit()
            db.refresh(company)
            return company
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"배송사 상태 업데이트 중 오류가 발생했습니다: {str(e)}") 