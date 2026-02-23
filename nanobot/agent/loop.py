"""Agent loop: the core processing engine."""

from __future__ import annotations

import asyncio
import json
import re
import uuid
from contextlib import AsyncExitStack
from pathlib import Path
from typing import TYPE_CHECKING, Any, Awaitable, Callable

from loguru import logger

from nanobot.agent.context import ContextBuilder
from nanobot.agent.memory import MemoryStore
from nanobot.agent.subagent import SubagentManager
from nanobot.agent.tools.cron import CronTool
from nanobot.agent.tools.email_read import EmailReadTool
from nanobot.agent.tools.email_delete import EmailDeleteTool
from nanobot.agent.tools.email_send import EmailSendTool
from nanobot.agent.tools.filesystem import EditFileTool, ListDirTool, ReadFileTool, WriteFileTool
from nanobot.agent.tools.google_calendar import GoogleCalendarTool
from nanobot.agent.tools.message import MessageTool
from nanobot.agent.tools.registry import ToolRegistry
from nanobot.agent.tools.shell import ExecTool
from nanobot.agent.tools.spawn import SpawnTool
from nanobot.agent.tools.web import WebFetchTool, WebSearchTool
from nanobot.bus.events import InboundMessage, OutboundMessage
from nanobot.bus.queue import MessageBus
from nanobot.providers.base import LLMProvider, ToolCallRequest
from nanobot.session.manager import Session, SessionManager

if TYPE_CHECKING:
    from nanobot.config.schema import ExecToolConfig
    from nanobot.cron.service import CronService


