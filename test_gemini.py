import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing gemini-1.5-flash")
    resp = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Hello, how are you?",
    )
    print("Success:", resp.text)
except Exception as e:
    print("Error:", e)

try:
    print("Testing gemini-1.5-pro")
    resp = client.models.generate_content(
        model="gemini-1.5-pro",
        contents="Hello, how are you?",
    )
    print("Success:", resp.text)
except Exception as e:
    print("Error:", e)
