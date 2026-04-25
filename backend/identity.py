from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from supabase_client import get_db
from llm_service import get_embedding

router = APIRouter()


class IdentityPayload(BaseModel):
    user_id: str    
    name: str
    age: Optional[int] = None
    domain: Optional[str] = ""
    role: Optional[str] = ""
    qualification: Optional[str] = ""
    journey: Optional[str] = ""
    interests: Optional[str] = ""
    hobbies: Optional[str] = ""
    achievements: Optional[str] = ""
    tones: Optional[List[str]] = []
    platforms: Optional[List[str]] = []


@router.post("/save")
async def save_identity(payload: IdentityPayload):
    db = get_db()
    embed_text = f"{payload.name} {payload.domain} {payload.role} {payload.journey} {payload.interests}"

    try:
        embedding = await get_embedding(embed_text)
    except Exception as e:
        print(f"  Embedding failed (non-fatal): {e}")
        embedding = [0.0] * 1536

    data = {
        "user_id":      payload.user_id,
        "name":         payload.name,
        "age":          payload.age,
        "domain":       payload.domain,
        "role":         payload.role,
        "qualification": payload.qualification,
        "journey":      payload.journey,
        "interests":    payload.interests,
        "hobbies":      payload.hobbies,
        "achievements": payload.achievements,
        "tones":        payload.tones,
        "platforms":    payload.platforms,
        "embedding":    embedding,
    }

    result = db.table("identities").upsert(data, on_conflict="user_id").execute()

    return {"success": True, "message": "Identity saved", "data": result.data}


@router.get("/{user_id}")
async def get_identity(user_id: str):
    """Retrieve identity profile by user_id."""
    db = get_db()
    result = db.table("identities").select("*").eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Identity not found")
    return result.data
