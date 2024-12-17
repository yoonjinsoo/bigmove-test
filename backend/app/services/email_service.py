from fastapi import HTTPException
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from jinja2 import Environment, FileSystemLoader
from ..config import settings

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.sender_email = settings.SENDER_EMAIL
        self.template_env = Environment(loader=FileSystemLoader('app/templates/email'))

    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        template_name: str, 
        template_data: dict,
        cc: Optional[List[str]] = None
    ):
        try:
            template = self.template_env.get_template(template_name)
            html_content = template.render(**template_data)

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender_email
            msg['To'] = to_email
            if cc:
                msg['Cc'] = ', '.join(cc)

            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                recipients = [to_email] + (cc if cc else [])
                server.sendmail(self.sender_email, recipients, msg.as_string())

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"이메일 전송 중 오류가 발생했습니다: {str(e)}")

    def send_order_confirmation(self, to_email: str, order_data: dict):
        self.send_email(
            to_email=to_email,
            subject="주문이 확인되었습니다",
            template_name="order_confirmation.html",
            template_data=order_data
        )

    def send_shipping_update(self, to_email: str, shipping_data: dict):
        self.send_email(
            to_email=to_email,
            subject="배송 상태가 업데이트되었습니다",
            template_name="shipping_update.html",
            template_data=shipping_data
        )

    def send_password_reset(self, to_email: str, reset_token: str):
        self.send_email(
            to_email=to_email,
            subject="비밀번호 재설정",
            template_name="password_reset.html",
            template_data={"reset_token": reset_token}
        ) 