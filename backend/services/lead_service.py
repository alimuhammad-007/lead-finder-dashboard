"""
services/lead_service.py
=========================
Fetches business leads from SerpAPI (Google Places results).
Parses and scores each lead before returning.
"""

import os
import re
import requests
from utils.helpers import calculate_lead_score


SERPAPI_KEY = os.getenv("SERPAPI_KEY")
SERPAPI_URL = "https://serpapi.com/search"


def search_leads(business_type: str, location: str) -> list[dict]:
    """
    Search for businesses using SerpAPI Google Maps/Places results.

    Args:
        business_type: e.g. "dentist", "plumber", "marketing agency"
        location: e.g. "New York, NY", "London UK"

    Returns:
        List of lead dictionaries with enriched fields.
    """
    if not SERPAPI_KEY:
        # Return mock data when no API key is configured (useful for demos)
        return _mock_leads(business_type, location)

    query = f"{business_type} in {location}"

    params = {
        "engine":  "google_maps",   # Google Maps gives us business data
        "q":       query,
        "type":    "search",
        "api_key": SERPAPI_KEY,
        "num":     20,              # Request up to 20 results
    }

    try:
        response = requests.get(SERPAPI_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise RuntimeError(f"SerpAPI request failed: {str(e)}")

    # "local_results" is the key SerpAPI uses for Google Maps business listings
    raw_results = data.get("local_results", [])

    leads = []
    for item in raw_results:
        lead = _parse_serpapi_result(item, business_type, location)
        if lead:
            leads.append(lead)

    return leads


def _parse_serpapi_result(item: dict, business_type: str, location: str) -> dict | None:
    name = item.get("title", "").strip()
    if not name:
        return None

    # Safely extract extensions even if they are dictionaries
    extensions_raw = item.get("extensions", [])
    extensions_text = ""
    if isinstance(extensions_raw, list):
        text_parts = []
        for ext in extensions_raw:
            if isinstance(ext, str):
                text_parts.append(ext)
            elif isinstance(ext, dict):
                # Extract values from dicts if they contain strings
                text_parts.extend([str(v) for v in ext.values() if isinstance(v, str)])
        extensions_text = " ".join(text_parts)

    # Improved extraction for Google Maps results
    lead = {
        "business_name": name,
        "email": _extract_email(extensions_text) or "",
        "phone": item.get("phone", ""),
        "website": item.get("website", ""),
        "address": item.get("address", ""),
        "city": location,
        "business_type": business_type,
        "rating": float(item.get("rating")) if item.get("rating") else 0,
        "review_count": int(item.get("reviews", 0)),
        "status": "new",
        "source": "search",
    }

    # Calculate score
    lead["score"] = calculate_lead_score(lead)
    return lead


def _extract_email(text: str) -> str:
    """Simple regex to pull an email address out of a string."""
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else ""


def _mock_leads(business_type: str, location: str) -> list[dict]:
    """
    Returns realistic-looking demo data when no SerpAPI key is set.
    Useful for development and demos.
    """
    templates = [
        ("Apex {type} Solutions",   "apex@{slug}.com",   "+1-555-0101", "https://apex{slug}.com",   "123 Main St",  85),
        ("Premier {type} Group",    "",                   "+1-555-0102", "https://premier{slug}.com","456 Oak Ave",  72),
        ("NextGen {type} Co.",      "info@nextgen{slug}.com","+1-555-0103","https://nextgen{slug}.io","789 Pine Rd",  91),
        ("Elite {type} Services",   "hello@elite{slug}.com", "+1-555-0104","",                       "321 Elm Blvd", 65),
        ("Metro {type} Experts",    "",                   "+1-555-0105", "https://metro{slug}.com",  "654 Maple Dr", 78),
        ("Alpha {type} Agency",     "team@alpha{slug}.com",  "+1-555-0106","https://alpha{slug}.co", "987 Cedar Ln", 88),
        ("Pro {type} Hub",          "pro@{slug}hub.com",  "+1-555-0107", "https://{slug}hub.com",   "147 Birch St", 70),
        ("Smart {type} Studio",     "",                   "+1-555-0108", "https://smart{slug}.io",  "258 Willow Ave",82),
    ]

    slug = re.sub(r"[^a-z0-9]", "", business_type.lower())
    leads = []

    for i, (name_t, email_t, phone, website_t, addr, score) in enumerate(templates):
        leads.append({
            "business_name": name_t.replace("{type}", business_type.title()),
            "email":         email_t.replace("{slug}", slug),
            "phone":         phone,
            "website":       website_t.replace("{slug}", slug),
            "address":       f"{addr}, {location}",
            "city":          location,
            "business_type": business_type,
            "rating":        round(3.5 + (i % 3) * 0.5, 1),
            "review_count":  (i + 1) * 17,
            "score":         score,
            "status":        "new",
            "source":        "search",
        })

    return leads