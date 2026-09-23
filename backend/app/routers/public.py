from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from ..database import get_db
from ..models.models import (
    Profile, SiteContent, Project, ProjectImage, Achievement, AchievementImage,
    Certificate, Education, Experience, SkillCategory
)
from ..schemas.schemas import (
    ProfileResponse, ProjectResponse, AchievementResponse,
    CertificateResponse, EducationResponse, ExperienceResponse,
    SkillCategoryResponse
)

router = APIRouter(prefix="/api/public", tags=["Public API"])

def format_project(p: Project) -> Dict[str, Any]:
    images = []
    cover_image = None
    for img in sorted(p.images, key=lambda x: x.display_order):
        img_dict = {
            "id": img.id,
            "media_id": img.media_id,
            "caption": img.caption,
            "media_type": getattr(img, "media_type", "OTHER") or "OTHER",
            "display_order": img.display_order,
            "is_cover": img.is_cover,
            "url": img.media.public_url if img.media else "",
            "alt": (img.media.alt_text if img.media and img.media.alt_text else img.caption) or p.title,
            "title": img.media.title if img.media else ""
        }
        images.append(img_dict)
        if img.is_cover and not cover_image:
            cover_image = img_dict["url"]

    # Fallback cover image if none marked as cover
    if not cover_image and images:
        cover_image = images[0]["url"]

    return {
        "id": p.slug,
        "db_id": p.id,
        "title": p.title,
        "description": p.short_description,
        "fullDescription": p.full_description,
        "year": p.year,
        "category": p.category,
        "technologies": p.technologies or [],
        "status": p.status,
        "github": p.github_url,
        "demo": p.demo_url,
        "color": p.color,
        "image": cover_image,
        "images": images,
        "display_order": p.display_order,
        "featured": bool(getattr(p, "featured", False)),
        "domain": getattr(p, "domain", "Robotics / AI") or "Robotics / AI",
        "platform": getattr(p, "platform", "Physical & Simulation") or "Physical & Simulation",
        "overview": getattr(p, "overview", "") or "",
        "problem": getattr(p, "problem", "") or "",
        "approach": getattr(p, "approach", "") or "",
        "implementation": getattr(p, "implementation", "") or "",
        "architecture": getattr(p, "architecture", "") or "",
        "engineering_notes": getattr(p, "engineering_notes", "") or "",
        "metrics": getattr(p, "metrics", []) or [],
        "challenges": getattr(p, "challenges", []) or [],
        "milestones": getattr(p, "milestones", []) or [],
        "links": getattr(p, "links", {}) or {}
    }

def format_achievement(a: Achievement) -> Dict[str, Any]:
    images = []
    cover_image = None
    for img in sorted(a.images, key=lambda x: x.display_order):
        img_dict = {
            "id": img.id,
            "media_id": img.media_id,
            "caption": img.caption,
            "media_type": getattr(img, "media_type", "EVIDENCE") or "EVIDENCE",
            "display_order": img.display_order,
            "is_cover": img.is_cover,
            "url": img.media.public_url if img.media else "",
            "alt": (img.media.alt_text if img.media and img.media.alt_text else img.caption) or a.title,
            "title": img.media.title if img.media else ""
        }
        images.append(img_dict)
        if img.is_cover and not cover_image:
            cover_image = img_dict["url"]

    if not cover_image and images:
        cover_image = images[0]["url"]

    return {
        "id": a.id,
        "year": a.year,
        "title": a.title,
        "description": a.description or "",
        "badge": a.badge or "🏆",
        "category": a.category or "Milestone",
        "status": a.status or "COMPLETED",
        "organization": a.organization or "",
        "featured": bool(getattr(a, "featured", False)),
        "accomplishment": getattr(a, "accomplishment", "") or "",
        "contribution": getattr(a, "contribution", "") or "",
        "result": getattr(a, "result", "") or "",
        "related_project_slug": getattr(a, "related_project_slug", "") or "",
        "verification_url": getattr(a, "verification_url", "") or "",
        "event_date": getattr(a, "event_date", "") or "",
        "image": cover_image,
        "images": images,
        "display_order": a.display_order
    }

