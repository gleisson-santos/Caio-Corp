"""Email delete tool: delete emails from IMAP inbox."""

from __future__ import annotations

import asyncio
import email
import email.header
import imaplib
from typing import Any

from loguru import logger

from nanobot.agent.tools.base import Tool


def _decode_header(value: str | None) -> str:
    """Decode encoded email header."""
    if not value:
        return ""
    parts = email.header.decode_header(value)
    decoded = []
    for data, charset in parts:
        if isinstance(data, bytes):
            decoded.append(data.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(data)
    return " ".join(decoded)


class EmailDeleteTool(Tool):
    """Delete emails from the user's IMAP inbox by search criteria."""

    name = "email_delete"
    description = (
        "Delete emails from the inbox by search criteria. "
        "Use IMAP search queries like 'FROM sender@example.com', "
        "'SUBJECT keyword', or 'ALL' for all. "
        "Emails are moved to Trash (Gmail) or flagged as Deleted. "
        "ONLY use this tool when the user EXPLICITLY asks to delete emails."
    )
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "IMAP search query to find emails to delete. "
                    "Examples: 'FROM sender@example.com', 'SUBJECT test email', "
                    "'UNSEEN', 'ALL'. Use specific queries to avoid deleting wrong emails."
                ),
            },
            "max_delete": {
                "type": "integer",
                "description": "Maximum number of emails to delete (safety limit). Default: 5.",
            },
            "mailbox": {
                "type": "string",
                "description": "Mailbox to delete from. Default: INBOX.",
            },
        },
        "required": ["query"],
    }

    def __init__(
        self,
        imap_host: str = "",
        imap_port: int = 993,
        username: str = "",
        password: str = "",
        use_ssl: bool = True,
    ):
        self.imap_host = imap_host
        self.imap_port = imap_port
        self.username = username
        self.password = password
        self.use_ssl = use_ssl

    async def execute(
        self,
        query: str = "ALL",
        max_delete: int = 5,
        mailbox: str = "INBOX",
        **kwargs: Any,
    ) -> str:
        """Execute email deletion."""
        if not self.imap_host or not self.username:
            return "Error: IMAP is not configured."

        try:
            result = await asyncio.to_thread(
                self._delete_emails, query, max_delete, mailbox
            )
            return result
        except Exception as e:
            logger.error("Email delete error: {}", e)
            return f"Error deleting emails: {e}"

    def _delete_emails(self, query: str, max_delete: int, mailbox: str) -> str:
        """Synchronous IMAP delete (runs in executor)."""
        try:
            if self.use_ssl:
                conn = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
            else:
                conn = imaplib.IMAP4(self.imap_host, self.imap_port)

            conn.login(self.username, self.password)
            conn.select(mailbox)

            status, data = conn.search(None, query)
            if status != "OK" or not data[0]:
                conn.logout()
                return f"Nenhum email encontrado com a busca: {query}"

            uids = data[0].split()
            # Limit to max_delete (most recent first)
            uids_to_delete = uids[-max_delete:] if len(uids) > max_delete else uids

            deleted_info = []
            for uid in uids_to_delete:
                # Fetch subject and sender for confirmation
                status, msg_data = conn.fetch(uid, "(RFC822.HEADER)")
                subject = ""
                sender = ""
                if status == "OK" and msg_data[0]:
                    raw = msg_data[0][1]
                    msg = email.message_from_bytes(raw)
                    subject = _decode_header(msg.get("Subject", ""))
                    sender = _decode_header(msg.get("From", ""))

                deleted_info.append(f"• De: {sender} | Assunto: {subject}")

            # Try Gmail-style delete (move to Trash)
            try:
                for uid in uids_to_delete:
                    conn.store(uid, "+FLAGS", "\\Deleted")
                    # Gmail: copy to [Gmail]/Trash then delete from INBOX
                    try:
                        conn.copy(uid, "[Gmail]/Lixeira")
                    except Exception:
                        try:
                            conn.copy(uid, "[Gmail]/Trash")
                        except Exception:
                            pass  # Non-Gmail: just flag as deleted
                conn.expunge()
            except Exception as e:
                logger.warning("Delete fallback: {}", e)
                # Fallback: just flag as deleted and expunge
                for uid in uids_to_delete:
                    conn.store(uid, "+FLAGS", "\\Deleted")
                conn.expunge()

            conn.logout()

            count = len(uids_to_delete)
            details = "\n".join(deleted_info)
            return (
                f"✅ {count} email(s) deletado(s) com sucesso!\n\n"
                f"Emails removidos:\n{details}"
            )

        except imaplib.IMAP4.error as e:
            return f"Erro IMAP ao deletar: {e}"
        except Exception as e:
            return f"Erro ao deletar emails: {e}"
