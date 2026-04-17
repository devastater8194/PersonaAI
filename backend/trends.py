"""Trends API routes — snscrape + HackerNews + Dev.to + Google News + Newsdata.io."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from supabase_client import get_db
from trends_service import fetch_all_trends
from notifications_service import send_push_notification, send_trend_alert_email

router = APIRouter()


class TrendAlertRequest(BaseModel):
    user_id: str
    fcm_token: Optional[str] = None   # Firebase device token from frontend
    email: Optional[str] = None


@router.get("/{user_id}")
async def get_trends(user_id: str):
    """
    Fetch fresh trends for the user's domain.
    Sources: snscrape (X/Twitter) + Hacker News + Dev.to + Google News + Newsdata.io
    All free — no Reddit API needed.
    """
    db = get_db()

    identity = db.table("identities").select("domain,interests,name").eq("user_id", user_id).single().execute()
    if not identity.data:
        raise HTTPException(status_code=404, detail="Identity not found")

    domain    = identity.data.get("domain", "technology")
    interests = identity.data.get("interests", "")

    trends = await fetch_all_trends(domain, interests)

    if trends:
        cache_rows = [{
            "user_id":         user_id,
            "title":           t["title"],
            "source":          t["source"],
            "tag":             t.get("tag", ""),
            "relevance_score": t.get("relevance_score", 0.8),
            "url":             t.get("url", ""),
        } for t in trends]

        db.table("trends_cache").delete().eq("user_id", user_id).execute()
        db.table("trends_cache").insert(cache_rows).execute()

    return {"trends": trends, "count": len(trends)}


@router.post("/alert")
async def send_trend_alert(req: TrendAlertRequest, trend_title: str, trend_source: str):
    """
    Send push + email alert when a high-relevance trend is detected.
    """
    db = get_db()
    identity = db.table("identities").select("name").eq("user_id", req.user_id).single().execute()
    user_name = identity.data.get("name", "there") if identity.data else "there"

    if req.fcm_token:
        await send_push_notification(
            fcm_token=req.fcm_token,
            title="🔥 Trending in your niche!",
            body=trend_title[:100],
            data={"type": "trend_alert", "source": trend_source}
        )

    if req.email:
        await send_trend_alert_email(
            to_email=req.email,
            user_name=user_name,
            trend_title=trend_title,
            trend_source=trend_source
        )

    return {"success": True, "notified_via": {"push": bool(req.fcm_token), "email": bool(req.email)}}
