# Production Deployment Guide
## Anand Sagar Engineering Archive & Private Admin CMS

This architecture comprises three independent components:
1. **Public Visitor Portfolio** (`portfolio/`): High-performance React + Vite SPA with retro engineering aesthetic and automatic offline fallback.
2. **Private Admin CMS** (`admin/`): Modern React + Vite control system with JWT authentication and asset telemetry.
3. **Backend Engine** (`backend/`): FastAPI REST API, SQLite (Dev) / PostgreSQL (Prod), Pillow media processing pipeline, and static uploads server.

---

## 1. Local Development Quickstart

To run the entire system locally:

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

# 3. Start Admin CMS (Port 5174) in a third terminal
cd admin
npm install
npm run dev
```

Local access:
- Public Portfolio: [http://localhost:5173](http://localhost:5173)
- Admin CMS: [http://localhost:5174](http://localhost:5174)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Default Admin Credentials: `admin` / `admin123` *(change upon first login)*

---

## 2. Environment Variables Specification

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `ENVIRONMENT` | Yes | Set to `production` in production | `production` |
| `JWT_SECRET` | Yes | Strong random secret for signing tokens | `openssl rand -hex 32` |
| `ADMIN_USERNAME` | Yes | Initial administrator username | `admin` |
| `ADMIN_PASSWORD` | Yes | Initial administrator password | `SecurePassword#2026!` |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins | `https://anandsagar.dev,https://admin.anandsagar.dev` |
| `DATABASE_URL` | Optional | Database connection string. Defaults to SQLite | `postgresql://user:pass@host:5432/dbname` |

### Public Portfolio (`portfolio/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL of FastAPI backend (no trailing slash) | `https://api.anandsagar.dev` |

### Admin CMS (`admin/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL of FastAPI backend (no trailing slash) | `https://api.anandsagar.dev` |
| `VITE_PUBLIC_URL` | Yes | URL of public portfolio for sidebar link | `https://anandsagar.dev` |

---

## 3. Database Setup & PostgreSQL Configuration

- **Development**: Uses SQLite automatically stored in `backend/portfolio.db`.
- **Production**: Supports managed PostgreSQL (Neon, Supabase, Render PostgreSQL, AWS RDS, Railway, etc.).
- **URL Normalization**: Both `postgres://` and `postgresql://` connection URI schemes are automatically normalized by the database engine.
- **Migration & Initialization**: On startup, `Base.metadata.create_all(bind=engine)` initializes all required tables and seeds default content and credentials if empty. Existing records are strictly preserved.

Example PostgreSQL Connection string:
```env
DATABASE_URL=postgresql://archive_user:archive_pass@ep-cool-db.us-east-2.aws.neon.tech/portfolio?sslmode=require
```

---

## 4. Backend Deployment (Render / Railway / Fly.io / Docker)

### Option A: Docker Container

A production `backend/Dockerfile` is included in the repository.

```bash
cd backend
docker build -t engineering-archive-backend .
docker run -d \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e JWT_SECRET="your-secure-secret-here" \
  -e CORS_ORIGINS="https://anandsagar.dev,https://admin.anandsagar.dev" \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -v archive_uploads:/app/uploads \
  engineering-archive-backend
```

### Option B: Render / Railway Web Service

1. Create a **New Web Service** pointing to `/backend`.
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Attach a persistent volume to `/app/uploads` (or configure an S3/Cloudinary bucket if using stateless instances).
5. Set environment variables from table above.

---

## 5. Public Portfolio Deployment (Vercel / Cloudflare Pages / Netlify)

1. Root Directory: `portfolio`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://api.anandsagar.dev`
5. **SPA Routing**: `portfolio/vercel.json` and `portfolio/public/_redirects` are preconfigured to route all paths to `/index.html`.

---

## 6. Admin CMS Deployment (Separate Domain / Subdomain)

1. Root Directory: `admin`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://api.anandsagar.dev`
   - `VITE_PUBLIC_URL`: `https://anandsagar.dev`
