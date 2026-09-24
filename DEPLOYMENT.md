# Production Deployment Guide
## Anand Sagar Engineering Archive — Visitor Portfolio & FastAPI Backend

This architecture comprises two core components:
1. **Public Visitor Portfolio** (`portfolio/`): High-performance React + Vite SPA with retro engineering aesthetic and automatic offline fallback.
2. **Backend Engine** (`backend/`): FastAPI REST API, SQLite (Dev) / PostgreSQL (Prod), and static uploads server.

---

## 1. Local Development Quickstart

To run the system locally:

```bash
# 1. Start FastAPI Backend (Port 8000)
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start Public Portfolio (Port 5173) in a second terminal
cd portfolio
npm install
npm run dev
```

Local access:
- Public Portfolio: [http://localhost:5173](http://localhost:5173)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 2. Environment Variables Specification

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `ENVIRONMENT` | Yes | Set to `production` in production | `production` |
| `DATABASE_URL` | No | SQLite default; set PostgreSQL for scale | `postgresql://user:pass@host:5432/dbname` |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins or `*` | `https://anandsagar.dev` |

### Public Portfolio (`portfolio/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Root URL to backend API | `https://api.anandsagar.dev` |

---

## 3. Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set Root Directory to `portfolio`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL` = your live backend URL

### Backend (Render / Railway / VPS)
1. Build Command: `pip install -r requirements.txt`
2. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Set Environment Variables: `ENVIRONMENT=production`, `CORS_ORIGINS=https://your-portfolio-domain.vercel.app`
