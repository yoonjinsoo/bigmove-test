from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import logging
from typing import List
from dotenv import load_dotenv
import os

# logger 설정
logger = logging.getLogger(__name__)

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_welcome_email(email: EmailStr, name: str, coupon_code: str):
    try:
        message = MessageSchema(
            subject="BigMove에 오신 것을 환영합니다!",
            recipients=[email],
            body=f"""
            안녕하세요 {name}님,

            BigMove 회원이 되신 것을 진심으로 환영합니다!
            
            회원가입을 축하드리며, {coupon_code} 쿠폰을 선물로 드립니다.
            첫 이사 서비스 이용 시 사용하실 수 있습니다.

            감사합니다.
            BigMove 팀 드림
            """,
            subtype="plain"
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"환영 이메일 전송 완료: {email}")
    except Exception as e:
        logger.error(f"이메일 전송 중 오류 발생: {str(e)}")