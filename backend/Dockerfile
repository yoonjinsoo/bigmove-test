FROM python:3.12-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 마이그레이션 실행 후 서버 시작
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 1
