import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_auto_migrations(eng):
    """Automatically adds missing columns to existing SQLite tables."""
    from sqlalchemy import inspect, text
    inspector = inspect(eng)
    tables = inspector.get_table_names()

    table_migrations = {
        "projects": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("domain", "VARCHAR(100) DEFAULT 'Robotics / AI'"),
            ("platform", "VARCHAR(100) DEFAULT 'Physical & Simulation'"),
            ("overview", "TEXT DEFAULT ''"),
            ("problem", "TEXT DEFAULT ''"),
            ("approach", "TEXT DEFAULT ''"),
            ("implementation", "TEXT DEFAULT ''"),
            ("architecture", "TEXT DEFAULT ''"),
            ("engineering_notes", "TEXT DEFAULT ''"),
            ("metrics", "TEXT DEFAULT '[]'"),
            ("challenges", "TEXT DEFAULT '[]'"),
            ("milestones", "TEXT DEFAULT '[]'"),
            ("links", "TEXT DEFAULT '{}'")
        ],
        "project_images": [
            ("media_type", "VARCHAR(50) DEFAULT 'OTHER'")
        ],
        "achievements": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("accomplishment", "TEXT DEFAULT ''"),
            ("contribution", "TEXT DEFAULT ''"),
            ("result", "TEXT DEFAULT ''"),
            ("related_project_slug", "VARCHAR(255) DEFAULT ''"),
            ("verification_url", "VARCHAR(500) DEFAULT ''"),
            ("event_date", "VARCHAR(100) DEFAULT ''")
        ],
        "achievement_images": [
            ("media_type", "VARCHAR(50) DEFAULT 'EVIDENCE'")
        ],
        "certificates": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("credential_id", "VARCHAR(255) DEFAULT ''"),
            ("verification_url", "VARCHAR(500) DEFAULT ''"),
            ("related_skills", "TEXT DEFAULT '[]'"),
            ("related_project_slug", "VARCHAR(255) DEFAULT ''")
        ],
        "education": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("location", "VARCHAR(200) DEFAULT ''"),
            ("status", "VARCHAR(50) DEFAULT 'COMPLETED'"),
            ("related_projects", "TEXT DEFAULT '[]'"),
            ("related_skills", "TEXT DEFAULT '[]'"),
            ("achievements", "TEXT DEFAULT '[]'"),
            ("media_id", "INTEGER DEFAULT NULL")
        ],
        "experience": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("location", "VARCHAR(200) DEFAULT ''"),
            ("responsibilities", "TEXT DEFAULT '[]'"),
            ("work_performed", "TEXT DEFAULT ''"),
            ("results", "TEXT DEFAULT ''"),
            ("related_projects", "TEXT DEFAULT '[]'"),
            ("related_skills", "TEXT DEFAULT '[]'"),
            ("external_url", "VARCHAR(500) DEFAULT ''"),
            ("media_id", "INTEGER DEFAULT NULL")
        ],
        "skill_categories": [
            ("featured", "BOOLEAN DEFAULT 0"),
            ("archived", "BOOLEAN DEFAULT 0"),
            ("published", "BOOLEAN DEFAULT 1"),
            ("description", "TEXT DEFAULT ''")
        ]
    }

    with eng.connect() as conn:
        for tbl_name, col_list in table_migrations.items():
            if tbl_name in tables:
                existing_cols = {col["name"] for col in inspector.get_columns(tbl_name)}
                for col_name, col_def in col_list:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE {tbl_name} ADD COLUMN {col_name} {col_def}"))
                            conn.commit()
                        except Exception as e:
                            print(f"[MIGRATE] Notice adding {tbl_name}.{col_name}: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
