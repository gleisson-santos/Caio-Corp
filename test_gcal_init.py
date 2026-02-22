from nanobot.agent.tools.google_calendar import GoogleCalendarTool
import asyncio

async def test():
    try:
        tool = GoogleCalendarTool(credentials_path="credentials.json", token_path="token.pickle")
        print("Tool initialized")
        # Note: we don't call execute because it would block for auth
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
