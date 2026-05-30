"""
services/supabase_client.py
============================
Initializes the Supabase client (server-side, uses service role key).
The service role key bypasses Row Level Security — only use on the backend.
"""

import os
from supabase import create_client, Client

def get_supabase() -> Client:
    """
    Returns a configured Supabase client.
    Call this inside each request handler to get a fresh client.
    """
    url  = os.getenv("SUPABASE_URL")
    key  = os.getenv("SUPABASE_SERVICE_KEY")  # service role, not anon!

    if not url or not key:
        raise EnvironmentError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables."
        )

    return create_client(url, key)