from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import httpx
import os

from dotenv import load_dotenv
load_dotenv()

from supabase_client import get_db
from notifications_service import send_post_scheduled_email

router = APIRouter()

INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
INSTAGRAM_ACCOUNT_ID   = os.getenv("INSTAGRAM_ACCOUNT_ID", "")
CAROUSEL_SERVICE_URL   = os.getenv("CAROUSEL_SERVICE_URL", "http://localhost:3001")

class ScheduleRequest(BaseModel):
    draft_id: str
    user_id: str
    scheduled_for: str
    email: Optional[str] = None

class WeekPlanRequest(BaseModel):
    user_id: str
    approved_draft_ids: list[str]

@router.post("/queue")
async def queue_post(req: ScheduleRequest, background_tasks: BackgroundTasks):
    db = get_db()

    db.table("content_drafts").update({
        "status": "scheduled",
        "scheduled_for": req.scheduled_for
    }).eq("id", req.draft_id).execute()

    draft = db.table("content_drafts").select("platform").eq("id", req.draft_id).maybe_single().execute()
    platform = draft.data.get("platform") if draft.data else "unknown"

    db.table("scheduled_posts").insert({
        "draft_id":      req.draft_id,
        "user_id":       req.user_id,
        "platform":      platform,
        "scheduled_for": req.scheduled_for,
        "status":        "pending"
    }).execute()

    if req.email:
        background_tasks.add_task(
            send_post_scheduled_email,
            req.email,
            "there",
            platform,
            req.scheduled_for
        )

    return {"success": True, "scheduled_for": req.scheduled_for}

@router.post("/week-plan")
async def create_week_plan(req: WeekPlanRequest):
    db = get_db()
    today = datetime.now()

    optimal_times = {
        "linkedin":  ["08:30", "12:00", "17:30"],
        "instagram": ["10:00", "14:00", "19:00"],
        "twitter":   ["09:00", "13:00", "18:00"],
    }

    drafts = db.table("content_drafts")\
        .select("id,platform,content")\
        .in_("id", req.approved_draft_ids)\
        .execute()

    schedule = []
    for i, draft in enumerate(drafts.data or []):
        day_offset = i % 7
        target_day = today + timedelta(days=day_offset)
        times = optimal_times.get(draft["platform"], ["10:00"])
        time_str = times[i % len(times)]
        dt_str = f"{target_day.strftime('%Y-%m-%d')}T{time_str}:00"

        db.table("content_drafts").update({
            "status": "scheduled",
            "scheduled_for": dt_str
        }).eq("id", draft["id"]).execute()

        db.table("scheduled_posts").insert({
            "draft_id":      draft["id"],
            "user_id":       req.user_id,
            "platform":      draft["platform"],
            "scheduled_for": dt_str,
            "status":        "pending"
        }).execute()

        schedule.append({
            "draft_id":   draft["id"],
            "platform":   draft["platform"],
            "scheduled":  dt_str,
        })

    return {"success": True, "schedule": schedule}

@router.get("/upcoming/{user_id}")
async def get_upcoming(user_id: str):
    db = get_db()
    result = db.table("scheduled_posts")\
        .select("*, content_drafts(content, platform, content_type, topic)")\
        .eq("user_id", user_id)\
        .eq("status", "pending")\
        .order("scheduled_for")\
        .execute()
    return result.data or []

@router.post("/publish-instagram/{draft_id}")
async def publish_to_instagram(draft_id: str):
    token = INSTAGRAM_ACCESS_TOKEN
    account_id = INSTAGRAM_ACCOUNT_ID

    if not token or not account_id or token.startswith("your-") or account_id.startswith("your-"):
        raise HTTPException(
            status_code=503,
            detail="Instagram not configured. Set valid INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in .env."
        )

    db = get_db()
    draft = db.table("content_drafts").select("*").eq("id", draft_id).maybe_single().execute()
    if not draft.data:
        raise HTTPException(status_code=404, detail="Draft not found")

    post = draft.data

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:

            if post.get("carousel_slides") and isinstance(post["carousel_slides"], list):
                render_resp = await client.post(
                    f"{CAROUSEL_SERVICE_URL}/render",
                    json={"slides": post["carousel_slides"], "theme": "dark"}
                )
                image_urls = render_resp.json().get("image_urls", [])

                item_ids = []
                for url in image_urls:
                    item_resp = await client.post(
                        f"https://graph.facebook.com/v19.0/{account_id}/media",
                        params={
                            "image_url":        url,
                            "is_carousel_item": True,
                            "access_token":     token
                        }
                    )
                    item_ids.append(item_resp.json()["id"])

                caption = post.get("content", "")[:2200]
                container_resp = await client.post(
                    f"https://graph.facebook.com/v19.0/{account_id}/media",
                    params={
                        "media_type":   "CAROUSEL",
                        "children":     ",".join(item_ids),
                        "caption":      caption,
                        "access_token": token
                    }
                )
                container_id = container_resp.json()["id"]

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Instagram requires image/carousel content. Use carousel format."
                )

            publish_resp = await client.post(
                f"https://graph.facebook.com/v19.0/{account_id}/media_publish",
                params={
                    "creation_id":  container_id,
                    "access_token": token
                }
            )
            ig_post_id = publish_resp.json().get("id")

    except HTTPException:
        raise
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Instagram API error: {str(e)}")

    db.table("content_drafts").update({
        "status": "posted",
        "posted_at": datetime.now().isoformat()
    }).eq("id", draft_id).execute()

    db.table("scheduled_posts").update({"status": "posted"}).eq("draft_id", draft_id).execute()

    return {"success": True, "instagram_post_id": ig_post_id}
