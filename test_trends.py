import asyncio
from trends_service import fetch_hackernews, fetch_devto, fetch_google_news

async def test():
    print("Testing trend sources...\n")
    
    hn = await fetch_hackernews("AI/Tech")
    print(f"HackerNews: {len(hn)} items")
    for t in hn[:2]:
        print(f"  - {t['title'][:80]}")
    
    dt = await fetch_devto("AI/Tech")
    print(f"\nDev.to: {len(dt)} items")
    for t in dt[:2]:
        print(f"  - {t['title'][:80]}")
    
    gn = await fetch_google_news("AI technology")
    print(f"\nGoogle News: {len(gn)} items")
    for t in gn[:2]:
        print(f"  - {t['title'][:80]}")
    
    total = len(hn) + len(dt) + len(gn)
    print(f"\nTotal trends fetched: {total}")
    print("PASS" if total > 0 else "WARN: no trends returned — check network/API keys")

asyncio.run(test())
