
import os
from supabase import create_client, Client
from dotenv import load_dotenv
 
load_dotenv()
 
_client: Client = None                                                
_admin_client: Client = None                                                      
 
def get_db() -> Client:
    """
    Returns a Supabase client using the ANON key.
    Subject to Row Level Security policies.
    Use for reads that don't need to bypass RLS.
    """
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL or SUPABASE_KEY not found in .env"
            )
        _client = create_client(url, key)
    return _client
 
def get_admin_db() -> Client:
    """
    Returns a Supabase client using the SERVICE ROLE key.
    Bypasses Row Level Security — use this for all backend writes
    (inserts, upserts, updates, deletes) where no user JWT is present.
    
    Set SUPABASE_SERVICE_KEY in your .env (Project Settings → API → service_role).
    """
    global _admin_client
    if _admin_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            \
            import warnings
            warnings.warn(
                "SUPABASE_SERVICE_KEY not set — falling back to anon key. "
                "RLS errors will occur on write operations. "
                "Add SUPABASE_SERVICE_KEY to your .env to fix this.",
                stacklevel=2,
            )
            return get_db()
        _admin_client = create_client(url, key)
    return _admin_client
