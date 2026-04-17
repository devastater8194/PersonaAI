"""
╔══════════════════════════════════════════════════════════════╗
║  TRENDS SERVICE — Zero-Reddit, All Free Sources              ║
║                                                              ║
║  Sources (ALL FREE, no paid API key needed):                 ║
║                                                              ║
║  1. snscrape — scrapes X/Twitter posts (no key needed)       ║
║     pip install snscrape                                     ║
║                                                              ║
║  2. Hacker News — official free JSON API                     ║
║     https://hacker-news.firebaseio.com  (no key needed)      ║
║                                                              ║
║  3. Dev.to — free public REST API                            ║
║     https://dev.to/api  (no key needed for reading)          ║
║                                                              ║
║  4. Google News RSS — public feed                            ║
║     https://news.google.com/rss  (no key needed)             ║
║                                                              ║
║  5. Newsdata.io — free tier (200 req/day) OPTIONAL           ║
║     https://newsdata.io → sign up → copy API key             ║
║     Set NEWSDATA_API_KEY=pub_... in backend/.env             ║
╚══════════════════════════════════════════════════════════════╝
"""

import os
import asyncio
import feedparser
import httpx
from typing import List, Dict

# 🔧 OPTIONAL: Newsdata.io free tier (200 req/day)
# Sign up at https://newsdata.io → copy your API key (starts with pub_...)
# Leave blank to skip this source — all others work with zero keys
NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "")

# Keywords per domain — used to filter HN, Dev.to and X results
DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "ai":         ["AI", "machine learning", "LLM", "GPT", "artificial intelligence"],
    "saas":       ["SaaS", "startup", "product", "B2B", "software"],
    "tech":       ["technology", "programming", "software", "developer", "coding"],
    "startup":    ["startup", "founder", "fundraising", "YC", "venture"],
    "finance":    ["investing", "stocks", "market", "fintech", "crypto"],
    "marketing":  ["marketing", "growth", "SEO", "social media", "content"],
    "content":    ["content creator", "viral", "LinkedIn", "Instagram", "personal brand"],
    "design":     ["design", "UI", "UX", "Figma", "product design"],
    "edtech":     ["education", "learning", "course", "edtech", "skills"],
    "default":    ["technology", "startup", "AI", "innovation", "product"],
}


def get_keywords_for_domain(domain: str) -> List[str]:
    """Match user domain string to a keyword list."""
    d = domain.lower()
    for key, kws in DOMAIN_KEYWORDS.items():
        if key in d:
            return kws
    extra = [w.strip() for w in domain.replace("/", " ").split() if len(w) > 2]
    return DOMAIN_KEYWORDS["default"] + extra[:3]


# ─────────────────────────────────────────────────────────────
# SOURCE 1: snscrape — X/Twitter (no API key)
# ─────────────────────────────────────────────────────────────

