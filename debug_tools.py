from nanobot.config.loader import load_config
from nanobot.agent.tools.google_calendar import GoogleCalendarTool
from nanobot.agent.tools.registry import ToolRegistry

config = load_config()
gcal_config = config.tools.google_calendar.model_dump()
print(f"GCal Config: {gcal_config}")

registry = ToolRegistry()
if gcal_config.get("enabled"):
    tool = GoogleCalendarTool(
        credentials_path=gcal_config.get("credentials_path", "credentials.json"),
        token_path=gcal_config.get("token_path", "token.pickle")
    )
    registry.register(tool)
    print("Google Calendar tool registered in dummy registry")

print(f"Registered tools: {registry.tool_names}")
print(f"Definitions: {registry.get_definitions()}")
