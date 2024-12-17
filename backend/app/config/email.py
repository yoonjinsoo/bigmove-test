from typing import Dict
import os

def get_email_config() -> Dict:
    return {
        "SMTP_SERVER": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
        "SMTP_PORT": int(os.getenv("SMTP_PORT", "587")),
        "SMTP_USERNAME": os.getenv("SMTP_USERNAME", ""),
        "SMTP_PASSWORD": os.getenv("SMTP_PASSWORD", ""),
        "EMAIL_FROM": os.getenv("EMAIL_FROM", "noreply@bigmove.com"),
        "USE_TLS": os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
    }
