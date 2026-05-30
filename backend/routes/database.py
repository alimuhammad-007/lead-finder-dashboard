"""
routes/database.py
===================
Routes for dashboard stats, activity logs, and analytics data.

Endpoints:
  GET /api/db/stats/<user_id>    — Dashboard statistics
  GET /api/db/activity/<user_id> — Recent activity log
"""

from flask import Blueprint, request
from services.supabase_client import get_supabase
from utils.helpers            import success_response, error_response

database_bp = Blueprint("database", __name__)


@database_bp.get("/stats/<user_id>")
def get_stats(user_id: str):
    """
    Get dashboard statistics for a user.

    Returns counts for: total leads, messages, searches,
    leads by status, and leads added per day (last 7 days).
    """
    try:
        supabase = get_supabase()

        # Total leads
        leads_result = supabase.table("leads") \
            .select("id, status, score, created_at", count="exact") \
            .eq("user_id", user_id) \
            .execute()
        leads = leads_result.data or []

        # Total messages generated
        msgs_result = supabase.table("outreach_messages") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .execute()

        # Total searches
        searches_result = supabase.table("search_history") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .execute()

        # Count leads by status
        status_counts = {}
        for lead in leads:
            s = lead.get("status", "new")
            status_counts[s] = status_counts.get(s, 0) + 1

        # Average lead score
        scores = [l["score"] for l in leads if l.get("score")]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0

        # High-quality leads (score >= 70)
        hot_leads = sum(1 for l in leads if (l.get("score") or 0) >= 70)

        return success_response({
            "total_leads":      len(leads),
            "total_messages":   msgs_result.count or 0,
            "total_searches":   searches_result.count or 0,
            "leads_by_status":  status_counts,
            "average_score":    avg_score,
            "hot_leads":        hot_leads,
        })

    except Exception as e:
        return error_response(str(e), 500)


@database_bp.get("/activity/<user_id>")
def get_activity(user_id: str):
    """Get the 20 most recent activity log entries."""
    try:
        supabase = get_supabase()
        result   = supabase.table("activity_logs") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(20) \
            .execute()

        return success_response({"activity": result.data or []})

    except Exception as e:
        return error_response(str(e), 500)