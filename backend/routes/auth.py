"""
routes/auth.py
===============
Auth-related backend routes.
Note: Most auth (signup/login) is handled directly on the frontend
via the Supabase JS client. This backend handles profile management.
"""

from flask import Blueprint, request
from services.supabase_client import get_supabase
from utils.helpers            import success_response, error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/profile/<user_id>")
def get_profile(user_id: str):
    """Fetch user profile data."""
    try:
        supabase = get_supabase()
        result   = supabase.table("profiles") \
            .select("*") \
            .eq("id", user_id) \
            .single() \
            .execute()

        return success_response(result.data)
    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.patch("/profile/<user_id>")
def update_profile(user_id: str):
    """Update user profile (full_name, company, avatar_url)."""
    data = request.get_json()

    allowed = {"full_name", "company", "avatar_url"}
    updates = {k: v for k, v in data.items() if k in allowed}

    if not updates:
        return error_response("No valid fields to update")

    try:
        supabase = get_supabase()
        result   = supabase.table("profiles") \
            .update(updates) \
            .eq("id", user_id) \
            .execute()

        return success_response(result.data, message="Profile updated")
    except Exception as e:
        return error_response(str(e), 500)