def format_certificate(c: Certificate) -> Dict[str, Any]:
    img_url = c.media.public_url if c.media else ""
    return {
        "id": c.id,
        "title": c.title,
        "issuer": c.issuer,
        "date": c.date or "",
        "category": c.category or "AI/ML",
        "url": c.url or "",
        "description": c.description or "",
        "color": c.color or "cyan",
        "credential_id": getattr(c, "credential_id", "") or "",
        "verification_url": getattr(c, "verification_url", "") or c.url or "",
        "related_skills": getattr(c, "related_skills", []) or [],
        "related_project_slug": getattr(c, "related_project_slug", "") or "",
        "featured": bool(getattr(c, "featured", False)),
        "image": img_url,
        "media": {
            "id": c.media.id,
            "url": img_url,
            "title": c.media.title or "",
            "alt": c.media.alt_text or c.title
        } if c.media else None,
        "display_order": c.display_order
    }

def format_skill_category(s: SkillCategory) -> Dict[str, Any]:
    return {
        "id": s.id,
        "category": s.category,
        "color": s.color or "cyan",
        "icon": s.icon or "⚙️",
        "items": s.items or [],
        "description": getattr(s, "description", "") or "",
        "featured": bool(getattr(s, "featured", False)),
        "display_order": s.display_order
    }

def format_education(e: Education) -> Dict[str, Any]:
    img_url = e.media.public_url if e.media else ""
    courses = e.relevant_courses or []
    rel_projects = getattr(e, "related_projects", []) or []
    rel_skills = getattr(e, "related_skills", []) or []
    return {
        "id": e.id,
        "degree": e.degree,
        "institution": e.institution,
        "duration": e.duration or "",
        "description": e.description or "",
        "relevantCourses": courses,
        "relevant_courses": courses,
        "location": getattr(e, "location", "") or "",
        "status": getattr(e, "status", "COMPLETED") or "COMPLETED",
        "relatedProjects": rel_projects,
        "related_projects": rel_projects,
        "relatedSkills": rel_skills,
        "related_skills": rel_skills,
        "achievements": getattr(e, "achievements", []) or [],
        "featured": bool(getattr(e, "featured", False)),
        "image": img_url,
        "media": {"public_url": img_url} if img_url else None,
        "display_order": e.display_order
    }

def format_experience(ex: Experience) -> Dict[str, Any]:
    img_url = ex.media.public_url if ex.media else ""
    work_perf = getattr(ex, "work_performed", "") or ""
    ext_url = getattr(ex, "external_url", "") or ""
    rel_projects = getattr(ex, "related_projects", []) or []
    rel_skills = getattr(ex, "related_skills", []) or []
    return {
        "id": ex.id,
        "role": ex.role,
        "company": ex.company,
        "duration": ex.duration or "",
        "description": ex.description or "",
        "technologies": ex.technologies or [],
        "tech": ex.technologies or [],
        "location": getattr(ex, "location", "") or "",
        "responsibilities": getattr(ex, "responsibilities", []) or [],
        "workPerformed": work_perf,
        "work_performed": work_perf,
        "results": getattr(ex, "results", "") or "",
        "relatedProjects": rel_projects,
        "related_projects": rel_projects,
        "relatedSkills": rel_skills,
        "related_skills": rel_skills,
        "externalUrl": ext_url,
        "external_url": ext_url,
        "featured": bool(getattr(ex, "featured", False)),
        "image": img_url,
        "media": {"public_url": img_url} if img_url else None,
        "display_order": ex.display_order
    }

