"""
╔══════════════════════════════════════════════════════════════╗
║  LLM SERVICE — OpenAI OR Ollama                              ║
║                                                              ║
║  .env controls which one to use:                             ║
║    USE_OLLAMA=false  → uses OpenAI gpt-4o-mini              ║
║    USE_OLLAMA=true   → uses Ollama locally (llama3, etc.)   ║
║                                                              ║
║  FOR OPENAI:                                                 ║
║    Get key at https://platform.openai.com/api-keys          ║
║    Set OPENAI_API_KEY=sk-... in .env                         ║
║                                                              ║
║  FOR OLLAMA (local, free):                                   ║
║    Install: https://ollama.ai                                ║
║    Run: ollama pull llama3                                   ║
║    Set USE_OLLAMA=true, OLLAMA_BASE_URL=http://localhost:11434║
╚══════════════════════════════════════════════════════════════╝
"""
import os
import httpx
from openai import AsyncOpenAI
from typing import Optional

from dotenv import load_dotenv
load_dotenv()  # ← This MUST come before os.getenv(...)

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

USE_OLLAMA = os.getenv("USE_OLLAMA", "false").lower() == "true"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")  # or mistral, phi3, etc.




def build_identity_system_prompt(identity: dict) -> str:
    """
    Builds the identity-aware system prompt.
    This is the core of the USP — everything about the user injected as context.
    """
    tones = ", ".join(identity.get("tones", []))
    return f"""You are a personal AI content engine for {identity.get('name', 'the user')}.

═══════════════ IDENTITY PROFILE ═══════════════
Name        : {identity.get('name')}
Age         : {identity.get('age')}
Domain      : {identity.get('domain')}
Current Role: {identity.get('role')}
Qualification: {identity.get('qualification')}

Life Journey:
{identity.get('journey', 'Not provided')}

Interests   : {identity.get('interests')}
Hobbies     : {identity.get('hobbies')}
Achievements: {identity.get('achievements')}
Writing Tone: {tones}
════════════════════════════════════════════════

CRITICAL RULES:
1. Every post must sound like {identity.get('name')} wrote it personally.
2. Reference their real domain expertise and background naturally.
3. Never sound generic, templated, or AI-generated.
4. Adapt vocabulary to their qualification level and field.
5. Use their tone ({tones}) consistently.

FORMAT RULES:
- LinkedIn: 150-300 words, hook in first line, line breaks every 2-3 sentences, end with question or CTA
- Twitter/X: Each tweet max 280 chars, thread of 5-7 tweets numbered (1/7), (2/7) etc.
- Instagram Carousel: Return ONLY valid JSON array:
  [{{"slide":1,"title":"...(max 8 words)","body":"...(max 50 words)","emoji":"..."}}, ...]
  5-7 slides. First slide = bold hook. Last slide = CTA/follow.

Return ONLY the content. No explanations, no "here is your post", just the post itself.
"""


async def generate_with_llm(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 1000,
    temperature: float = 0.85
) -> str:
    """
    Main LLM call — routes to Ollama or OpenAI based on env config.
    """
    if USE_OLLAMA:
        return await _call_ollama(system_prompt, user_prompt, max_tokens, temperature)
    else:
        return await _call_openai(system_prompt, user_prompt, max_tokens, temperature)


async def _call_openai(system_prompt, user_prompt, max_tokens, temperature) -> str:
    """Call OpenAI API."""
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError(
            "❌ OPENAI_API_KEY not set in .env\n"
            "   Get your key at: https://platform.openai.com/api-keys"
        )

    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",      # 🔧 change to gpt-4o for better quality
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        max_tokens=max_tokens,
        temperature=temperature
    )
    return response.choices[0].message.content


async def _call_ollama(system_prompt, user_prompt, max_tokens, temperature) -> str:
    """Call local Ollama instance."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt}
                ],
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
        )
        data = response.json()
        return data["message"]["content"]


async def get_embedding(text: str) -> list[float]:
    """
    Get text embedding for semantic similarity (identity vector storage in pgvector).
    Only works with OpenAI — Ollama embeddings optional.
    """
    if USE_OLLAMA:
        # 🔧 Optional: use Ollama's embedding endpoint if you want local embeddings
        # async with httpx.AsyncClient() as client:
        #     r = await client.post(f"{OLLAMA_BASE_URL}/api/embeddings",
        #                           json={"model": "nomic-embed-text", "prompt": text})
        #     return r.json()["embedding"]
        return [0.0] * 1536  # placeholder if not using embeddings with Ollama

    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
