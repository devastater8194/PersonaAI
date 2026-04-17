# """
# ╔══════════════════════════════════════════════════════════════╗
# ║  SUPABASE DATABASE CLIENT                                     ║
# ║                                                              ║
# ║  SETUP STEPS:                                                ║
# ║  1. Go to https://supabase.com → New Project                 ║
# ║  2. Go to SQL Editor → paste the schema below → Run          ║
# ║  3. Copy your Project URL + anon key to .env                 ║
# ╚══════════════════════════════════════════════════════════════╝

# SQL SCHEMA TO RUN IN SUPABASE SQL EDITOR:
# ─────────────────────────────────────────

# -- Enable pgvector extension
# create extension if not exists vector;

# -- Identity profiles
# create table if not exists identities (
#   id uuid primary key default gen_random_uuid(),
#   user_id text unique not null,
#   name text,
#   age int,
#   domain text,
#   role text,
#   qualification text,
#   journey text,
#   interests text,
#   hobbies text,
#   achievements text,
#   tones text[],
#   platforms text[],
#   embedding vector(1536),   -- for semantic retrieval
#   created_at timestamptz default now(),
#   updated_at timestamptz default now()
# );

# -- Generated content drafts
# create table if not exists content_drafts (
#   id uuid primary key default gen_random_uuid(),
#   user_id text not null,
#   platform text not null,         -- linkedin | instagram | twitter
#   content_type text not null,     -- post | thread | carousel | opinion
#   content text not null,
#   topic text,
#   status text default 'draft',    -- draft | approved | scheduled | posted
#   scheduled_for timestamptz,
#   posted_at timestamptz,
#   carousel_slides jsonb,          -- for instagram carousel slides
#   created_at timestamptz default now()
# );

# -- Trends cache
# create table if not exists trends_cache (
#   id uuid primary key default gen_random_uuid(),
#   user_id text,
#   title text,
#   source text,
#   tag text,
#   relevance_score float,
#   url text,
#   fetched_at timestamptz default now()
# );

# -- Scheduled posts
# create table if not exists scheduled_posts (
#   id uuid primary key default gen_random_uuid(),
#   draft_id uuid references content_drafts(id),
#   user_id text not null,
#   platform text not null,
#   scheduled_for timestamptz not null,
#   status text default 'pending',  -- pending | posted | failed
#   error_message text,
#   created_at timestamptz default now()
# );

# ─────────────────────────────────────────
# """

# import os
# from supabase import create_client, Client

# # 🔧 These come from your .env file
# SUPABASE_URL = os.getenv("SUPABASE_URL")   # e.g. https://abcdef.supabase.co
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")
#    # your anon/service key

# _client: Client = None


# def get_db() -> Client:
#     """Returns singleton Supabase client."""
#     global _client
#     if _client is None:
#         if not SUPABASE_URL or not SUPABASE_KEY:
#             raise RuntimeError(
#                 "❌ SUPABASE_URL and SUPABASE_KEY must be set in .env\n"
#                 "   Get them from: https://supabase.com → Project Settings → API"
#             )
#         _client = create_client(SUPABASE_URL, SUPABASE_KEY)
#     return _client
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client = None

def get_db() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")

        if not url or not key:
            raise ValueError("❌ Supabase credentials not found")
        
        _client = create_client(url, key)

    return _client