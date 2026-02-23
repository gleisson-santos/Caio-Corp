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
    """Delete emails from the user's IMAP inbox."""

    name = "email_delete"
    description = (
        "Delete emails from the inbox. You can delete by:\n"
        "- count: delete the last N emails (e.g. count=3 deletes the 3 most recent)\n"
        "- sender: delete emails from a specific sender address\n"
        "Emails are moved to Trash. ONLY use when the user EXPLICITLY asks to delete.\n"
        "NEVER use email_send to try to delete emails — always use email_delete."
    )
    parameters = {
        "type": "object",
        "properties": {
            "count": {
                "type": "integer",
                "description": (
                    "Number of most recent emails to delete. Default: 1. Max: 10. "
                    "Use this when the user says 'delete the last 3 emails'."
                ),
            },
            "sender": {
                "type": "string",
                "description": (
                    "Delete only emails from this sender address. "
                    "Example: 'expert@example.com'. If empty, deletes by count from all."
                ),
            },
            "mailbox": {
                "type": "string",
                "description": "Mailbox to delete from. Default: INBOX.",
            },
        },
        "required": [],
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
        count: int = 1,
        sender: str = "",
        mailbox: str = "INBOX",
        **kwargs: Any,
    ) -> str:
        """Execute email deletion."""
        if not self.imap_host or not self.username:
            return "Error: IMAP is not configured."

        # Safety: max 10 at a time
        count = min(max(1, count), 10)

        try:
            result = await asyncio.to_thread(
                self._delete_emails, count, sender, mailbox
            )
            return result
        except Exception as e:
            logger.error("Email delete error: {}", e)
            return f"Erro ao deletar emails: {e}"

    def _delete_emails(self, count: int, sender: str, mailbox: str) -> str:
        """Synchronous IMAP delete (runs in executor)."""
        try:
            if self.use_ssl:
                conn = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
            else:
                conn = imaplib.IMAP4(self.imap_host, self.imap_port)

            conn.login(self.username, self.password)
            conn.select(mailbox)

            # Search for emails
            if sender:
                # Search by sender
                status, data = conn.search(None, "FROM", f'"{sender}"')
            else:
                # Get all emails
                status, data = conn.search(None, "ALL")

            if status != "OK" or not data[0]:
                conn.logout()
                return "Nenhum email encontrado para deletar."

            uids = data[0].split()
            # Take the most recent N
            uids_to_delete = uids[-count:]

            deleted_info = []
            for uid in uids_to_delete:
                # Fetch subject and sender for confirmation
                try:
                    status, msg_data = conn.fetch(uid, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT)])")
                    subject_str = ""
                    sender_str = ""
                    if status == "OK" and msg_data[0] and isinstance(msg_data[0], tuple):
                        raw = msg_data[0][1]
                        msg = email.message_from_bytes(raw)
                        subject_str = _decode_header(msg.get("Subject", ""))
                        sender_str = _decode_header(msg.get("From", ""))
                    deleted_info.append(f"• {sender_str} — {subject_str}")
                except Exception:
                    deleted_info.append(f"• (email ID: {uid.decode()})")

            # Delete: flag as deleted + move to Gmail Trash
            for uid in uids_to_delete:
                try:
                    # Gmail: move to Trash folder
                    conn.copy(uid, "[Gmail]/Lixeira")
                except Exception:
                    try:
                        conn.copy(uid, "[Gmail]/Trash")
                    except Exception:
                        pass  # Non-Gmail: just flag

                conn.store(uid, "+FLAGS", "\\Deleted")

            conn.expunge()
            conn.logout()

            n = len(uids_to_delete)
            details = "\n".join(deleted_info)
            return (
                f"✅ {n} email(s) deletado(s) com sucesso!\n\n"
                f"Removidos:\n{details}"
            )

        except imaplib.IMAP4.error as e:
            return f"Erro IMAP: {e}"
        except Exception as e:
            return f"Erro ao deletar: {e}"
