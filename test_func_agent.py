import os
import asyncio
from google import genai
from google.genai import types
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

def fetch_url_content(url: str) -> str:
    """Fetches the main text content of an article given its URL."""
    print(f"Agent is calling fetch_url_content with URL: {url}")
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = " ".join([p.get_text() for p in soup.find_all(['p', 'h1', 'h2', 'h3'])])
            return text[:6000]
    except Exception as e:
        return f"Failed to extract text: {e}"

async def test_agent():
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = "Please read the article at this URL and provide a 3 point summary: https://news.ycombinator.com/item?id=39644023"
    
    \
    chat = client.chats.create(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            tools=[fetch_url_content],
            temperature=0.7
        )
    )
    
    response = chat.send_message(prompt)
    print("Agent Response:", response.text)

if __name__ == "__main__":
    asyncio.run(test_agent())
