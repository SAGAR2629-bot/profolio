import pytest
import os
from fastapi.testclient import TestClient

# Ensure test DB is used
os.environ["DATABASE_URL"] = "sqlite:///./test_portfolio.db"

from main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield
    # Cleanup
    if os.path.exists("./test_portfolio.db"):
        try:
            os.remove("./test_portfolio.db")
        except:
            pass

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["database"] == "connected"

def test_public_portfolio_aggregate(client):
    res = client.get("/api/public/portfolio")
    assert res.status_code == 200
    data = res.json()
    assert "profile" in data
    assert "home_content" in data
    assert "projects" in data
    assert "achievements" in data
    assert "certificates" in data
    assert "skills" in data
    assert "education" in data
    assert "experience" in data
    assert len(data["projects"]) > 0
    assert data["profile"]["name"] == "Anand Sagar"

def test_public_projects_list_and_detail(client):
    res = client.get("/api/public/projects")
    assert res.status_code == 200
    projects = res.json()
    assert isinstance(projects, list)
    assert len(projects) > 0

    first_slug = projects[0]["id"]
    detail_res = client.get(f"/api/public/projects/{first_slug}")
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == projects[0]["title"]

def test_public_registries(client):
    for endpoint in ["achievements", "certificates", "education", "experience", "skills", "contact"]:
        res = client.get(f"/api/public/{endpoint}")
        assert res.status_code == 200
