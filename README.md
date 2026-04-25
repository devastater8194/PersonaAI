# 🟣 Persona — AI Content Engine

Identity-first AI content engine. Knows **who you are**, not just what you post.

---

## Project Structure

```
persona/
├── backend/                  ← FastAPI Python server
│   ├── main.py               ← App entry point
│   ├── requirements.txt
│   ├── .env                  ← 🔧 YOUR API KEYS GO HERE
│   ├── routes/
│   │   ├── identity.py       ← Save/load identity profile
│   │   ├── generate.py       ← LLM content generation
│   │   ├── trends.py         ← Reddit + Google News
│   │   ├── schedule.py       ← Auto-post queue + Instagram
│   │   └── notifications.py  ← Firebase push + Resend email
│   ├── services/
│   │   ├── llm_service.py    ← OpenAI / Ollama router
│   │   ├── trends_service.py ← Reddit + News fetchers
│   │   └── notifications_service.py
│   └── db/
│       └── supabase_client.py ← DB connection
│
├── frontend/                 ← Next.js 14 app
│   ├── src/app/
│   │   ├── page.tsx          ← Identity profile (Phase 1)
│   │   ├── trends/page.tsx   ← Trend engine (Phase 2)
│   │   ├── generate/page.tsx ← Content generation (Phase 3)
│   │   ├── review/page.tsx   ← Review & approve (Phase 4)
│   │   └── calendar/page.tsx ← Schedule & post (Phase 5)
│   ├── src/lib/
│   │   ├── api.ts            ← All API calls to backend
│   │   └── firebase.ts       ← Push notification setup
│   └── .env.local.example    ← Copy to .env.local
│
└── carousel-service/         ← Puppeteer image renderer
    ├── server.js             ← Express + Puppeteer
    └── package.json
```

---

## ⚡ Quick Start

### Step 1 — Supabase Database

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open SQL Editor → paste and run the schema from `backend/db/supabase_client.py`
3. Copy your **Project URL** and **anon key**

### Step 2 — Backend .env

Create `backend/.env`:

```env
# ── LLM (choose one) ─────────────────────────────
OPENAI_API_KEY=sk-...          # https://platform.openai.com/api-keys
USE_OLLAMA=false               # set true to use local Ollama instead
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# ── Database ─────────────────────────────────────
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # for carousel storage uploads

# ── Trends ───────────────────────────────────────
REDDIT_CLIENT_ID=your-id        # reddit.com/prefs/apps → create script app
REDDIT_CLIENT_SECRET=your-secret
REDDIT_USER_AGENT=Persona/1.0 (by u/yourusername)

# ── Instagram ────────────────────────────────────
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token  # developers.facebook.com
INSTAGRAM_ACCOUNT_ID=your-ig-business-id

# ── Notifications ────────────────────────────────
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json  # from Firebase console
RESEND_API_KEY=re_...           # resend.com
RESEND_FROM_EMAIL=persona@yourdomain.com

# ── Services ─────────────────────────────────────
CAROUSEL_SERVICE_URL=http://localhost:3001
```

### Step 3 — Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

### Step 4 — Frontend .env.local

```bash
cd frontend
cp .env.local.example .env.local
# fill in your values
```

### Step 5 — Run Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Step 6 — Carousel Service (optional, needed for Instagram)

```bash
cd carousel-service
npm install
node server.js
# → http://localhost:3001
```

---

## 🔑 API Keys — Where to Get Them

| Key | Where | Required? |
|-----|-------|-----------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Yes (or use Ollama) |
| `SUPABASE_URL` + `SUPABASE_KEY` | Supabase → Project Settings → API | Yes |
| `REDDIT_CLIENT_ID/SECRET` | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) | For trends |
| `INSTAGRAM_ACCESS_TOKEN` | [developers.facebook.com](https://developers.facebook.com) | For auto-post |
| Firebase credentials | [console.firebase.google.com](https://console.firebase.google.com) | For push notifications |
| `RESEND_API_KEY` | [resend.com](https://resend.com) | For email alerts |

---

## 🆚 USP vs Blotato

| Feature | Blotato | Persona |
|---------|---------|---------|
| Starts with... | Your existing content | Your identity & story |
| Works for new creators | ❌ | ✓ |
| Domain-specific voice | ❌ | ✓ via identity context |
| Instagram carousel | Basic | Puppeteer-rendered |
| Local LLM option | ❌ | ✓ Ollama |
| Open source | ❌ | ✓ |
| Price | $29-97/mo | Your API costs only |

---

## 🗺 Roadmap (MVP → v1)

- [x] Identity profile + LLM context injection
- [x] LinkedIn / Instagram / X generation
- [x] Carousel slide preview
- [x] Review & approve flow
- [x] 7-day calendar with auto-scheduling
- [x] Reddit + Google News trend engine
- [x] Instagram Graph API posting
- [x] Firebase push + Resend email alerts
- [ ] User authentication (Supabase Auth)
- [ ] Analytics dashboard (impressions, engagement)
- [ ] LinkedIn API posting (requires app review)
- [ ] Voice cloning for video content
- [ ] Multi-user / agency mode
