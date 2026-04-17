"""
╔══════════════════════════════════════════════════════════════╗
║  NOTIFICATIONS SERVICE — Firebase Push + Resend Email        ║
║                                                              ║
║  FIREBASE SETUP:                                             ║
║    1. https://console.firebase.google.com → New Project      ║
║    2. Project Settings → Service Accounts → Generate Key     ║
║    3. Save JSON as firebase-credentials.json in backend/     ║
║    4. Set FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json║
║                                                              ║
║  RESEND EMAIL SETUP:                                         ║
║    1. https://resend.com → Get API key                       ║
║    2. Set RESEND_API_KEY=re_... in .env                      ║
║    3. Set RESEND_FROM_EMAIL=persona@yourdomain.com           ║
╚══════════════════════════════════════════════════════════════╝
"""

import os
import resend
import firebase_admin
from firebase_admin import credentials, messaging
from typing import Optional

from fastapi import APIRouter

router = APIRouter()

# ─── FIREBASE INIT ────────────────────────────────────────────
FIREBASE_CREDS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        cred = credentials.Certificate(FIREBASE_CREDS_PATH)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("✅ Firebase initialized")
    except Exception as e:
        print(f"⚠️  Firebase not configured: {e}")
        print(f"   Download credentials from Firebase Console → Service Accounts")


# ─── RESEND INIT ──────────────────────────────────────────────
RESEND_API_KEY    = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "persona@yourdomain.com")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    print("⚠️  RESEND_API_KEY not set — email notifications disabled")
    print("   Get your key at: https://resend.com")


# ─── FUNCTIONS ────────────────────────────────────────────────

async def send_push_notification(
    fcm_token: str,
    title: str,
    body: str,
    data: Optional[dict] = None
) -> bool:
    """
    Send Firebase push notification to user's device.

    fcm_token: get this from your Next.js frontend using Firebase SDK
    (see frontend/lib/firebase.ts for how to get the token)
    """
    if not _firebase_initialized:
        init_firebase()

    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=fcm_token
        )
        response = messaging.send(message)
        print(f"✅ Push notification sent: {response}")
        return True
    except Exception as e:
        print(f"❌ Push notification failed: {e}")
        return False


async def send_trend_alert_email(
    to_email: str,
    user_name: str,
    trend_title: str,
    trend_source: str,
    generate_url: str = "http://localhost:3000/generate"
) -> bool:
    """
    Send email alert when a high-relevance trend is detected.
    Uses Resend for transactional email.
    """
    if not RESEND_API_KEY:
        print("⚠️  Skipping email — RESEND_API_KEY not configured")
        return False

    try:
        params: resend.Emails.SendParams = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": f"🔥 Trending in your niche: {trend_title[:60]}...",
            "html": f"""
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08090a;color:#e8e9ec;padding:32px;border-radius:12px">
              <h1 style="font-size:20px;margin-bottom:8px">Hey {user_name} 👋</h1>
              <p style="color:#9ca3af;margin-bottom:24px">A trending topic just hit high relevance for your domain.</p>

              <div style="background:#16181c;border:1px solid #2a2d35;border-radius:10px;padding:20px;margin-bottom:24px">
                <div style="font-size:11px;color:#7c6cff;font-family:monospace;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">{trend_source}</div>
                <p style="font-size:16px;font-weight:600;margin:0">{trend_title}</p>
              </div>

              <a href="{generate_url}" style="background:#7c6cff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                Generate Content Now →
              </a>

              <p style="color:#4b5563;font-size:12px;margin-top:32px">
                Persona AI Content Engine · <a href="#" style="color:#7c6cff">Unsubscribe</a>
              </p>
            </div>
            """
        }
        resend.Emails.send(params)
        print(f"✅ Trend alert email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email send failed: {e}")
        return False


async def send_post_scheduled_email(
    to_email: str,
    user_name: str,
    platform: str,
    scheduled_for: str
) -> bool:
    """Send confirmation email when a post is scheduled."""
    if not RESEND_API_KEY:
        return False

    try:
        params: resend.Emails.SendParams = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": f"✅ Post scheduled on {platform.capitalize()}",
            "html": f"""
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#08090a;color:#e8e9ec;padding:32px;border-radius:12px">
              <h1 style="font-size:18px">Post scheduled ✓</h1>
              <p style="color:#9ca3af">
                Your {platform} post has been queued for <strong style="color:#e8e9ec">{scheduled_for}</strong>.
              </p>
              <p style="color:#4b5563;font-size:12px;margin-top:32px">Persona AI · Auto-scheduling your content engine</p>
            </div>
            """
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"❌ Schedule email failed: {e}")
        return False

@router.get("/test-notify")
def test_notify():
    return {"message": "Notifications working 🚀"}