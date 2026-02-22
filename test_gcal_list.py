import asyncio
import json
from nanobot.agent.tools.google_calendar import GoogleCalendarTool

async def test():
    tool = GoogleCalendarTool(credentials_path="credentials.json", token_path="token.pickle")
    # Action 'list' defaults to today
    res = await tool.execute(action="list")
    print(res)

asyncio.run(test())
