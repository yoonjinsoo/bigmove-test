#!/bin/bash

# 데이터베이스 마이그레이션 실행
alembic upgrade head

# FastAPI 서버 시작
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT 