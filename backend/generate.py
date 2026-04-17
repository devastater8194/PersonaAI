"""Content generation API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json

from supabase_client import get_db
from llm_service import build_identity_system_prompt, generate_with_llm

router = APIRouter()


class GenerateRequest(BaseModel):
    user_id: str
    topic: str
    platform: str          # linkedin | instagram | twitter | all
    content_type: str      # post | story | thread | opinion | educational


class GenerateResponse(BaseModel):
    platform: str
    content: str
    carousel_slides: Optional[list] = None
    draft_id: Optional[str] = None


@router.post("/", response_model=List[GenerateResponse])
async def generate_content(req: GenerateRequest):
    """
    Generate platform-native content using identity context.
    This is the core engine of Persona.
    """
    db = get_db()

    # 1. Load user identity
    identity_result = db.table("identities").select("*").eq("user_id", req.user_id).single().execute()
    if not identity_result.data:
        raise HTTPException(status_code=404, detail="Identity not found. Save your profile first.")

    identity = identity_result.data
    system_prompt = build_identity_system_prompt(identity)

    # 2. Determine platforms to generate for
    platforms = ["linkedin", "instagram", "twitter"] if req.platform == "all" else [req.platform]
    results = []

    for platform in platforms:
        platform_instruction = {
            "linkedin": "Write a LinkedIn post.",
            "instagram": "Write an Instagram carousel. Return ONLY a valid JSON array of slides.",
            "twitter":  "Write a Twitter/X thread."
        }.get(platform, "Write a social media post.")

        content_type_instruction = {
            "post":        "Make it a standard professional post.",
            "story":       "Make it a personal story from my life/career journey.",
            "thread":      "Make it a numbered thread/carousel with clear progression.",
            "opinion":     "Make it a bold hot take or strong opinion.",
            "educational": "Make it educational — teach something valuable step by step."
        }.get(req.content_type, "")

        user_prompt = f"""{platform_instruction}
{content_type_instruction}

Topic: {req.topic}

Remember: Sound exactly like {identity.get('name')}. Reference my background naturally.
"""

        try:
            content = await generate_with_llm(system_prompt, user_prompt)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

        # 3. Parse carousel JSON if Instagram
        carousel_slides = None
        if platform == "instagram":
            try:
                # Strip markdown code fences if present
                clean = content.strip().replace("```json", "").replace("```", "").strip()
                carousel_slides = json.loads(clean)
            except json.JSONDecodeError:
                # If JSON parsing fails, keep raw content
                carousel_slides = None

        # 4. Save draft to Supabase
        draft_data = {
            "user_id":       req.user_id,
            "platform":      platform,
            "content_type":  req.content_type,
            "content":       content,
            "topic":         req.topic,
            "status":        "draft",
            "carousel_slides": carousel_slides
        }
        saved = db.table("content_drafts").insert(draft_data).execute()
        draft_id = saved.data[0]["id"] if saved.data else None

        results.append(GenerateResponse(
            platform=platform,
            content=content,
            carousel_slides=carousel_slides,
            draft_id=draft_id
        ))

    return results


@router.get("/drafts/{user_id}")
async def get_drafts(user_id: str, status: Optional[str] = None):
    """Get all drafts for a user, optionally filtered by status."""
    db = get_db()
    query = db.table("content_drafts").select("*").eq("user_id", user_id).order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return result.data


@router.patch("/approve/{draft_id}")
async def approve_draft(draft_id: str):
    """Approve a draft — moves it to scheduling queue."""
    db = get_db()
    result = db.table("content_drafts").update({"status": "approved"}).eq("id", draft_id).execute()
    return {"success": True, "draft": result.data}


@router.delete("/draft/{draft_id}")
async def delete_draft(draft_id: str):
    """Delete a draft."""
    db = get_db()
    db.table("content_drafts").delete().eq("id", draft_id).execute()
    return {"success": True}
