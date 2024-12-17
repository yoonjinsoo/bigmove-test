import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, List
from sqlalchemy.orm import Session
from ..models.system_log import SystemLog
from fastapi import HTTPException
from sqlalchemy import desc
import json
import os
from pathlib import Path

class LoggingService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.setup_logging()

    def setup_logging(self):
        # 프로젝트 루트 디렉토리 찾기
        project_root = Path(__file__).parent.parent.parent
        log_dir = project_root / "logs"
        
        # 로그 디렉토리 생성
        os.makedirs(log_dir, exist_ok=True)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        file_handler = logging.FileHandler(log_dir / "app.log")
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        self.logger.setLevel(logging.INFO)

    def log_to_db(
        self, 
        db: Session, 
        level: str, 
        message: str, 
        user_id: Optional[int] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        try:
            log_entry = SystemLog(
                level=level,
                message=message,
                user_id=user_id,
                additional_data=additional_data,
                created_at=datetime.utcnow()
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as e:
            db.rollback()
            self.logger.error(f"로그 저장 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"로그 저장 중 오류가 발생했습니다: {str(e)}")

    def log_error(self, message: str, error: Exception, user_id: Optional[int] = None):
        self.logger.error(message, exc_info=error)
        if user_id:
            self.logger.error(f"User ID: {user_id}")

    def log_info(self, message: str, user_id: Optional[int] = None):
        self.logger.info(message)
        if user_id:
            self.logger.info(f"User ID: {user_id}")

    def log_warning(self, message: str, user_id: Optional[int] = None):
        self.logger.warning(message)
        if user_id:
            self.logger.warning(f"User ID: {user_id}")

    def get_logs(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        level: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[SystemLog]:
        query = db.query(SystemLog)
        
        if level:
            query = query.filter(SystemLog.level == level)
        if start_date:
            query = query.filter(SystemLog.created_at >= start_date)
        if end_date:
            query = query.filter(SystemLog.created_at <= end_date)
            
        return query.order_by(desc(SystemLog.created_at)).offset(skip).limit(limit).all()

    def get_error_summary(self, db: Session, days: int = 7) -> Dict[str, Any]:
        start_date = datetime.utcnow() - timedelta(days=days)
        error_logs = db.query(SystemLog).filter(
            SystemLog.level.in_(['ERROR', 'CRITICAL']),
            SystemLog.created_at >= start_date
        ).all()
        
        return {
            'total_errors': len(error_logs),
            'error_by_type': self._group_errors_by_type(error_logs),
            'period': f'Last {days} days'
        }

    def _group_errors_by_type(self, error_logs: List[SystemLog]) -> Dict[str, int]:
        error_types = {}
        for log in error_logs:
            if log.additional_data and 'error_type' in log.additional_data:
                error_type = log.additional_data['error_type']
                error_types[error_type] = error_types.get(error_type, 0) + 1
        return error_types 