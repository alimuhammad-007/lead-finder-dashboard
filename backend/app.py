"""
LeadFlow Backend — Flask API Server
====================================
Entry point. Registers all route blueprints and starts the server.
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env file variables into environment
load_dotenv()

# Import route blueprints
from routes.leads    import leads_bp
from routes.outreach import outreach_bp
from routes.auth     import auth_bp
from routes.database import database_bp

def create_app():
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)

    # Allow requests from your frontend (Vite dev + Vercel production)
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",   # Vite dev server
                "http://localhost:3000",
                "https://*.vercel.app",    # Vercel preview deploys
                os.getenv("FRONTEND_URL", ""),
            ]
        }
    })

    # Secret key for session management
    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-in-prod")

    # Register all route blueprints with /api prefix
    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(leads_bp,    url_prefix="/api/leads")
    app.register_blueprint(outreach_bp, url_prefix="/api/outreach")
    app.register_blueprint(database_bp, url_prefix="/api/db")

    @app.get("/")
    def health():
        """Health check endpoint — Render uses this to verify the service is up."""
        return {"status": "ok", "service": "LeadFlow API v1.0"}

    return app


# Run the app (development mode)
if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"🚀 LeadFlow API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)