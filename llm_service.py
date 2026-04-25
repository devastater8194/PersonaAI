"""
llm_service.py — Google Gemini (google.genai SDK)
Uses Gemini 2.5 Flash and text-embedding-004.
"""

import os
import asyncio
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_client = None

def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set in .env — "
                "get yours at: https://aistudio.google.com/app/apikey"
            )
        _client = genai.Client(api_key=api_key)
        logger.info("[llm] Gemini client initialised")
    return _client

# ── Identity system prompt ────────────────────────────────────────────────────

def build_identity_system_prompt(identity: dict) -> str:
    tones = ", ".join(identity.get("tones", []) or [])
    name  = identity.get("name", "the user")

    return f"""You are a personal AI content engine for {name}.

IDENTITY PROFILE:
Name         : {identity.get('name')}
Age          : {identity.get('age')}
Domain       : {identity.get('domain')}
Current Role : {identity.get('role')}
Qualification: {identity.get('qualification')}

Life Journey:
{identity.get('journey', 'Not provided')}

Interests    : {identity.get('interests')}
Hobbies      : {identity.get('hobbies')}
Achievements : {identity.get('achievements')}
Writing Tone : {tones}

CRITICAL RULES:
1. Every post MUST sound like {name} wrote it personally — first person, authentic voice.
2. Reference their real domain expertise and background naturally.
3. Never sound generic, templated, or AI-generated.
4. Adapt vocabulary to their qualification level and field.
5. Use their tone ({tones}) consistently throughout.

FORMAT RULES:
- LinkedIn : 150-300 words, hook in first line, line breaks every 2-3 sentences, end with question or CTA.
- Twitter/X : Thread of 5-7 tweets, each tweet max 280 chars, numbered (1/7), (2/7), etc. First tweet = strong hook.
- Instagram : Return ONLY a valid JSON array — no markdown fences, no explanation, just the raw JSON array.
  Format: [{{"slide":1,"title":"...max 8 words...","body":"...max 50 words...","emoji":"..."}}]
  5-7 slides. First slide = bold hook. Last slide = CTA/follow.

Return ONLY the content. No preamble like "Here is your post" — just the post itself.
"""

# ── Core generation call ──────────────────────────────────────────────────────

async def generate_with_llm(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 1200,
    temperature: float = 0.85,
    use_search_agent: bool = False
) -> str:
    """
    Calls Gemini 2.5 Flash and returns generated text.
    Runs in a thread so it doesn't block the FastAPI event loop.
    """
    client = get_client()
    combined_prompt = f"{system_prompt}\n\n{user_prompt}"

    config = types.GenerateContentConfig(
        max_output_tokens=max_tokens,
        temperature=temperature,
    )
    
    if use_search_agent:
        config.tools = [{"google_search": {}}]

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash",
            contents=combined_prompt,
            config=config,
        )
        text = response.text.strip() if response.text else ""
        logger.info(f"[llm] Gemini response received: {len(text)} chars")
        return text

    except Exception as e:
        error_msg = str(e)
        logger.error(f"[llm] Gemini generation failed: {error_msg}")
        raise RuntimeError(f"Gemini API Error: {error_msg}")

# ── Embeddings ────────────────────────────────────────────────────────────────

async def get_embedding(text: str) -> list[float]:
    """
    Returns a 768-dim embedding vector using text-embedding-004.
    Falls back to zero vector on failure.
    """
    try:
        client = get_client()
        result = await asyncio.to_thread(
            client.models.embed_content,
            model="text-embedding-004",
            contents=text,
        )
        return result.embeddings[0].values
    except Exception as e:
        logger.warning(f"[llm] Embedding failed, returning zeros: {e}")
        return [0.0] * 768