import pytest
import os
import io
from fastapi.testclient import TestClient
from PIL import Image

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

@pytest.fixture
def auth_headers(client):
    res = client.post("/api/admin/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

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

def test_admin_auth_flow(client):
    # Invalid login
    res = client.post("/api/admin/login", json={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401

    # Valid login
    res = client.post("/api/admin/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    token = res.json()["access_token"]

    # Protected me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/admin/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "admin"

def test_dashboard_stats(client, auth_headers):
    res = client.get("/api/admin/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_projects"] > 0
    assert stats["published_projects"] > 0

def test_project_crud_and_draft_isolation(client, auth_headers):
    # 1. Create a draft project
    new_proj = {
        "title": "Super Secret RL Rover",
        "slug": "secret-rl-rover",
        "short_description": "Experimental autonomous system",
        "full_description": "Full details on the secret rover",
        "year": "2026",
        "category": "Robotics",
        "technologies": ["ROS2", "PyTorch"],
        "status": "IN PROGRESS",
        "published": False  # DRAFT
    }
    res = client.post("/api/admin/projects", json=new_proj, headers=auth_headers)
    assert res.status_code == 201
    proj_id = res.json()["id"]

    # 2. Verify draft does NOT appear in public endpoints
    pub_res = client.get("/api/public/projects")
    slugs = [p["id"] for p in pub_res.json()]
    assert "secret-rl-rover" not in slugs

    single_pub = client.get("/api/public/projects/secret-rl-rover")
    assert single_pub.status_code == 404

    # 3. Publish the project
    pub_update = client.put(f"/api/admin/projects/{proj_id}", json={"published": True}, headers=auth_headers)
    assert pub_update.status_code == 200
    assert pub_update.json()["published"] is True

    # 4. Now verify it DOES appear in public endpoints
    pub_res2 = client.get("/api/public/projects")
    slugs2 = [p["id"] for p in pub_res2.json()]
    assert "secret-rl-rover" in slugs2

    single_pub2 = client.get("/api/public/projects/secret-rl-rover")
    assert single_pub2.status_code == 200
    assert single_pub2.json()["title"] == "Super Secret RL Rover"

    # Cleanup: delete project
    del_res = client.delete(f"/api/admin/projects/{proj_id}", headers=auth_headers)
    assert del_res.status_code == 200

def test_media_upload_and_delete_protection(client, auth_headers):
    # Create test image in memory
    img = Image.new("RGB", (200, 200), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    # 1. Upload media
    files = {"file": ("test_blue.jpg", buf, "image/jpeg")}
    data = {"title": "Test Blue Image", "alt_text": "A solid blue square"}
    up_res = client.post("/api/admin/media/upload", files=files, data=data, headers=auth_headers)
    assert up_res.status_code == 201
    media_data = up_res.json()
    media_id = media_data["id"]
    assert media_data["width"] == 200
    assert media_data["height"] == 200

    # 2. Attach media to project
    projs = client.get("/api/admin/projects", headers=auth_headers).json()
    target_proj = projs[0]
    attach_res = client.post(
        f"/api/admin/projects/{target_proj['id']}/images",
        json={"media_id": media_id, "caption": "Project Diagram", "is_cover": True},
        headers=auth_headers
    )
    assert attach_res.status_code == 200
    gallery_img_id = attach_res.json()["id"]

    # 3. Try to delete media -> MUST be blocked because it's referenced!
    del_fail = client.delete(f"/api/admin/media/{media_id}", headers=auth_headers)
    assert del_fail.status_code == 400
    detail = del_fail.json()["detail"]
    assert "references" in detail
    assert detail["references"][0]["type"] == "Project"

    # 4. Remove image from project gallery
    rm_gal = client.delete(f"/api/admin/projects/{target_proj['id']}/images/{gallery_img_id}", headers=auth_headers)
    assert rm_gal.status_code == 200

    # 5. Delete media now succeeds
    del_success = client.delete(f"/api/admin/media/{media_id}", headers=auth_headers)
    assert del_success.status_code == 200

def test_case_study_duplicate_and_archive(client, auth_headers):
    # 1. Create a rich project case study
    new_proj = {
        "title": "Quadruped Autonomous Agent",
        "slug": "quadruped-agent",
        "short_description": "PPO-trained locomotion on rough terrain",
        "full_description": "Full research project exploring sim-to-real transfer.",
        "year": "2026",
        "category": "Robotics",
        "technologies": ["Python", "PyTorch", "MuJoCo"],
        "status": "COMPLETED",
        "featured": True,
        "domain": "Embodied AI",
        "platform": "Unitree Go2 & Isaac Sim",
        "overview": "High performance quadruped locomotion policy.",
        "problem": "Uncertain ground friction in unpredictable outdoor environments.",
        "approach": "Domain randomization with asymmetric actor-critic architecture.",
        "implementation": "Trained across 4096 parallel environments in Isaac Gym.",
        "metrics": [
            {"label": "Control Frequency", "value": "50 Hz", "description": "Low latency inference loop", "display_order": 0},
            {"label": "Success Rate", "value": "94.2%", "description": "Across 100 test runs", "display_order": 1}
        ],
        "challenges": [
            {"challenge": "Motor overheating during sustained trotting.", "solution": "Added joint torque regularization penalty to reward function.", "display_order": 0}
        ],
        "milestones": [
            {"date": "2025-Q3", "title": "Simulation Convergence", "description": "Achieved baseline walking.", "display_order": 0}
        ],
        "links": {
            "github": "https://github.com/anand/quadruped",
            "paper": "https://arxiv.org/abs/2401.00000"
        },
        "published": True,
        "archived": False
    }
    create_res = client.post("/api/admin/projects", json=new_proj, headers=auth_headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 2. Check public portfolio sees it with all case study fields
    pub_res = client.get("/api/public/portfolio")
    assert pub_res.status_code == 200
    pub_projs = pub_res.json()["projects"]
    matching = [p for p in pub_projs if p["db_id"] == created_id]
    assert len(matching) == 1
    proj_item = matching[0]
    assert proj_item["domain"] == "Embodied AI"
    assert proj_item["featured"] is True
    assert len(proj_item["metrics"]) == 2
    assert proj_item["metrics"][0]["value"] == "50 Hz"
    assert len(proj_item["challenges"]) == 1

    # 3. Duplicate project -> must create a draft
    dup_res = client.post(f"/api/admin/projects/{created_id}/duplicate", headers=auth_headers)
    assert dup_res.status_code == 201
    dup_data = dup_res.json()
    assert dup_data["published"] is False
    assert dup_data["slug"].startswith("quadruped-agent-copy")
    assert dup_data["title"] == "Quadruped Autonomous Agent (Draft Copy)"
    assert len(dup_data["metrics"]) == 2

    # Verify duplicate is NOT on public site because published=False
    pub_res2 = client.get("/api/public/portfolio")
    assert not any(p["db_id"] == dup_data["id"] for p in pub_res2.json()["projects"])

    # 4. Archive original project -> must disappear from public site
    arc_res = client.put(f"/api/admin/projects/{created_id}/archive", headers=auth_headers)
    assert arc_res.status_code == 200
    assert arc_res.json()["archived"] is True

    pub_res3 = client.get("/api/public/portfolio")
    assert not any(p["db_id"] == created_id for p in pub_res3.json()["projects"])

    # 5. Restore archived project
    res_arc = client.put(f"/api/admin/projects/{created_id}/archive", headers=auth_headers)
    assert res_arc.status_code == 200
    assert res_arc.json()["archived"] is False

    pub_res4 = client.get("/api/public/portfolio")
    assert any(p["db_id"] == created_id for p in pub_res4.json()["projects"])

    # Cleanup
    client.delete(f"/api/admin/projects/{created_id}", headers=auth_headers)
    client.delete(f"/api/admin/projects/{dup_data['id']}", headers=auth_headers)

def test_all_registries_crud_duplicate_archive_isolation(client, auth_headers):
    # 1. Achievement
    ach_payload = {
        "year": "2026",
        "title": "International Robotics Champion",
        "description": "Won gold medal",
        "badge": "🥇",
        "category": "Robotics",
        "status": "COMPLETED",
        "organization": "Robotics Association",
        "accomplishment": "Designed and deployed custom RL policy",
        "contribution": "Lead Control Engineer",
        "result": "1st place among 40 international teams",
        "related_project_slug": "quadruped-rl-controller",
        "verification_url": "https://example.com/verify-ach",
        "event_date": "2026-08-15",
        "published": True,
        "featured": True
    }
    ach_res = client.post("/api/admin/achievements", json=ach_payload, headers=auth_headers)
    assert ach_res.status_code == 201
    ach_id = ach_res.json()["id"]

    # Verify public sees it with rich fields
    pub_ach = client.get("/api/public/achievements")
    assert pub_ach.status_code == 200
    matched_ach = [a for a in pub_ach.json() if a["id"] == ach_id]
    assert len(matched_ach) == 1
    assert matched_ach[0]["accomplishment"] == "Designed and deployed custom RL policy"
    assert matched_ach[0]["contribution"] == "Lead Control Engineer"

    # Duplicate achievement
    dup_ach_res = client.post(f"/api/admin/achievements/{ach_id}/duplicate", headers=auth_headers)
    assert dup_ach_res.status_code == 201
    dup_ach_id = dup_ach_res.json()["id"]
    assert dup_ach_res.json()["published"] is False

    # Archive achievement
    arc_ach_res = client.put(f"/api/admin/achievements/{ach_id}/archive", headers=auth_headers)
    assert arc_ach_res.status_code == 200
    assert arc_ach_res.json()["archived"] is True

    # Verify archived achievement is NOT in public
    pub_ach_after = client.get("/api/public/achievements")
    assert not any(a["id"] == ach_id for a in pub_ach_after.json())

    # 2. Certificate
    cert_payload = {
        "title": "NVIDIA Certified Autonomous Systems Architect",
        "issuer": "NVIDIA",
        "date": "2026",
        "category": "Robotics",
        "url": "https://nvidia.com/verify/123",
        "credential_id": "NV-992384",
        "verification_url": "https://nvidia.com/verify/123",
        "related_skills": ["CUDA", "Isaac Gym", "ROS2"],
        "related_project_slug": "quadruped-rl-controller",
        "published": True,
        "featured": True
    }
    cert_res = client.post("/api/admin/certificates", json=cert_payload, headers=auth_headers)
    assert cert_res.status_code == 201
    cert_id = cert_res.json()["id"]

    # Verify public certificates
    pub_certs = client.get("/api/public/certificates")
    assert pub_certs.status_code == 200
    matched_cert = [c for c in pub_certs.json() if c["id"] == cert_id]
    assert len(matched_cert) == 1
    assert matched_cert[0]["credential_id"] == "NV-992384"
    assert "Isaac Gym" in matched_cert[0]["related_skills"]

    # Duplicate certificate
    dup_cert = client.post(f"/api/admin/certificates/{cert_id}/duplicate", headers=auth_headers)
    assert dup_cert.status_code == 201
    dup_cert_id = dup_cert.json()["id"]
    assert dup_cert.json()["published"] is False

    # Archive certificate
    client.put(f"/api/admin/certificates/{cert_id}/archive", headers=auth_headers)
    pub_certs_after = client.get("/api/public/certificates")
    assert not any(c["id"] == cert_id for c in pub_certs_after.json())

    # 3. Education
    edu_payload = {
        "degree": "M.S. in Robotics and Autonomous Systems",
        "institution": "Robotics Institute",
        "duration": "2026 — 2028",
        "description": "Graduate research in quadruped locomotion",
        "location": "Boston, MA",
        "status": "IN PROGRESS",
        "relevant_courses": ["Robot Kinematics", "Optimal Control"],
        "related_projects": ["quadruped-rl-controller"],
        "related_skills": ["MuJoCo", "PyTorch"],
        "published": True
    }
    edu_res = client.post("/api/admin/education", json=edu_payload, headers=auth_headers)
    assert edu_res.status_code == 201
    edu_id = edu_res.json()["id"]

    pub_edu = client.get("/api/public/education")
    assert pub_edu.status_code == 200
    matched_edu = [e for e in pub_edu.json() if e["id"] == edu_id]
    assert len(matched_edu) == 1
    assert matched_edu[0]["status"] == "IN PROGRESS"
    assert matched_edu[0]["location"] == "Boston, MA"

    # Archive education
    client.put(f"/api/admin/education/{edu_id}/archive", headers=auth_headers)
    pub_edu_after = client.get("/api/public/education")
    assert not any(e["id"] == edu_id for e in pub_edu_after.json())

    # 4. Experience
    exp_payload = {
        "role": "Staff Robotics Research Engineer",
        "company": "DeepMind Robotics Lab",
        "duration": "2026 — Present",
        "description": "Locomotion policy research",
        "location": "London, UK",
        "technologies": ["PyTorch", "MuJoCo", "JAX"],
        "responsibilities": ["Design sim-to-real pipelines", "Deploy on quadruped hardware"],
        "work_performed": "Implemented PPO with domain randomization",
        "results": "Decreased real-world failure rate by 80%",
        "related_projects": ["quadruped-rl-controller"],
        "related_skills": ["PyTorch", "MuJoCo"],
        "published": True
    }
    exp_res = client.post("/api/admin/experience", json=exp_payload, headers=auth_headers)
    assert exp_res.status_code == 201
    exp_id = exp_res.json()["id"]

    pub_exp = client.get("/api/public/experience")
    assert pub_exp.status_code == 200
    matched_exp = [ex for ex in pub_exp.json() if ex["id"] == exp_id]
    assert len(matched_exp) == 1
    assert matched_exp[0]["location"] == "London, UK"
    assert "Design sim-to-real pipelines" in matched_exp[0]["responsibilities"]

    # Archive experience
    client.put(f"/api/admin/experience/{exp_id}/archive", headers=auth_headers)
    pub_exp_after = client.get("/api/public/experience")
    assert not any(ex["id"] == exp_id for ex in pub_exp_after.json())

    # Cleanup
    client.delete(f"/api/admin/achievements/{ach_id}", headers=auth_headers)
    client.delete(f"/api/admin/achievements/{dup_ach_id}", headers=auth_headers)
    client.delete(f"/api/admin/certificates/{cert_id}", headers=auth_headers)
    client.delete(f"/api/admin/certificates/{dup_cert_id}", headers=auth_headers)
    client.delete(f"/api/admin/education/{edu_id}", headers=auth_headers)
    client.delete(f"/api/admin/experience/{exp_id}", headers=auth_headers)

def test_health_check_database_connectivity(client):
    for endpoint in ["/health", "/api/health"]:
        res = client.get(endpoint)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"

def test_media_reference_protection_extended(client, auth_headers):
    # Create valid dummy image
    img = Image.new('RGB', (100, 100), color='cyan')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    upload_res = client.post(
        "/api/admin/media/upload",
        files={"file": ("edu_test.jpg", img_byte_arr, "image/jpeg")},
        data={"title": "Diploma Verification Asset", "alt_text": "Certificate of Completion"},
        headers=auth_headers
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["id"]

    # Attach to Education record
    edu_res = client.post(
        "/api/admin/education",
        json={
            "degree": "Test B.Tech Degree",
            "institution": "Test Tech University",
            "duration": "2020-2024",
            "media_id": media_id,
            "published": True
        },
        headers=auth_headers
    )
    assert edu_res.status_code == 201
    edu_id = edu_res.json()["id"]

    # Deleting media without force MUST fail because it is actively referenced in Education
    del_res = client.delete(f"/api/admin/media/{media_id}", headers=auth_headers)
    assert del_res.status_code == 400
    assert "actively referenced" in str(del_res.json())

    # Cleanup: delete education record first, then delete media
    client.delete(f"/api/admin/education/{edu_id}", headers=auth_headers)
    clean_del = client.delete(f"/api/admin/media/{media_id}", headers=auth_headers)
    assert clean_del.status_code == 200

def test_upload_validation_magic_bytes(client, auth_headers):
    # Upload text disguised as a JPEG
    fake_img = io.BytesIO(b"<html><script>alert(1)</script></html>")
    res = client.post(
        "/api/admin/media/upload",
        files={"file": ("exploit.jpg", fake_img, "image/jpeg")},
        headers=auth_headers
    )
    assert res.status_code == 400
    assert "binary signature" in res.json()["detail"].lower() or "invalid image" in res.json()["detail"].lower()


