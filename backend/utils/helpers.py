"""
utils/helpers.py
================
Shared utility functions used across multiple services.
"""


def calculate_lead_score(lead: dict) -> int:
    """
    Score a lead from 0-100 based on available data quality.

    Higher score = more complete/actionable lead.

    Scoring breakdown:
    - Has email:        +30 pts  (most valuable for outreach)
    - Has website:      +20 pts
    - Has phone:        +15 pts
    - Has rating:       +15 pts
    - High rating(≥4):  +10 pts  (bonus for quality signal)
    - Has reviews:      +10 pts
    """
    score = 0

    if lead.get("email"):    score += 30
    if lead.get("website"):  score += 20
    if lead.get("phone"):    score += 15

    rating = lead.get("rating")
    if rating:
        score += 15
        if float(rating) >= 4.0:
            score += 10  # Bonus for well-rated businesses

    if lead.get("review_count"):
        score += 10

    return min(score, 100)  # Cap at 100


def success_response(data, message: str = "Success", status_code: int = 200):
    """Standard success response wrapper."""
    from flask import jsonify
    return jsonify({
        "success": True,
        "message": message,
        "data":    data,
    }), status_code


def error_response(message: str, status_code: int = 400):
    """Standard error response wrapper."""
    from flask import jsonify
    return jsonify({
        "success": False,
        "message": message,
        "data":    None,
    }), status_code


def validate_required_fields(data: dict, required: list[str]) -> str | None:
    """
    Check that all required fields exist in a dict.
    Returns the first missing field name, or None if all present.
    """
    for field in required:
        if not data.get(field):
            return field
    return None