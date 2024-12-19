FROM python:3.9

# PATH 설정을 먼저 추가하여 경고 제거
ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /app

# 필요한 파일만 복사
COPY requirements.txt .
RUN pip install --no-cache-dir --no-warn-script-location -r requirements.txt

COPY . .

# 기본 실행 명령
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
