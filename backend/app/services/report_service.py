from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime
from fastapi import HTTPException
import json
from ..services.analytics_service import AnalyticsService

class ReportService:
    def __init__(self, analytics_service: AnalyticsService):
        self.analytics_service = analytics_service

    def generate_monthly_report(self, db: Session, year: int, month: int) -> Dict[str, Any]:
        try:
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            revenue_data = self.analytics_service.get_revenue_analytics(db, start_date, end_date)
            customer_data = self.analytics_service.get_customer_analytics(db)
            shipping_data = self.analytics_service.get_shipping_analytics(db)
            
            return {
                'period': f"{year}년 {month}월",
                'revenue_summary': revenue_data,
                'customer_summary': customer_data,
                'shipping_summary': shipping_data,
                'generated_at': datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"월간 보고서 생성 중 오류가 발생했습니다: {str(e)}")

    def export_to_json(self, report_data: Dict[str, Any], filename: str) -> str:
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
            return filename
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"JSON 파일 생성 중 오류가 발생했습니다: {str(e)}") 