class AgentLoop:
    """
    The agent loop is the core processing engine.

    It:
    1. Receives messages from the bus
    2. Builds context with history, memory, skills
    3. Calls the LLM
    4. Executes tool calls
    5. Sends responses back
    """

    def __init__(
        self,
        bus: MessageBus,
        provider: LLMProvider,
        workspace: Path,
        model: str | None = None,
        max_iterations: int = 20,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        memory_window: int = 50,
        brave_api_key: str | None = None,
        exec_config: ExecToolConfig | None = None,
        cron_service: CronService | None = None,
        restrict_to_workspace: bool = False,
        session_manager: SessionManager | None = None,
        mcp_servers: dict | None = None,
        email_config: dict | None = None,
        gcal_config: dict | None = None,
        fallback_models: list[str] | None = None,
    ):
        from nanobot.config.schema import ExecToolConfig
        self.bus = bus
        self.provider = provider
        self.workspace = workspace
        self.model = model or provider.get_default_model()
        self.max_iterations = max_iterations
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.memory_window = memory_window
        self.brave_api_key = brave_api_key
        self.exec_config = exec_config or ExecToolConfig()
        self.cron_service = cron_service
        self.restrict_to_workspace = restrict_to_workspace
        self.email_config = email_config or {}
        self.gcal_config = gcal_config or {}
        self.fallback_models = fallback_models or []

        self.context = ContextBuilder(workspace)
        self.sessions = session_manager or SessionManager(workspace)
        self.tools = ToolRegistry()
        self.subagents = SubagentManager(
            provider=provider,
            workspace=workspace,
            bus=bus,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            brave_api_key=brave_api_key,
            exec_config=self.exec_config,
            restrict_to_workspace=restrict_to_workspace,
        )

        self._running = False
        self._mcp_servers = mcp_servers or {}
        self._mcp_stack: AsyncExitStack | None = None
        self._mcp_connected = False
        self._mcp_connecting = False
        self._consolidating: set[str] = set()  # Session keys with consolidation in progress
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Register the default set of tools."""
        allowed_dir = self.workspace if self.restrict_to_workspace else None
        for cls in (ReadFileTool, WriteFileTool, EditFileTool, ListDirTool):
            self.tools.register(cls(workspace=self.workspace, allowed_dir=allowed_dir))
        self.tools.register(ExecTool(
            working_dir=str(self.workspace),
            timeout=self.exec_config.timeout,
            restrict_to_workspace=self.restrict_to_workspace,
        ))
        self.tools.register(WebSearchTool(api_key=self.brave_api_key))
        self.tools.register(WebFetchTool())
        self.tools.register(MessageTool(send_callback=self.bus.publish_outbound))
        self.tools.register(SpawnTool(manager=self.subagents))
        if self.cron_service:
            self.tools.register(CronTool(self.cron_service))
        # Register email reading tool if IMAP credentials are configured
        ec = self.email_config
        if ec.get("imap_host") and ec.get("imap_username") and ec.get("imap_password"):
            self.tools.register(EmailReadTool(
                imap_host=ec["imap_host"],
                imap_port=ec.get("imap_port", 993),
                username=ec["imap_username"],
                password=ec["imap_password"],
                use_ssl=ec.get("imap_use_ssl", True),
            ))
            logger.info("Email read tool registered for {}", ec["imap_username"])

            # Register email delete tool (same IMAP credentials)
            self.tools.register(EmailDeleteTool(
                imap_host=ec["imap_host"],
                imap_port=ec.get("imap_port", 993),
                username=ec["imap_username"],
                password=ec["imap_password"],
                use_ssl=ec.get("imap_use_ssl", True),
            ))
            logger.info("Email delete tool registered for {}", ec["imap_username"])

        if ec.get("smtp_host") and ec.get("smtp_username") and ec.get("smtp_password"):
            self.tools.register(EmailSendTool(
                smtp_host=ec["smtp_host"],
                smtp_port=ec.get("smtp_port", 587),
                username=ec["smtp_username"],
                password=ec["smtp_password"],
                use_tls=ec.get("smtp_use_tls", True),
                use_ssl=ec.get("smtp_use_ssl", False),
                from_address=ec.get("from_address"),
            ))
            logger.info("Email send tool registered for {}", ec["smtp_username"])

        # Register Google Calendar tool if enabled
        gc = self.gcal_config
        if gc.get("enabled"):
            self.tools.register(GoogleCalendarTool(
                credentials_path=gc.get("credentials_path", "credentials.json"),
                token_path=gc.get("token_path", "token.pickle"),
                timezone=gc.get("timezone", "UTC")
            ))
            logger.info("Google Calendar tool registered")

    async def _connect_mcp(self) -> None:
        """Connect to configured MCP servers (one-time, lazy)."""
        if self._mcp_connected or self._mcp_connecting or not self._mcp_servers:
            return
        self._mcp_connecting = True
        from nanobot.agent.tools.mcp import connect_mcp_servers
        try:
            self._mcp_stack = AsyncExitStack()
            await self._mcp_stack.__aenter__()
            await connect_mcp_servers(self._mcp_servers, self.tools, self._mcp_stack)
            self._mcp_connected = True
        except Exception as e:
            logger.error("Failed to connect MCP servers (will retry next message): {}", e)
            if self._mcp_stack:
                try:
                    await self._mcp_stack.aclose()
                except Exception:
                    pass
                self._mcp_stack = None
        finally:
            self._mcp_connecting = False

    def _set_tool_context(self, channel: str, chat_id: str, message_id: str | None = None) -> None:
        """Update context for all tools that need routing info."""
        if message_tool := self.tools.get("message"):
            if isinstance(message_tool, MessageTool):
                message_tool.set_context(channel, chat_id, message_id)

        if spawn_tool := self.tools.get("spawn"):
            if isinstance(spawn_tool, SpawnTool):
                spawn_tool.set_context(channel, chat_id)

        if cron_tool := self.tools.get("cron"):
            if isinstance(cron_tool, CronTool):
                cron_tool.set_context(channel, chat_id)

    @staticmethod
    def _strip_think(text: str | None) -> str | None:
        """Remove <think>…</think> blocks that some models embed in content."""
        if not text:
            return None
        return re.sub(r"<think>[\s\S]*?</think>", "", text).strip() or None

    @staticmethod
    def _tool_hint(tool_calls: list) -> str:
        """Format tool calls as concise hint, e.g. 'web_search("query")'."""
        def _fmt(tc):
            val = next(iter(tc.arguments.values()), None) if tc.arguments else None
            if not isinstance(val, str):
                return tc.name
            return f'{tc.name}("{val[:40]}…")' if len(val) > 40 else f'{tc.name}("{val}")'
        return ", ".join(_fmt(tc) for tc in tool_calls)

    def _try_extract_tool_calls(self, content: str | None) -> list[ToolCallRequest]:
        """Try to extract tool calls from JSON blocks in text content."""
        if not content:
            return []

        tool_calls = []
        # Pattern to find blocks that look like JSON: { ... }
        # We look for markdown blocks or just raw braces
        json_pattern = re.compile(r'({[\s\S]*?})')
        matches = json_pattern.findall(content)

        for match in matches:
            try:
                data = json.loads(match)
                # Standard format: {"name": "...", "parameters": {...}}
                name = data.get("name")
                args = data.get("parameters") or data.get("arguments")

                # Fallback for models that output the tool action directly as the top-level
                if not name and data.get("action") and "google_calendar" in self.tools.tool_names:
                    name = "google_calendar"
                    args = data

                if name and self.tools.get(name):
                    tool_calls.append(ToolCallRequest(
                        id=f"ext_{uuid.uuid4().hex[:8]}",
                        name=name,
                        arguments=args if isinstance(args, dict) else {}
                    ))
            except Exception:
                continue
        return tool_calls

    async def _run_agent_loop(
        self,
        initial_messages: list[dict],
        session: Session | None = None,
        on_progress: Callable[[str], Awaitable[None]] | None = None,
    ) -> tuple[str | None, list[str]]:
        """Run the agent iteration loop. Returns (final_content, tools_used)."""
        messages = initial_messages
        iteration = 0
        final_content = None
        tools_used: list[str] = []

        while iteration < self.max_iterations:
            iteration += 1

            # Fallback logic for model selection
            models_to_try = [self.model] + self.fallback_models
            response = None
            last_error = None

            for m in models_to_try:
                try:
                    response = await self.provider.chat(
                        messages=messages,
                        tools=self.tools.get_definitions(),
                        model=m,
                        temperature=self.temperature,
                        max_tokens=self.max_tokens,
                    )
                    
                    # If we got a provider error, try fallback
                    if response.finish_reason == "error":
                        error_msg = response.content or "Unknown provider error"
                        logger.warning("Model {} failed: {}. Trying fallback...", m, error_msg)
                        last_error = error_msg
                        continue
                    
                    # If we got tool calls or content, it's a success
                    # Update current model to the one that worked for this run
                    if m != self.model:
                        logger.info("Successfully fell back to model: {}", m)
                        self.model = m
                    break
                except Exception as e:
                    logger.warning("Exception calling model {}: {}. Trying fallback...", m, e)
                    last_error = str(e)
                    continue
            
            if not response or response.finish_reason == "error":
                final_content = f"Fatal: All models failed. Last error: {last_error}"
                logger.error(final_content)
                break
            
            # Robustness improvement: if no structured tool calls, try extracting from text
            if not response.has_tool_calls and response.content:
                extracted = self._try_extract_tool_calls(response.content)
                if extracted:
                    logger.info("Extracted {} tool calls from text content", len(extracted))
                    response.tool_calls = extracted

            if response.has_tool_calls:
                if on_progress:
                    clean = self._strip_think(response.content)
                    if clean:
                        await on_progress(clean)
                    await on_progress(self._tool_hint(response.tool_calls))

                tool_call_dicts = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.name,
                            "arguments": json.dumps(tc.arguments, ensure_ascii=False)
                        }
                    }
                    for tc in response.tool_calls
                ]
                messages = self.context.add_assistant_message(
                    messages, response.content, tool_call_dicts,
                    reasoning_content=response.reasoning_content,
                )
                if session:
                    session.add_message(
                        role="assistant",
                        content=response.content or "",
                        tool_calls=tool_call_dicts,
                        reasoning_content=response.reasoning_content
                    )

                for tool_call in response.tool_calls:
                    tools_used.append(tool_call.name)
                    args_str = json.dumps(tool_call.arguments, ensure_ascii=False)
                    logger.info("Tool call: {}({})", tool_call.name, args_str[:200])
                    result = await self.tools.execute(tool_call.name, tool_call.arguments)
                    messages = self.context.add_tool_result(
                        messages, tool_call.id, tool_call.name, result
                    )
                    if session:
                        session.add_message(
                            role="tool",
                            tool_call_id=tool_call.id,
                            name=tool_call.name,
                            content=result
                        )
            else:
                final_content = self._strip_think(response.content)
                break

        return final_content, tools_used

    async def run(self) -> None:
        """Run the agent loop, processing messages from the bus."""
        self._running = True
        await self._connect_mcp()
        logger.info("Agent loop started")

        while self._running:
            try:
                msg = await asyncio.wait_for(
                    self.bus.consume_inbound(),
                    timeout=1.0
                )
                try:
                    response = await self._process_message(msg)
                    if response is not None:
                        await self.bus.publish_outbound(response)
                    elif msg.channel == "cli":
                        await self.bus.publish_outbound(OutboundMessage(
                            channel=msg.channel, chat_id=msg.chat_id, content="", metadata=msg.metadata or {},
                        ))
                except Exception as e:
                    logger.error("Error processing message: {}", e)
                    await self.bus.publish_outbound(OutboundMessage(
                        channel=msg.channel,
                        chat_id=msg.chat_id,
                        content=f"Sorry, I encountered an error: {str(e)}"
                    ))
            except asyncio.TimeoutError:
                continue

    async def close_mcp(self) -> None:
        """Close MCP connections."""
        if self._mcp_stack:
            try:
                await self._mcp_stack.aclose()
            except (RuntimeError, BaseExceptionGroup):
                pass  # MCP SDK cancel scope cleanup is noisy but harmless
            self._mcp_stack = None

    def stop(self) -> None:
        """Stop the agent loop."""
        self._running = False
        logger.info("Agent loop stopping")

    async def _process_message(
        self,
        msg: InboundMessage,
        session_key: str | None = None,
        on_progress: Callable[[str], Awaitable[None]] | None = None,
    ) -> OutboundMessage | None:
        """Process a single inbound message and return the response."""
        # System messages: parse origin from chat_id ("channel:chat_id")
        if msg.channel == "system":
            channel, chat_id = (msg.chat_id.split(":", 1) if ":" in msg.chat_id
                                else ("cli", msg.chat_id))
            logger.info("Processing system message from {}", msg.sender_id)
            key = f"{channel}:{chat_id}"
            session = self.sessions.get_or_create(key)
            self._set_tool_context(channel, chat_id, msg.metadata.get("message_id"))
            messages = self.context.build_messages(
                history=session.get_history(max_messages=self.memory_window),
                current_message=msg.content, channel=channel, chat_id=chat_id,
            )
            session.add_message("user", msg.content)
            final_content, _ = await self._run_agent_loop(messages, session=session)
            # No need to add assistant message here as it's added inside the loop
            self.sessions.save(session)
            return OutboundMessage(channel=channel, chat_id=chat_id,
                                  content=final_content or "Background task completed.")

        preview = msg.content[:80] + "..." if len(msg.content) > 80 else msg.content
        logger.info("Processing message from {}:{}: {}", msg.channel, msg.sender_id, preview)

        key = session_key or msg.session_key
        session = self.sessions.get_or_create(key)

        # Slash commands
        cmd = msg.content.strip().lower()
        if cmd == "/new":
            messages_to_archive = session.messages.copy()
            session.clear()
            self.sessions.save(session)
            self.sessions.invalidate(session.key)

            async def _consolidate_and_cleanup():
                temp = Session(key=session.key)
                temp.messages = messages_to_archive
                await self._consolidate_memory(temp, archive_all=True)

            asyncio.create_task(_consolidate_and_cleanup())
            return OutboundMessage(channel=msg.channel, chat_id=msg.chat_id,
                                  content="New session started. Memory consolidation in progress.")
        if cmd == "/help":
            return OutboundMessage(channel=msg.channel, chat_id=msg.chat_id,
                                  content="🐈 nanobot commands:\n/new — Start a new conversation\n/help — Show available commands")

        if len(session.messages) > self.memory_window and session.key not in self._consolidating:
            self._consolidating.add(session.key)

            async def _consolidate_and_unlock():
                try:
                    await self._consolidate_memory(session)
                finally:
                    self._consolidating.discard(session.key)

            asyncio.create_task(_consolidate_and_unlock())

        self._set_tool_context(msg.channel, msg.chat_id, msg.metadata.get("message_id"))
        if message_tool := self.tools.get("message"):
            if isinstance(message_tool, MessageTool):
                message_tool.start_turn()

        initial_messages = self.context.build_messages(
            history=session.get_history(max_messages=self.memory_window),
            current_message=msg.content,
            media=msg.media if msg.media else None,
            channel=msg.channel, chat_id=msg.chat_id,
        )

        async def _bus_progress(content: str) -> None:
            # Skip tool-call syntax (e.g. edit_file(...) or just tool names) to avoid leaking internal tokens to the chat.
            # We look for something that starts with a word (potential tool name).
            # If the session is a cron session, we are extra careful.
            is_cron = session.key.startswith("cron:")
            trimmed = content.strip()
            
            # Pattern matches common tool names or word + parenthesis
            _tool_pattern = re.compile(r'^(cron|email_send|email_read|google_calendar|message|read_file|write_file|edit_file|ls|exec|spawn|web_search|web_fetch)\b', re.IGNORECASE)
            _call_pattern = re.compile(r'^\w+\s*\(', re.DOTALL)
            
            if _tool_pattern.match(trimmed) or _call_pattern.match(trimmed):
                logger.debug("Suppressing tool progress message: {}", content[:80])
                return
            
            if is_cron and len(trimmed) < 10 and "(" in content: # Defensive for cron turns
                return

            meta = dict(msg.metadata or {})
            meta["_progress"] = True
            await self.bus.publish_outbound(OutboundMessage(
                channel=msg.channel, chat_id=msg.chat_id, content=content, metadata=meta,
            ))

        session.add_message("user", msg.content)
        final_content, tools_used = await self._run_agent_loop(
            initial_messages, session=session, on_progress=on_progress or _bus_progress,
        )

        if final_content is None:
            final_content = "I've completed processing but have no response to give."
        
        # Add final assistant message to session (the loop only adds tool-calling assistant messages)
        # Check if last message in session is already an assistant message with this content
        last_msg = session.messages[-1] if session.messages else None
        if not last_msg or last_msg.get("role") != "assistant" or last_msg.get("content") != final_content:
            session.add_message("assistant", final_content,
                                tools_used=tools_used if tools_used else None)
        
        preview = final_content[:120] + "..." if len(final_content) > 120 else final_content
        logger.info("Response to {}:{}: {}", msg.channel, msg.sender_id, preview)

        self.sessions.save(session)

        if message_tool := self.tools.get("message"):
            if isinstance(message_tool, MessageTool) and message_tool._sent_in_turn:
                return None

        return OutboundMessage(
            channel=msg.channel, chat_id=msg.chat_id, content=final_content,
            metadata=msg.metadata or {},
        )

    async def _consolidate_memory(self, session, archive_all: bool = False) -> None:
        """Delegate to MemoryStore.consolidate()."""
        await MemoryStore(self.workspace).consolidate(
            session, self.provider, self.model,
            archive_all=archive_all, memory_window=self.memory_window,
        )

    async def process_direct(
        self,
        content: str,
        session_key: str = "cli:direct",
        channel: str = "cli",
        chat_id: str = "direct",
        on_progress: Callable[[str], Awaitable[None]] | None = None,
    ) -> str:
        """Process a message directly (for CLI or cron usage)."""
        await self._connect_mcp()
        msg = InboundMessage(channel=channel, sender_id="user", chat_id=chat_id, content=content)
        response = await self._process_message(msg, session_key=session_key, on_progress=on_progress)
        return response.content if response else ""