5. **SPA Routing**: `admin/vercel.json` and `admin/public/_redirects` are preconfigured to route all paths to `/index.html`.

---

## 7. CORS Hardening

The backend strictly enforces CORS based on `CORS_ORIGINS`:
- Multi-origin comma-separated values are parsed into an explicit allow-list.
- In `development` mode, localhost ports `5173` and `5174` are permitted automatically.
- Production rejects any origins not present in `CORS_ORIGINS`.
- Wildcards (`"*"`) automatically disable credentials to maintain standard browser security compliance.

---

## 8. Media Storage & Upload Pipeline Security

1. **Magic-Byte Signature Verification**: Rejects spoofed extensions by inspecting raw file headers (`\xFF\xD8\xFF` for JPEG, `\x89PNG\r\n\x1a\n` for PNG, `RIFF...WEBP` for WEBP).
2. **Decompression Bomb Protection**: Pillows `MAX_IMAGE_PIXELS` is strictly constrained to 25,000,000 pixels.
3. **Color-Space Sanitization**: RGBA, LA, and palette (`P`) images are cleanly converted to RGB before JPEG serialization.
4. **EXIF Normalization**: `ImageOps.exif_transpose` ensures mobile photos render in their correct orientation.
5. **Safe Filenames**: Server generates deterministic sanitized hashes (`<slug>_<hex8>.<ext>`) preventing directory traversal attacks (`../`).
6. **Reference-Aware Deletion**: Attempting to delete a `MediaAsset` actively referenced in `ProjectImage`, `AchievementImage`, `Certificate`, `ProfileImage`, `Education`, or `Experience` is blocked with HTTP 400 and returns a descriptive list of references.

---

## 9. Domain & DNS Configuration

| Component | Target URL | Recommended Provider |
|---|---|---|
| Public Portfolio | `https://anandsagar.dev` | Vercel / Cloudflare Pages |
| Admin CMS | `https://admin.anandsagar.dev` | Vercel / Cloudflare Pages |
| Backend API | `https://api.anandsagar.dev` | Render / Railway / Fly.io / VPS |

---

## 10. SPA Routing Configuration

Both frontend applications include preconfigured SPA fallback rewrite rules:
- `vercel.json`: Rewrites `/(.*)` to `/index.html`.
- `public/_redirects`: Netlify / Cloudflare Pages format `/* /index.html 200`.

Direct visits to deep URLs (e.g. `/projects`, `/achievements`, `/certificates`, `/content/home`) will not 404 on page refresh.

---

## 11. Build & Lint Verification Commands

```bash
# Verify Portfolio
npm --prefix portfolio run lint
npm --prefix portfolio run build

# Verify Admin
npm --prefix admin run lint
npm --prefix admin run build

# Verify Backend Tests
npm run test:backend
```

---

## 12. Health Check Telemetry

The API provides two identical health check endpoints:
- `GET /health`
- `GET /api/health`

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "app": "Anand Sagar Portfolio API",
  "version": "1.0.0"
}
```
If the database connection is lost or unreachable, the endpoint returns HTTP 503 with `"database": "disconnected"`.

---

## 13. Backup & Recovery

- **SQLite**: Backup `backend/portfolio.db` and `backend/uploads/`.
- **PostgreSQL**: Perform automated daily snapshots using `pg_dump` or managed database provider backups.
- **Media Files**: Persist the `backend/uploads/` directory on a persistent volume or object storage.

---

## 14. Redeployment Sequence

1. **Deploy Backend**: Apply database migrations if any, verify `/health` returns `200 OK`.
2. **Deploy Admin CMS**: Build and deploy `admin/` to `admin.anandsagar.dev`. Verify login and dashboard telemetry.
3. **Deploy Public Portfolio**: Build and deploy `portfolio/` to `anandsagar.dev`. Verify public data renders seamlessly and fallback behavior is preserved if API is temporarily paused.
