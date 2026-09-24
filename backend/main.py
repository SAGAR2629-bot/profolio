import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.database import engine, Base, SessionLocal, run_auto_migrations
from app.seed import seed_database
from app.routers import public

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("anand_archive_api")

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    run_auto_migrations(engine)

    # 2. Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()



    logger.info("Anand Sagar Engineering Archive Backend initialized successfully.")
    yield
    logger.info("Anand Sagar Engineering Archive Backend shutting down.")

app = FastAPI(
    title="Anand Sagar Engineering Archive - Content API",
    version="1.0.0",
    lifespan=lifespan
)

# Robust CORS Configuration: Seamless support for Vercel, localhost, Render, and custom domains
cors_env = os.environ.get("CORS_ORIGINS", "").strip()

custom_origins = []
if cors_env and cors_env != "*":
    custom_origins = [origin.strip().strip("'\"") for origin in cors_env.split(",") if origin.strip()]

# Regex covering all localhost, 127.0.0.1, Vercel deployments, Render, Netlify, and Cloudflare Pages
DEFAULT_ORIGIN_REGEX = r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.pages\.dev|https://.*\.netlify\.app)$"

if cors_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=custom_origins,
        allow_origin_regex=DEFAULT_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Static files for uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Global Exception Handler in Production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    env = os.environ.get("ENVIRONMENT", "development").lower()
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    if env == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please contact the administrator."}
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )

# Include Routers
app.include_router(public.router)

# Health Checks with Database Ping
@app.get("/health")
@app.get("/api/health")
def health_check():
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception as e:
        logger.error(f"Health check database ping failed: {e}")

    if not db_ok:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected", "app": "Anand Sagar Portfolio API"}
        )

    return {
        "status": "ok",
        "database": "connected",
        "app": "Anand Sagar Portfolio API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
