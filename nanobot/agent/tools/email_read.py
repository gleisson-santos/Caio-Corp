"""Email reading tool: search and read emails from IMAP inbox."""

from __future__ import annotations

import asyncio
import email
import email.header
import imaplib
import re
from typing import Any

from nanobot.agent.tools.base import Tool


def _decode_header(value: str | None) -> str:
    """Decode encoded email header (e.g. =?UTF-8?b?...?=)."""
    if not value:
        return ""
    parts = []
    for chunk, charset in email.header.decode_header(value):
        if isinstance(chunk, bytes):
            try:
                parts.append(chunk.decode(charset or "utf-8", errors="replace"))
            except Exception:
                parts.append(chunk.decode("latin-1", errors="replace"))
        else:
            parts.append(chunk)
    return " ".join(parts)


def _extract_body(msg: email.message.Message, max_chars: int = 3000) -> str:
    """Extract plain text body from email message."""
    body_parts = []

    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/plain" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    body_parts.append(payload.decode(charset, errors="replace"))
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            body_parts.append(payload.decode(charset, errors="replace"))

    body = "\n".join(body_parts).strip()
    # Clean up excessive whitespace
    body = re.sub(r"\n{3,}", "\n\n", body)
    body = re.sub(r"[ \t]+", " ", body)

    if len(body) > max_chars:
        body = body[:max_chars] + f"\n\n[... email truncated at {max_chars} chars ...]"

    return body or "(no text body)"


class EmailReadTool(Tool):
    """Search and read emails from the user's IMAP inbox."""

    name = "email_read"
    description = (
        "Search and read emails from the user's email inbox via IMAP. "
        "Use this when the user asks to check, read, list, or search their email. "
        "Can filter by sender, subject, or return recent messages."
    )
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "Search query. Can be sender name/email (e.g. 'Blink' or 'noreply@blink.com'), "
                    "subject keywords, or 'ALL' for recent messages."
                ),
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of emails to return (default: 5, max: 20).",
                "minimum": 1,
                "maximum": 20,
            },
            "include_body": {
                "type": "boolean",
                "description": "Whether to include the email body. Default: True.",
            },
            "mailbox": {
                "type": "string",
                "description": "Mailbox/folder to search (default: INBOX).",
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
        max_results: int = 5,
        include_body: bool = True,
        mailbox: str = "INBOX",
        **kwargs: Any,
    ) -> str:
        if not self.imap_host or not self.username or not self.password:
            return "Error: IMAP not configured. Check imap_host, username and password in config."

        try:
            # We run in a separate thread because imaplib is blocking
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                self._fetch_emails,
                query,
                min(max_results, 20),
                include_body,
                mailbox,
            )
            return result
        except Exception as e:
            logger.error("Email reading error: {}", e)
            return f"Error reading email: {e}"

    def _fetch_emails(
        self,
        query: str,
        max_results: int,
        include_body: bool,
        mailbox: str,
    ) -> str:
        """Synchronous IMAP fetch (runs in executor)."""
        if self.use_ssl:
            conn = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
        else:
            conn = imaplib.IMAP4(self.imap_host, self.imap_port)

        try:
            conn.login(self.username, self.password)
            conn.select(mailbox, readonly=True)

            q = query.strip()
            message_ids = []

            if q.upper() == "ALL":
                _, data = conn.search(None, "ALL")
                if data and data[0]:
                    message_ids = data[0].split()
            else:
                # Sequential Search Strategy for maximum reliability with Gmail/IMAP
                # 1. Try search by FROM
                search_criteria = f'FROM "{q}"'
                _, data = conn.search(None, search_criteria)
                if data and data[0]:
                    message_ids.extend(data[0].split())
                
                # 2. Try search by SUBJECT if not enough results
                if len(message_ids) < max_results:
                    search_criteria = f'SUBJECT "{q}"'
                    _, data = conn.search(None, search_criteria)
                    if data and data[0]:
                        # Add new IDs without duplicates
                        new_ids = [mid for mid in data[0].split() if mid not in message_ids]
                        message_ids.extend(new_ids)

                # 3. If still nothing, try a general TEXT search
                if not message_ids:
                    search_criteria = f'TEXT "{q}"'
                    _, data = conn.search(None, search_criteria)
                    if data and data[0]:
                        message_ids = data[0].split()

            if not message_ids:
                # 4. Final attempt: search for just the first word (usually the first name)
                first_word = q.split()[0]
                if len(first_word) > 2:
                    search_criteria = f'FROM "{first_word}"'
                    _, data = conn.search(None, search_criteria)
                    if data and data[0]:
                        message_ids = data[0].split()

            if not message_ids:
                return (
                    f"Nenhum e-mail encontrado para '{query}' na pasta {mailbox}.\n\n"
                    "Dicas: \n"
                    "- Tente usar apenas o primeiro nome.\n"
                    "- Verifique se o nome está escrito corretamente.\n"
                    "- Certifique-se de que o e-mail não caiu no Spam."
                )

            # Get most recent emails (last N, newest first)
            # IDs are usually sequential in IMAP, so we just sort them numerically
            sorted_ids = sorted(list(set(message_ids)), key=int)
            recent_ids = list(reversed(sorted_ids[-max_results:]))

            results = []
            for msg_id in recent_ids:
                try:
                    _, msg_data = conn.fetch(msg_id, "(RFC822)")
                    if not msg_data or not msg_data[0]:
                        continue

                    raw_email = msg_data[0][1]
                    if not isinstance(raw_email, bytes):
                        continue

                    msg = email.message_from_bytes(raw_email)

                    subject = _decode_header(msg.get("Subject"))
                    sender = _decode_header(msg.get("From"))
                    date = _decode_header(msg.get("Date"))
                    to = _decode_header(msg.get("To"))

                    entry = [
                        f"📧 **E-mail #{len(results) + 1}**",
                        f"**De:** {sender}",
                        f"**Para:** {to}",
                        f"**Assunto:** {subject}",
                        f"**Data:** {date}",
                    ]

                    if include_body:
                        body = _extract_body(msg)
                        entry.append(f"**Conteúdo:**\n{body}")

                    results.append("\n".join(entry))
                except Exception as e:
                    logger.warning("Failed to fetch email ID {}: {}", msg_id, e)
                    continue

            if not results:
                return f"Não foi possível ler os e-mails encontrados para '{query}'."

            header = f"Encontrei {len(results)} e-mail(s) para '{query}' na pasta {mailbox}:\n\n"
            return header + "\n\n---\n\n".join(results)

        finally:
            try:
                conn.logout()
            except Exception:
                pass
