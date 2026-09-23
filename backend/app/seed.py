import os
import json
from sqlalchemy.orm import Session
from .models.models import (
    AdminUser, SiteContent, Profile, Project, Achievement,
    Certificate, Education, Experience, SkillCategory
)
from .auth import hash_password, get_admin_credentials

SEED_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "seed_data", "portfolio.json"))

def seed_database(db: Session):
    """Seeds the database from portfolio.json and default credentials if empty."""
    # 1. Admin User
    admin = db.query(AdminUser).first()
    if not admin:
        default_user, default_pass = get_admin_credentials()
        admin = AdminUser(
            username=default_user,
            hashed_password=hash_password(default_pass)
        )
        db.add(admin)
        db.commit()
        print(f"[SEED] Created default admin user: {default_user}")

    # Check if content already seeded
    if db.query(Project).count() > 0 or db.query(Profile).count() > 0:
        return

    if not os.path.exists(SEED_FILE):
        print(f"[SEED] Seed file not found at {SEED_FILE}. Skipping data seed.")
        return

    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Profile
    if "profile" in data:
        p_data = data["profile"]
        profile = Profile(
            name=p_data.get("name", "Anand Sagar"),
            title=p_data.get("title", ""),
            short_intro=p_data.get("short_intro", ""),
            biography=p_data.get("biography", ""),
            interests=p_data.get("interests", []),
            focus_areas=p_data.get("focus_areas", []),
            social_links=p_data.get("social_links", {})
        )
        db.add(profile)

    # 3. SiteContent: home_content
    if "home_content" in data:
        home_content = SiteContent(
            section="home",
            data=data["home_content"]
        )
        db.add(home_content)

    # 4. SiteContent: contact
    if "contact" in data:
        contact_content = SiteContent(
            section="contact",
            data=data["contact"]
        )
        db.add(contact_content)

    # 5. Projects
    projects = data.get("projects", [])
    for idx, p in enumerate(projects):
        proj = Project(
            title=p.get("title", ""),
            slug=p.get("id") or f"project-{idx}",
            short_description=p.get("description", ""),
            full_description=p.get("fullDescription", p.get("description", "")),
            year=p.get("year", "2025"),
            category=p.get("category", "AI/ML"),
            technologies=p.get("technologies", []),
            status=p.get("status", "COMPLETED"),
            github_url=p.get("github", ""),
            demo_url=p.get("demo", ""),
            color=p.get("color", "cyan"),
            display_order=idx,
            published=True
        )
        db.add(proj)

    # 6. Achievements
    achievements = data.get("achievements", [])
    for idx, a in enumerate(achievements):
        ach = Achievement(
            year=a.get("year", "2025"),
            title=a.get("title", ""),
            description=a.get("description", ""),
            badge=a.get("badge", "🏆"),
            category=a.get("category", "Milestone"),
            status=a.get("status", "COMPLETED"),
            organization=a.get("organization", ""),
            display_order=idx,
            published=True
        )
        db.add(ach)

    # 7. Certificates
    certificates = data.get("certificates", [])
    for idx, c in enumerate(certificates):
        cert = Certificate(
            title=c.get("title", ""),
            issuer=c.get("issuer", ""),
            date=c.get("date", ""),
            category=c.get("category", "AI/ML"),
            url=c.get("url", ""),
            description=c.get("description", ""),
            color=c.get("color", "cyan"),
            display_order=idx,
            published=True
        )
        db.add(cert)

    # 8. Education
    education = data.get("education", [])
    for idx, e in enumerate(education):
        edu = Education(
            degree=e.get("degree", ""),
            institution=e.get("institution", ""),
            duration=e.get("duration", ""),
            description=e.get("description", ""),
            relevant_courses=e.get("relevantCourses", []),
            display_order=idx,
            published=True
        )
        db.add(edu)

    # 9. Experience
    experience = data.get("experience", [])
    for idx, ex in enumerate(experience):
        exp = Experience(
            role=ex.get("role", ""),
            company=ex.get("company", ""),
            duration=ex.get("duration", ""),
            description=ex.get("description", ""),
            technologies=ex.get("technologies", []),
            display_order=idx,
            published=True
        )
        db.add(exp)

    # 10. Skills
    skills = data.get("skills", [])
    for idx, s in enumerate(skills):
        sk = SkillCategory(
            category=s.get("category", ""),
            color=s.get("color", "cyan"),
            icon=s.get("icon", "⚙️"),
            items=s.get("items", []),
            display_order=idx
        )
        db.add(sk)

    db.commit()
    print(f"[SEED] Successfully seeded database from {SEED_FILE}")