async def fetch_twitter_snscrape(domain: str, limit: int = 8) -> List[Dict]:
    """
    Uses snscrape to scrape trending tweets — no Twitter API key needed.
    Runs in a thread executor since snscrape is synchronous.

    Install: pip install snscrape
    Docs:    https://github.com/JustAnotherArchivist/snscrape
    """
    try:
        import snscrape.modules.twitter as sntwitter

        keywords = get_keywords_for_domain(domain)
        query = " OR ".join(f'"{kw}"' for kw in keywords[:2]) + " lang:en min_faves:100"

        def _scrape():
            results = []
            scraper = sntwitter.TwitterSearchScraper(query)
            for i, tweet in enumerate(scraper.get_items()):
                if i >= limit:
                    break
                results.append({
                    "source":          "X / Twitter",
                    "title":           tweet.content[:200],
                    "url":             tweet.url,
                    "score":           (tweet.likeCount or 0) + (tweet.retweetCount or 0) * 3,
                    "tag":             keywords[0].lower() if keywords else "trending",
                    "relevance_score": 0.88,
                })
            return results

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _scrape)

    except ImportError:
        print("⚠️  snscrape not installed — run: pip install snscrape")
        return []
    except Exception as e:
        print(f"⚠️  snscrape fetch failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# SOURCE 2: Hacker News — official free JSON API, no key
# ─────────────────────────────────────────────────────────────

async def fetch_hackernews(domain: str, limit: int = 8) -> List[Dict]:
    """
    Fetches top stories from Hacker News official API.
    Filters by domain keywords. Completely free, no key needed.
    API docs: https://github.com/HackerNews/API
    """
    keywords = [kw.lower() for kw in get_keywords_for_domain(domain)]

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            top_resp = await client.get(
                "https://hacker-news.firebaseio.com/v0/topstories.json"
            )
            top_ids = top_resp.json()[:40]

            tasks = [
                client.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
                for sid in top_ids
            ]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            trends = []
            for resp in responses:
                if isinstance(resp, Exception) or resp.status_code != 200:
                    continue
                story = resp.json()
                if not story or story.get("type") != "story":
                    continue
                title = (story.get("title") or "").lower()
                if not any(kw in title for kw in keywords):
                    continue
                trends.append({
                    "source":          "Hacker News",
                    "title":           story.get("title", ""),
                    "url":             story.get("url") or f"https://news.ycombinator.com/item?id={story['id']}",
                    "score":           story.get("score", 0),
                    "tag":             "tech",
                    "relevance_score": 0.86,
                })
                if len(trends) >= limit:
                    break

        return trends

    except Exception as e:
        print(f"⚠️  Hacker News fetch failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# SOURCE 3: Dev.to — free public API, no key needed
# ─────────────────────────────────────────────────────────────

async def fetch_devto(domain: str, limit: int = 6) -> List[Dict]:
    """
    Fetches trending articles from Dev.to public API.
    No API key needed.
    API docs: https://developers.forem.com/api
    """
    keywords = get_keywords_for_domain(domain)
    tag = keywords[0].lower().replace(" ", "")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://dev.to/api/articles",
                params={"tag": tag, "top": 7, "per_page": limit}
            )
            if resp.status_code != 200:
                resp = await client.get(
                    "https://dev.to/api/articles",
                    params={"top": 7, "per_page": limit}
                )

            trends = []
            for a in resp.json():
                trends.append({
                    "source":          "Dev.to",
                    "title":           a.get("title", ""),
                    "url":             a.get("url", ""),
                    "score":           a.get("positive_reactions_count", 0) + a.get("comments_count", 0) * 5,
                    "tag":             tag,
                    "relevance_score": 0.82,
                })
            return trends

    except Exception as e:
        print(f"⚠️  Dev.to fetch failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# SOURCE 4: Google News RSS — no key needed
# ─────────────────────────────────────────────────────────────

async def fetch_google_news(query: str, limit: int = 8) -> List[Dict]:
    """
    Fetches from Google News public RSS feed.
    No API key needed. Works for any topic query.
    """
    safe_query = query.replace(" ", "+").replace("/", "+")
    url = f"https://news.google.com/rss/search?q={safe_query}&hl=en-IN&gl=IN&ceid=IN:en"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
        feed = feedparser.parse(response.text)

        trends = []
        for entry in feed.entries[:limit]:
            trends.append({
                "source":          "Google News",
                "title":           entry.get("title", "").split(" - ")[0],
                "url":             entry.get("link", ""),
                "score":           500,
                "tag":             "news",
                "relevance_score": 0.80,
            })
        return trends

    except Exception as e:
        print(f"⚠️  Google News fetch failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# SOURCE 5: Newsdata.io — free tier, 200 req/day (OPTIONAL)
# ─────────────────────────────────────────────────────────────

async def fetch_newsdata(query: str, limit: int = 6) -> List[Dict]:
    """
    Fetches from Newsdata.io free tier (200 requests/day).
    OPTIONAL — only activates if NEWSDATA_API_KEY is set in .env.

    To enable:
      1. Sign up free at https://newsdata.io
      2. Copy your API key (starts with pub_...)
      3. Add NEWSDATA_API_KEY=pub_... to backend/.env
    """
    if not NEWSDATA_API_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://newsdata.io/api/1/news",
                params={
                    "apikey":   NEWSDATA_API_KEY,
                    "q":        query,
                    "language": "en",
                    "category": "technology,business",
                }
            )
            data = resp.json()
            if data.get("status") != "success":
                print(f"⚠️  Newsdata.io error: {data.get('message', 'unknown')}")
                return []

            trends = []
            for article in (data.get("results") or [])[:limit]:
                trends.append({
                    "source":          f"Newsdata · {article.get('source_id', '')}",
                    "title":           article.get("title", ""),
                    "url":             article.get("link", ""),
                    "score":           700,
                    "tag":             "news",
                    "relevance_score": 0.83,
                })
            return trends

    except Exception as e:
        print(f"⚠️  Newsdata.io fetch failed: {e}")
        return []


# ─────────────────────────────────────────────────────────────
# MASTER FETCH
# ─────────────────────────────────────────────────────────────

async def fetch_all_trends(domain: str, interests: str = "") -> List[Dict]:
    """
    Fetches from all free sources concurrently, merges,
    deduplicates and sorts by relevance + engagement score.
    Called by /api/trends/{user_id}.
    """
    query = f"{domain} {interests}".strip()

    results = await asyncio.gather(
        fetch_twitter_snscrape(domain),
        fetch_hackernews(domain),
        fetch_devto(domain),
        fetch_google_news(query),
        fetch_newsdata(query),
        return_exceptions=True
    )

    all_trends: List[Dict] = []
    for r in results:
        if isinstance(r, list):
            all_trends.extend(r)

    # Deduplicate by title prefix
    seen: set = set()
    unique: List[Dict] = []
    for t in all_trends:
        key = t.get("title", "")[:50].lower().strip()
        if key and key not in seen:
            seen.add(key)
            unique.append(t)

    unique.sort(
        key=lambda x: (x.get("relevance_score", 0), x.get("score", 0)),
        reverse=True
    )

    return unique[:20]
