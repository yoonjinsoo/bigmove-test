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

# 환경변수 설정
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# 디버깅을 위한 로그 레벨 설정
ENV LOG_LEVEL=debug

# 실행
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level debug
