import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.core.config import get_settings

logger = logging.getLogger("researchos.email")
settings = get_settings()

class EmailClient:
    def __init__(self):
        # We try to use SMTP config from settings. If not provided, we mock it.
        # Ensure we don't crash if SMTP_USER is empty.
        self.smtp_host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_user = getattr(settings, "SMTP_USER", "")
        self.smtp_password = getattr(settings, "SMTP_PASSWORD", "")

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        if not self.smtp_user or not self.smtp_password:
            # Fallback mock for demo/development purposes if credentials are omitted
            logger.info(f"MOCK EMAIL DISPATCHED to {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body:\n{body}")
            logger.info("To send real emails, set SMTP_USER and SMTP_PASSWORD in backend/.env")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Real email successfully dispatched to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
