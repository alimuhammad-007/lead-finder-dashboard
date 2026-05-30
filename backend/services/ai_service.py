"""
services/ai_service.py
=======================
Generates personalized cold outreach messages using the Groq API
(Llama 3.3 70B — extremely fast, free tier available).

Falls back to a template-based message if no API key is configured.
"""

import os
from groq import Groq

# Initialize Groq client (reads GROQ_API_KEY from environment automatically)
_client: Groq | None = None

def _get_client() -> Groq:
    """Lazy-initialize the Groq client."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise EnvironmentError("GROQ_API_KEY is not set in environment variables.")
        _client = Groq(api_key=api_key)
    return _client


def generate_outreach_message(
    business_name:  str,
    business_type:  str,
    location:       str,
    tone:           str = "professional",
    sender_name:    str = "Alex",
    sender_company: str = "Your Company",
) -> dict:
    """
    Generate a personalized cold outreach email using Groq + Llama 3.3.

    Args:
        business_name:  Target business name
        business_type:  Type of business (e.g. "dentist")
        location:       City/region (e.g. "New York")
        tone:           "professional" | "friendly" | "sales-focused"
        sender_name:    Your name (personalization)
        sender_company: Your company name

    Returns:
        dict with "subject" and "message" keys
    """

    # Build tone-specific instructions for the AI
    tone_instructions = {
        "professional": (
            "Write in a formal, polished, business-professional tone. "
            "Be concise, respect their time, and focus on mutual value."
        ),
        "friendly": (
            "Write in a warm, conversational, human tone. "
            "Be approachable and genuine — like you're reaching out to a peer."
        ),
        "sales-focused": (
            "Write persuasively with a clear value proposition and call to action. "
            "Highlight benefits, create light urgency, and be direct about the ask."
        ),
    }.get(tone, "Write professionally and concisely.")

    prompt = f"""You are an expert cold email copywriter. Generate a personalized cold outreach email.

Business Details:
- Business Name: {business_name}
- Business Type: {business_type}
- Location: {location}

Sender Details:
- Sender Name: {sender_name}
- Sender Company: {sender_company}

Tone Instructions: {tone_instructions}

Requirements:
- Keep subject line under 8 words, compelling and specific
- Email body should be 3-4 short paragraphs (under 200 words total)
- Reference their specific business type and location naturally
- Include a clear, single call-to-action
- Do NOT use overly salesy buzzwords or generic phrases
- Sound like a real human wrote this

Respond ONLY in this exact JSON format (no markdown, no extra text):
{{
  "subject": "Your subject line here",
  "message": "Full email body here with \\n for line breaks"
}}"""

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast + high quality
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,    # Some creativity without going off-rails
            max_tokens=600,
            response_format={"type": "json_object"},  # Force JSON output
        )

        import json
        result = json.loads(response.choices[0].message.content)

        return {
            "subject": result.get("subject", "Quick question"),
            "message": result.get("message", ""),
            "tone":    tone,
            "model":   "llama-3.3-70b-versatile",
        }

    except EnvironmentError:
        # No API key — return a realistic template
        return _fallback_message(business_name, business_type, location, tone, sender_name, sender_company)

    except Exception as e:
        raise RuntimeError(f"AI message generation failed: {str(e)}")


def _fallback_message(
    business_name: str,
    business_type: str,
    location: str,
    tone: str,
    sender_name: str,
    sender_company: str,
) -> dict:
    """Template-based fallback when Groq API is unavailable."""

    templates = {
        "professional": {
            "subject": f"Partnership opportunity for {business_name}",
            "message": (
                f"Hi {business_name} team,\n\n"
                f"I came across {business_name} while researching top {business_type} businesses in {location}, "
                f"and I was impressed by your reputation in the area.\n\n"
                f"At {sender_company}, we help {business_type} businesses like yours streamline operations and attract more clients. "
                f"I'd love to share how we've helped similar businesses in {location} grow by 30%+.\n\n"
                f"Would you have 15 minutes for a quick call this week?\n\n"
                f"Best regards,\n{sender_name}\n{sender_company}"
            ),
        },
        "friendly": {
            "subject": f"Hey {business_name} — quick idea for you!",
            "message": (
                f"Hey there!\n\n"
                f"I was searching for the best {business_type} businesses in {location} and {business_name} caught my eye — "
                f"you're clearly doing something right!\n\n"
                f"I run {sender_company} and we've been working with {business_type} owners to help them get more customers without the headache. "
                f"Thought it might be worth a quick chat!\n\n"
                f"Up for grabbing a virtual coffee sometime?\n\n"
                f"Cheers,\n{sender_name}"
            ),
        },
        "sales-focused": {
            "subject": f"3x more {business_type} clients in 90 days — {business_name}",
            "message": (
                f"Hi {business_name},\n\n"
                f"Businesses like yours in {location} are leaving serious revenue on the table — and most don't even know it.\n\n"
                f"At {sender_company}, we specialize in helping {business_type} businesses acquire 3x more clients in 90 days "
                f"through our proven system. We've done it for 50+ businesses in your space.\n\n"
                f"I have 2 spots open this month for {location}-based {business_type} businesses.\n\n"
                f"Reply 'YES' and I'll send you a free growth audit for {business_name}.\n\n"
                f"— {sender_name}, {sender_company}"
            ),
        },
    }

    template = templates.get(tone, templates["professional"])
    return {**template, "tone": tone, "model": "template-fallback"}