@router.get("/portfolio")
def get_full_portfolio(db: Session = Depends(get_db)):
    # 1. Profile
    prof = db.query(Profile).first()
    profile_data = {}
    if prof:
        profile_data = {
            "name": prof.name,
            "title": prof.title,
            "short_intro": prof.short_intro,
            "biography": prof.biography,
            "interests": prof.interests or [],
            "focus_areas": prof.focus_areas or [],
            "social_links": prof.social_links or {}
        }

    # 2. Site Content (Home & Contact)
    home_sec = db.query(SiteContent).filter(SiteContent.section == "home").first()
    home_content = home_sec.data if home_sec else {}

    contact_sec = db.query(SiteContent).filter(SiteContent.section == "contact").first()
    contact_content = contact_sec.data if contact_sec else {}

    # 3. Published Projects (never archived)
    projects = (
        db.query(Project)
        .options(selectinload(Project.images).joinedload(ProjectImage.media))
        .filter(Project.published == True, Project.archived == False)
        .order_by(Project.display_order)
        .all()
    )
    formatted_projects = [format_project(p) for p in projects]

    # 4. Published Achievements (never archived)
    achievements = (
        db.query(Achievement)
        .options(selectinload(Achievement.images).joinedload(AchievementImage.media))
        .filter(Achievement.published == True, Achievement.archived == False)
        .order_by(Achievement.display_order)
        .all()
    )
    formatted_achievements = [format_achievement(a) for a in achievements]

    # 5. Published Certificates (never archived)
    certificates = (
        db.query(Certificate)
        .options(joinedload(Certificate.media))
        .filter(Certificate.published == True, Certificate.archived == False)
        .order_by(Certificate.display_order)
        .all()
    )
    formatted_certs = [format_certificate(c) for c in certificates]

    # 6. Skills (never archived)
    skills = (
        db.query(SkillCategory)
        .filter(SkillCategory.published == True, SkillCategory.archived == False)
        .order_by(SkillCategory.display_order)
        .all()
    )
    formatted_skills = [format_skill_category(s) for s in skills]

    # 7. Education (never archived)
    education = (
        db.query(Education)
        .options(joinedload(Education.media))
        .filter(Education.published == True, Education.archived == False)
        .order_by(Education.display_order)
        .all()
    )
    formatted_edu = [format_education(e) for e in education]

    # 8. Experience (never archived)
    experience = (
        db.query(Experience)
        .options(joinedload(Experience.media))
        .filter(Experience.published == True, Experience.archived == False)
        .order_by(Experience.display_order)
        .all()
    )
    formatted_exp = [format_experience(ex) for ex in experience]

    return {
        "profile": profile_data,
        "home_content": home_content,
        "contact": contact_content,
        "projects": formatted_projects,
        "achievements": formatted_achievements,
        "certificates": formatted_certs,
        "skills": formatted_skills,
        "education": formatted_edu,
        "experience": formatted_exp
    }

@router.get("/profile", response_model=ProfileResponse)
def get_public_profile(db: Session = Depends(get_db)):
    prof = db.query(Profile).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof

@router.get("/projects")
def get_public_projects(db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .options(selectinload(Project.images).joinedload(ProjectImage.media))
        .filter(Project.published == True, Project.archived == False)
        .order_by(Project.display_order)
        .all()
    )
    return [format_project(p) for p in projects]

@router.get("/projects/{slug}")
def get_public_project_by_slug(slug: str, db: Session = Depends(get_db)):
    proj = (
        db.query(Project)
        .options(selectinload(Project.images).joinedload(ProjectImage.media))
        .filter(Project.slug == slug, Project.published == True, Project.archived == False)
        .first()
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return format_project(proj)

@router.get("/achievements")
def get_public_achievements(db: Session = Depends(get_db)):
    achievements = (
        db.query(Achievement)
        .options(selectinload(Achievement.images).joinedload(AchievementImage.media))
        .filter(Achievement.published == True, Achievement.archived == False)
        .order_by(Achievement.display_order)
        .all()
    )
    return [format_achievement(a) for a in achievements]

@router.get("/achievements/{id}")
def get_public_achievement_by_id(id: int, db: Session = Depends(get_db)):
    ach = (
        db.query(Achievement)
        .options(selectinload(Achievement.images).joinedload(AchievementImage.media))
        .filter(Achievement.id == id, Achievement.published == True, Achievement.archived == False)
        .first()
    )
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return format_achievement(ach)

@router.get("/certificates")
def get_public_certificates(db: Session = Depends(get_db)):
    certificates = (
        db.query(Certificate)
        .options(joinedload(Certificate.media))
        .filter(Certificate.published == True, Certificate.archived == False)
        .order_by(Certificate.display_order)
        .all()
    )
    return [format_certificate(c) for c in certificates]

@router.get("/education")
def get_public_education(db: Session = Depends(get_db)):
    education = (
        db.query(Education)
        .options(joinedload(Education.media))
        .filter(Education.published == True, Education.archived == False)
        .order_by(Education.display_order)
        .all()
    )
    return [format_education(e) for e in education]

@router.get("/experience")
def get_public_experience(db: Session = Depends(get_db)):
    experience = (
        db.query(Experience)
        .options(joinedload(Experience.media))
        .filter(Experience.published == True, Experience.archived == False)
        .order_by(Experience.display_order)
        .all()
    )
    return [format_experience(ex) for ex in experience]

@router.get("/skills")
def get_public_skills(db: Session = Depends(get_db)):
    skills = (
        db.query(SkillCategory)
        .filter(SkillCategory.published == True, SkillCategory.archived == False)
        .order_by(SkillCategory.display_order)
        .all()
    )
    return [format_skill_category(s) for s in skills]

@router.get("/contact")
def get_public_contact(db: Session = Depends(get_db)):
    sec = db.query(SiteContent).filter(SiteContent.section == "contact").first()
    return sec.data if sec else {}

