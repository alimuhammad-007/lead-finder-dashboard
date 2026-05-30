"""
routes/outreach.py
===================
API routes for AI-powered outreach message generation.

Endpoints:
  POST /api/outreach/generate   — Generate AI message
  GET  /api/outreach            — Get saved messages for user
  DELETE /api/outreach/<id>     — Delete a message
"""

from flask import Blueprint, request
from services.ai_service      import generate_outreach_message
from services.supabase_client import get_supabase
from utils.helpers            import success_response, error_response, validate_required_fields

outreach_bp = Blueprint("outreach", __name__)


@outreach_bp.post("/generate")
def generate():
    """
    Generate a personalized cold outreach message using AI.

    Request body:
        {
          "business_name":  "Apex Dental",
          "business_type":  "dentist",
          "location":       "New York",
          "tone":           "professional",   // professional | friendly | sales-focused
          "sender_name":    "Alex",           // optional
          "sender_company": "Acme Corp",      // optional
          "user_id":        "uuid",           // optional, to save to DB
          "lead_id":        "uuid"            // optional, to link to lead
        }
    """
    data = request.get_json()

    missing = validate_required_fields(data, ["business_name", "business_type", "location"])
    if missing:
        return error_response(f"Missing required field: {missing}")

    tone            = data.get("tone", "professional")
    valid_tones     = {"professional", "friendly", "sales-focused"}
    if tone not in valid_tones:
        return error_response(f"tone must be one of: {', '.join(valid_tones)}")

    try:
        result = generate_outreach_message(
            business_name  = data["business_name"],
            business_type  = data["business_type"],
            location       = data["location"],
            tone           = tone,
            sender_name    = data.get("sender_name", "Alex"),
            sender_company = data.get("sender_company", "Your Company"),
        )

        # Optionally save to database
        user_id = data.get("user_id")
        lead_id = data.get("lead_id")

        if user_id:
            try:
                supabase = get_supabase()
                saved    = supabase.table("outreach_messages").insert({
                    "user_id": user_id,
                    "lead_id": lead_id,
                    "message": result["message"],
                    "subject": result["subject"],
                    "tone":    result["tone"],
                }).execute()

                if saved.data:
                    result["id"] = saved.data[0]["id"]

                # Log activity
                supabase.table("activity_logs").insert({
                    "user_id":     user_id,
                    "action":      "message_generated",
                    "entity_type": "message",
                    "metadata":    {
                        "business_name": data["business_name"],
                        "tone": tone,
                    },
                }).execute()
            except Exception:
                pass  # Don't fail if DB logging fails

        return success_response(result, message="Message generated successfully")

    except Exception as e:
        return error_response(str(e), 500)


@outreach_bp.get("/")
def get_messages():
    """Get all saved outreach messages for a user."""
    user_id = request.args.get("user_id")
    if not user_id:
        return error_response("user_id is required")

    try:
        supabase = get_supabase()
        result   = supabase.table("outreach_messages") \
            .select("*, leads(business_name, city)") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return success_response({"messages": result.data or [], "count": len(result.data or [])})

    except Exception as e:
        return error_response(str(e), 500)


@outreach_bp.delete("/<message_id>")
def delete_message(message_id: str):
    """Delete a saved message."""
    user_id = request.args.get("user_id")
    if not user_id:
        return error_response("user_id is required")

    try:
        supabase = get_supabase()
        supabase.table("outreach_messages") \
            .delete() \
            .eq("id", message_id) \
            .eq("user_id", user_id) \
            .execute()

        return success_response({"id": message_id}, message="Message deleted")

    except Exception as e:
        return error_response(str(e), 500)