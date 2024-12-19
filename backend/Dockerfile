FROM python:3.9

ENV PATH="/usr/local/bin:${PATH}"
ENV PORT=8080

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --no-warn-script-location -r requirements.txt

COPY . .

COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
