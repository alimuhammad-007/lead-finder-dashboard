# LeadFlow — AI-Powered Lead Finder & Outreach Dashboard

A production-ready SaaS application for finding business leads and generating personalized AI outreach messages.

---

## 🗂 Project Structure

```
leadflow/
├── frontend/          # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/
│       │   ├── auth/         # Login, Signup components
│       │   ├── dashboard/    # Stats, charts, sidebar
│       │   ├── leads/        # Lead finder, lead table
│       │   ├── outreach/     # AI message generator
│       │   └── shared/       # Reusable UI components
│       ├── pages/            # Route-level page components
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Supabase client, API helpers
│       ├── store/            # Zustand global state
│       └── styles/           # Global CSS
├── backend/           # Python Flask API
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic (AI, leads, DB)
│   └── utils/         # Helpers, validators
├── docs/              # Deployment & API docs
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/leadflow.git
cd leadflow

# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### 2. Environment Variables

**frontend/.env**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

**backend/.env**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
SERPAPI_KEY=your_serpapi_key
FLASK_SECRET_KEY=random_secret_string
```

### 3. Supabase Setup

Run the SQL from `docs/supabase_schema.sql` in your Supabase SQL editor.

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend && python app.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 🗃 Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends Supabase auth) |
| `leads` | Stored business leads |
| `outreach_messages` | AI-generated messages |
| `search_history` | User search logs |
| `activity_logs` | Audit trail |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy /dist to Vercel
# Add env vars in Vercel dashboard
```

### Backend → Render
```bash
# Push backend/ to GitHub
# Create new Web Service on Render
# Set env vars in Render dashboard
# Build: pip install -r requirements.txt
# Start: gunicorn app:app
```

---

## 🔑 API Keys You Need

| Service | Purpose | Get it |
|---------|---------|--------|
| Supabase | Database + Auth | supabase.com |
| Groq | AI message generation | console.groq.com |
| SerpAPI | Lead/business search | serpapi.com |

---

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Recharts
- **Backend**: Python Flask, Supabase-py, Requests
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (Llama 3.3 70B)
- **Search**: SerpAPI Google Places