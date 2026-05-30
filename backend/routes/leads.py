"""
routes/leads.py
================
API routes for searching and managing leads.

Endpoints:
  POST /api/leads/search   — Search for new leads
  GET  /api/leads          — Get saved leads for user
  POST /api/leads/save     — Save leads to database
  DELETE /api/leads/<id>   — Delete a lead
  PATCH  /api/leads/<id>   — Update lead status/notes
"""

from flask import Blueprint, request
from services.lead_service    import search_leads
from services.supabase_client import get_supabase
from utils.helpers            import success_response, error_response, validate_required_fields

leads_bp = Blueprint("leads", __name__)


@leads_bp.post("/search")
def search():
    """
    Search for business leads using SerpAPI.

    Request body:
        { "business_type": "dentist", "location": "New York" }

    Returns:
        List of lead objects with scores
    """
    data = request.get_json()

    # Validate required fields
    missing = validate_required_fields(data, ["business_type", "location"])
    if missing:
        return error_response(f"Missing required field: {missing}")

    business_type = data["business_type"].strip()
    location      = data["location"].strip()
    user_id       = data.get("user_id")  # Optional: log the search

    try:
        leads = search_leads(business_type, location)

        # Log the search to Supabase if user is authenticated
        if user_id:
            try:
                supabase = get_supabase()
                supabase.table("search_history").insert({
                    "user_id":       user_id,
                    "business_type": business_type,
                    "location":      location,
                    "results_count": len(leads),
                }).execute()
            except Exception:
                pass  # Don't fail the whole request if logging fails

        return success_response({
            "leads":    leads,
            "count":    len(leads),
            "query":    {"business_type": business_type, "location": location},
        })

    except Exception as e:
        return error_response(str(e), 500)


@leads_bp.get("/")
def get_leads():
    """
    Get all saved leads for a user.

    Query params:
        user_id (required), status (optional filter), search (optional text search)
    """
    user_id = request.args.get("user_id")
    if not user_id:
        return error_response("user_id is required")

    status_filter = request.args.get("status")
    search_query  = request.args.get("search", "").lower()

    try:
        supabase = get_supabase()

        query = supabase.table("leads") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True)

        if status_filter and status_filter != "all":
            query = query.eq("status", status_filter)

        result = query.execute()
        leads  = result.data or []

        # Text search filter (client-side for simplicity)
        if search_query:
            leads = [
                l for l in leads
                if search_query in l.get("business_name", "").lower()
                or search_query in l.get("city", "").lower()
                or search_query in l.get("business_type", "").lower()
            ]

        return success_response({"leads": leads, "count": len(leads)})

    except Exception as e:
        return error_response(str(e), 500)


@leads_bp.post("/save")
def save_leads():
    """
    Save one or more leads to the database.

    Request body:
        { "user_id": "...", "leads": [...] }
    """
    data = request.get_json()

    missing = validate_required_fields(data, ["user_id", "leads"])
    if missing:
        return error_response(f"Missing required field: {missing}")

    user_id = data["user_id"]
    leads   = data["leads"]

    if not isinstance(leads, list) or len(leads) == 0:
        return error_response("leads must be a non-empty array")

    # Attach user_id to each lead
    for lead in leads:
        lead["user_id"] = user_id

    try:
        supabase  = get_supabase()
        result    = supabase.table("leads").insert(leads).execute()
        saved     = result.data or []

        # Log activity
        for lead in saved:
            supabase.table("activity_logs").insert({
                "user_id":     user_id,
                "action":      "lead_saved",
                "entity_type": "lead",
                "entity_id":   lead.get("id"),
                "metadata":    {"business_name": lead.get("business_name")},
            }).execute()

        return success_response(
            {"saved": saved, "count": len(saved)},
            message=f"{len(saved)} lead(s) saved successfully",
            status_code=201,
        )

    except Exception as e:
        return error_response(str(e), 500)


@leads_bp.delete("/<lead_id>")
def delete_lead(lead_id: str):
    """Delete a single lead by ID."""
    user_id = request.args.get("user_id")
    if not user_id:
        return error_response("user_id is required")

    try:
        supabase = get_supabase()
        supabase.table("leads") \
            .delete() \
            .eq("id", lead_id) \
            .eq("user_id", user_id) \
            .execute()

        return success_response({"id": lead_id}, message="Lead deleted")

    except Exception as e:
        return error_response(str(e), 500)


@leads_bp.patch("/<lead_id>")
def update_lead(lead_id: str):
    """Update lead status, notes, or other fields."""
    data    = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return error_response("user_id is required")

    # Only allow updating safe fields (not id, user_id)
    allowed_fields = {"status", "notes", "email", "phone", "website"}
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return error_response("No valid fields to update")

    updates["updated_at"] = "now()"

    try:
        supabase = get_supabase()
        result   = supabase.table("leads") \
            .update(updates) \
            .eq("id", lead_id) \
            .eq("user_id", user_id) \
            .execute()

        return success_response(result.data, message="Lead updated")

    except Exception as e:
        return error_response(str(e), 500)