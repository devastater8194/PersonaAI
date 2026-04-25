import asyncio
from trends_service import generate_trend_summary

async def test():
    try:
        summary = await generate_trend_summary("https://example.com", "Example title")
        print(f"Summary: {summary}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
