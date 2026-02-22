"""Google Calendar tool: list, search and create events."""

from __future__ import annotations

import datetime
import os.path
import pickle
from typing import Any

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from nanobot.agent.tools.base import Tool

# If modifying these scopes, delete the file token.pickle.
SCOPES = ["https://www.googleapis.com/auth/calendar"]


class GoogleCalendarTool(Tool):
    """Tool to interact with Google Calendar."""

    name = "google_calendar"
    description = (
        "Interact with Google Calendar to list, search, create, update, or delete events. "
        "Use this for scheduling, checking availability, or managing the user's schedule. "
        "IMPORTANT: When a user asks to CHANGE, RESCHEDULE, or EDIT an event, you must SEARCH for the event first to get its ID, then call this tool with action='update' and the event_id."
    )
    parameters = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["list", "create", "delete", "search", "update"],
                "description": "Action to perform: 'list' (upcoming), 'create' (new), 'delete' (remove), 'search' (find by query), 'update' (edit existing).",
            },
            "summary": {
                "type": "string",
                "description": "Title/Summary of the event (required for 'create').",
            },
            "start_time": {
                "type": "string",
                "description": "Start time in ISO format (e.g. '2026-02-23T14:00:00'). Required for 'create'.",
            },
            "end_time": {
                "type": "string",
                "description": "End time in ISO format. If not provided for 'create', defaults to 1 hour after start_time.",
            },
            "description": {
                "type": "string",
                "description": "Optional description for the event.",
            },
            "query": {
                "type": "string",
                "description": "Search query for 'search' action.",
            },
            "event_id": {
                "type": "string",
                "description": "Event ID to delete or update (required for 'delete' and 'update').",
            },
            "max_results": {
                "type": "integer",
                "description": "Max events to return for 'list' or 'search' (default: 10).",
            },
        },
        "required": ["action"],
    }

    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.pickle", timezone: str = "UTC"):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.timezone = timezone
        self._service = None

    def _get_service(self):
        """Authenticate and get the Google Calendar service."""
        if self._service:
            return self._service

        creds = None
        # The file token.pickle stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first time.
        if os.path.exists(self.token_path):
            with open(self.token_path, "rb") as token:
                creds = pickle.load(token)

        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(
                        f"Google Calendar credentials not found at {self.credentials_path}. "
                        "Please place a 'credentials.json' file from Google Cloud Console in "
                        "your nanobot directory."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)

            # Save the credentials for the next run
            with open(self.token_path, "wb") as token:
                pickle.dump(creds, token)

        self._service = build("calendar", "v3", credentials=creds)
        return self._service

    async def execute(self, action: str, **kwargs: Any) -> str:
        try:
            service = self._get_service()
        except Exception as e:
            return f"Error authenticating with Google Calendar: {e}"

        if action == "list":
            return self._list_events(service, kwargs.get("max_results", 10))
        elif action == "create":
            return self._create_event(service, kwargs)
        elif action == "delete":
            return self._delete_event(service, kwargs.get("event_id"))
        elif action == "update":
            return self._update_event(service, kwargs.get("event_id"), kwargs)
        elif action == "search":
            return self._search_events(service, kwargs.get("query", ""), kwargs.get("max_results", 10))
        
        return f"Unknown action: {action}"

    def _list_events(self, service: Any, max_results: int) -> str:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            return "No upcoming events found."

        res = [f"Upcoming events (Timezone: {self.timezone}):"]
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            res.append(f"- {start}: {event['summary']} (ID: {event['id']})")
        return "\n".join(res)

    def _create_event(self, service: Any, data: dict[str, Any]) -> str:
        summary = data.get("summary")
        start_time = data.get("start_time")
        if not summary or not start_time:
            return "Error: summary and start_time are required for creating an event."

        # Default end time to 1 hour after start
        if not data.get("end_time"):
            try:
                dt_start = datetime.datetime.fromisoformat(start_time.replace("Z", ""))
                dt_end = dt_start + datetime.timedelta(hours=1)
                end_time = dt_end.isoformat()
            except ValueError:
                return f"Error: Invalid start_time format '{start_time}'."
        else:
            end_time = data.get("end_time")

        event = {
            "summary": summary,
            "description": data.get("description", ""),
            "start": {
                "dateTime": start_time,
                "timeZone": self.timezone,
            },
            "end": {
                "dateTime": end_time,
                "timeZone": self.timezone,
            },
        }

        try:
            event = service.events().insert(calendarId="primary", body=event).execute()
            return f"Event created: {event.get('htmlLink')}"
        except Exception as e:
            return f"Error creating event: {e}"

    def _delete_event(self, service: Any, event_id: str | None) -> str:
        if not event_id:
            return "Error: event_id is required for deleting an event."
        try:
            service.events().delete(calendarId="primary", eventId=event_id).execute()
            return f"Event {event_id} deleted successfully."
        except Exception as e:
            return f"Error deleting event: {e}"

    def _update_event(self, service: Any, event_id: str | None, data: dict[str, Any]) -> str:
        if not event_id:
            return "Error: event_id is required for updating an event."
        
        try:
            # First, fetch the existing event
            event = service.events().get(calendarId="primary", eventId=event_id).execute()
        except Exception as e:
            return f"Error fetching event to update: {e}"

        # Update fields if provided
        if data.get("summary"):
            event["summary"] = data["summary"]
        if data.get("description"):
            event["description"] = data["description"]
        
        if data.get("start_time"):
            event["start"] = {"dateTime": data["start_time"], "timeZone": self.timezone}
            # If start_time is updated but end_time isn't, default end_time to +1h from new start
            if not data.get("end_time"):
                try:
                    dt_start = datetime.datetime.fromisoformat(data["start_time"].replace("Z", ""))
                    dt_end = dt_start + datetime.timedelta(hours=1)
                    event["end"] = {"dateTime": dt_end.isoformat(), "timeZone": self.timezone}
                except ValueError:
                    pass
        
        if data.get("end_time"):
            event["end"] = {"dateTime": data["end_time"], "timeZone": self.timezone}

        try:
            updated_event = service.events().update(calendarId="primary", eventId=event_id, body=event).execute()
            return f"Event updated successfully: {updated_event.get('htmlLink')}"
        except Exception as e:
            return f"Error updating event: {e}"

    def _search_events(self, service: Any, query: str, max_results: int) -> str:
        if not query:
            return "Error: query is required for searching events."
        
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                q=query,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            return f"No events found matching '{query}'."

        res = [f"Found {len(events)} events matching '{query}':"]
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            res.append(f"- {start}: {event['summary']} (ID: {event['id']})")
        return "\n".join(res)
