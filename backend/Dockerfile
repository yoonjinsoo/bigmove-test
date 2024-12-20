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

# 시작 스크립트 생성
RUN echo '#!/bin/bash\n\
alembic upgrade head\n\
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}" --workers 1' > start.sh && \
    chmod +x start.sh

# 시작 스크립트 실행
CMD ["./start.sh"]
