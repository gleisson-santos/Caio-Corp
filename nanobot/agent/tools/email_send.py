"""Email sending tool: send emails via SMTP."""

from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Any

from loguru import logger

from nanobot.agent.tools.base import Tool


class EmailSendTool(Tool):
    """Tool to send emails via SMTP."""

    name = "email_send"
    description = (
        "Send an email to a recipient. Use this for sending invitations, "
        "notifications, or replying to previous messages via SMTP."
    )
    parameters = {
        "type": "object",
        "properties": {
            "to": {
                "type": "string",
                "description": "Recipient email address.",
            },
            "subject": {
                "type": "string",
                "description": "Email subject.",
            },
            "body": {
                "type": "string",
                "description": "Email body content (plain text).",
            },
        },
        "required": ["to", "subject", "body"],
    }

    def __init__(
        self,
        smtp_host: str,
        smtp_port: int,
        username: str,
        password: str,
        use_tls: bool = True,
        use_ssl: bool = False,
        from_address: str | None = None,
    ):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        self.use_ssl = use_ssl
        self.from_address = from_address or username

    async def execute(self, to: str, subject: str, body: str, **kwargs: Any) -> str:
        """Execute the email sending tool."""
        # Unescape unicode sequences if present as literal text
        if "\\u" in body:
            try:
                body = body.encode('utf-8').decode('unicode-escape')
            except Exception:
                pass

        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = subject
        msg["From"] = self.from_address
        msg["To"] = to

        try:
            if self.use_ssl:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)

            if self.use_tls:
                server.starttls()

            if self.username and self.password:
                server.login(self.username, self.password)

            server.send_message(msg)
            server.quit()
            logger.info("Email sent to {} with subject: {}", to, subject)
            return f"Email sent successfully to {to}."
        except Exception as e:
            logger.error("Failed to send email to {}: {}", to, e)
            return f"Error sending email: {e}"
