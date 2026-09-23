from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models.models import (
    AdminUser, SiteContent, Profile, Project, Achievement,
    Certificate, Education, Experience, SkillCategory, MediaAsset
)
from ..auth import get_current_admin
from ..schemas.schemas import (
    ProfileUpdate, ProfileResponse,
    SiteContentUpdate, SiteContentResponse,
    CertificateCreate, CertificateUpdate, CertificateResponse,
    EducationCreate, EducationUpdate, EducationResponse,
    ExperienceCreate, ExperienceUpdate, ExperienceResponse,
    SkillCategoryCreate, SkillCategoryUpdate, SkillCategoryResponse,
    DashboardStatsResponse
)

router = APIRouter(prefix="/api/admin", tags=["Admin Content"])

# --- Dashboard Stats ---
@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    total_projects = db.query(Project).count()
    published_projects = db.query(Project).filter(Project.published == True).count()
    draft_projects = total_projects - published_projects

    total_achievements = db.query(Achievement).count()
    published_achievements = db.query(Achievement).filter(Achievement.published == True).count()
    draft_achievements = total_achievements - published_achievements

    total_certificates = db.query(Certificate).count()
    published_certificates = db.query(Certificate).filter(Certificate.published == True).count()
    draft_certificates = total_certificates - published_certificates

    total_skills = db.query(SkillCategory).count()
    published_skills = db.query(SkillCategory).filter(SkillCategory.published == True).count()
    draft_skills = total_skills - published_skills

    total_experience = db.query(Experience).count()
    published_experience = db.query(Experience).filter(Experience.published == True).count()
    draft_experience = total_experience - published_experience

    total_education = db.query(Education).count()
    published_education = db.query(Education).filter(Education.published == True).count()
    draft_education = total_education - published_education

    total_media_assets = db.query(MediaAsset).count()

    return DashboardStatsResponse(
        total_projects=total_projects,
        published_projects=published_projects,
        draft_projects=draft_projects,
        total_achievements=total_achievements,
        published_achievements=published_achievements,
        draft_achievements=draft_achievements,
        total_certificates=total_certificates,
        published_certificates=published_certificates,
        draft_certificates=draft_certificates,
        total_media_assets=total_media_assets,
        total_skills=total_skills,
        published_skills=published_skills,
        draft_skills=draft_skills,
        total_experience=total_experience,
        published_experience=published_experience,
        draft_experience=draft_experience,
        total_education=total_education,
        published_education=published_education,
        draft_education=draft_education
    )

# --- Profile ---
@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    prof = db.query(Profile).first()
    if not prof:
        prof = Profile(name="Anand Sagar")
        db.add(prof)
        db.commit()
        db.refresh(prof)
    return prof

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    req: ProfileUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    prof = db.query(Profile).first()
    if not prof:
        prof = Profile(name="Anand Sagar")
        db.add(prof)
        db.commit()

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(prof, field, val)

    db.commit()
    db.refresh(prof)
    return prof

# --- Site Content (Home / Contact) ---
@router.get("/content/{section}")
def get_section_content(
    section: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sec = db.query(SiteContent).filter(SiteContent.section == section).first()
    if not sec:
        sec = SiteContent(section=section, data={})
        db.add(sec)
        db.commit()
        db.refresh(sec)
    return {"section": sec.section, "data": sec.data}

@router.put("/content/{section}")
def update_section_content(
    section: str,
    req: SiteContentUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sec = db.query(SiteContent).filter(SiteContent.section == section).first()
    if not sec:
        sec = SiteContent(section=section, data=req.data)
        db.add(sec)
    else:
        sec.data = req.data

    db.commit()
    return {"section": sec.section, "data": sec.data, "message": "Content updated successfully"}

# --- Certificates ---
@router.get("/certificates", response_model=List[CertificateResponse])
def get_certificates(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return (
        db.query(Certificate)
        .options(joinedload(Certificate.media))
        .order_by(Certificate.display_order)
        .all()
    )

@router.post("/certificates", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def create_certificate(
    req: CertificateCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    cert = Certificate(**req.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.post("/certificates/{id}/duplicate", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def duplicate_certificate(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    src = db.query(Certificate).filter(Certificate.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Certificate not found")

    new_cert = Certificate(
        title=f"{src.title} (Copy)",
        issuer=src.issuer,
        date=src.date,
        category=src.category,
        url=src.url,
        description=src.description,
        color=src.color,
        media_id=src.media_id,
        display_order=src.display_order + 1,
        published=False,
        featured=src.featured,
        archived=False,
        credential_id=src.credential_id,
        verification_url=src.verification_url,
        related_skills=src.related_skills,
        related_project_slug=src.related_project_slug
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.put("/certificates/{id}/archive", response_model=CertificateResponse)
def toggle_archive_certificate(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    cert.archived = not bool(cert.archived)
    db.commit()
    db.refresh(cert)
    return cert

@router.put("/certificates/{id}", response_model=CertificateResponse)
def update_certificate(
    id: int,
    req: CertificateUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(cert, field, val)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certificates/{id}")
def delete_certificate(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certificate deleted successfully"}

# --- Skills ---
@router.get("/skills", response_model=List[SkillCategoryResponse])
def get_skills(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return db.query(SkillCategory).order_by(SkillCategory.display_order).all()

@router.post("/skills", response_model=SkillCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_skill_category(
    req: SkillCategoryCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sk = SkillCategory(**req.model_dump())
    db.add(sk)
    db.commit()
    db.refresh(sk)
    return sk

@router.post("/skills/{id}/duplicate", response_model=SkillCategoryResponse, status_code=status.HTTP_201_CREATED)
def duplicate_skill_category(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    src = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Skill category not found")

    new_sk = SkillCategory(
        category=f"{src.category} (Copy)",
        color=src.color,
        icon=src.icon,
        items=src.items,
        display_order=src.display_order + 1,
        published=False,
        featured=src.featured,
        archived=False,
        description=src.description
    )
    db.add(new_sk)
    db.commit()
    db.refresh(new_sk)
    return new_sk

@router.put("/skills/{id}/archive", response_model=SkillCategoryResponse)
def toggle_archive_skill_category(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sk = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not sk:
        raise HTTPException(status_code=404, detail="Skill category not found")
    sk.archived = not bool(sk.archived)
    db.commit()
    db.refresh(sk)
    return sk

@router.put("/skills/{id}", response_model=SkillCategoryResponse)
def update_skill_category(
    id: int,
    req: SkillCategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sk = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not sk:
        raise HTTPException(status_code=404, detail="Skill category not found")
    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(sk, field, val)
    db.commit()
    db.refresh(sk)
    return sk

@router.delete("/skills/{id}")
def delete_skill_category(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    sk = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not sk:
        raise HTTPException(status_code=404, detail="Skill category not found")
    db.delete(sk)
    db.commit()
    return {"message": "Skill category deleted successfully"}

# --- Education ---
@router.get("/education", response_model=List[EducationResponse])
def get_education(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return (
        db.query(Education)
        .options(joinedload(Education.media))
        .order_by(Education.display_order)
        .all()
    )

@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def create_education(
    req: EducationCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    edu = Education(**req.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.post("/education/{id}/duplicate", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def duplicate_education(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    src = db.query(Education).filter(Education.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Education record not found")

    new_edu = Education(
        degree=f"{src.degree} (Copy)",
        institution=src.institution,
        duration=src.duration,
        description=src.description,
        relevant_courses=src.relevant_courses,
        display_order=src.display_order + 1,
        published=False,
        featured=src.featured,
        archived=False,
        location=src.location,
        status=src.status,
        related_projects=src.related_projects,
        related_skills=src.related_skills,
        achievements=src.achievements,
        media_id=src.media_id
    )
    db.add(new_edu)
    db.commit()
    db.refresh(new_edu)
    return new_edu

@router.put("/education/{id}/archive", response_model=EducationResponse)
def toggle_archive_education(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    edu = db.query(Education).filter(Education.id == id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    edu.archived = not bool(edu.archived)
    db.commit()
    db.refresh(edu)
    return edu

@router.put("/education/{id}", response_model=EducationResponse)
def update_education(
    id: int,
    req: EducationUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    edu = db.query(Education).filter(Education.id == id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(edu, field, val)
    db.commit()
    db.refresh(edu)
    return edu

@router.delete("/education/{id}")
def delete_education(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    edu = db.query(Education).filter(Education.id == id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"message": "Education deleted successfully"}

# --- Experience ---
@router.get("/experience", response_model=List[ExperienceResponse])
def get_experience(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return (
        db.query(Experience)
        .options(joinedload(Experience.media))
        .order_by(Experience.display_order)
        .all()
    )

@router.post("/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    req: ExperienceCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    exp = Experience(**req.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.post("/experience/{id}/duplicate", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def duplicate_experience(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    src = db.query(Experience).filter(Experience.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Experience record not found")

    new_exp = Experience(
        role=f"{src.role} (Copy)",
        company=src.company,
        duration=src.duration,
        description=src.description,
        technologies=src.technologies,
        display_order=src.display_order + 1,
        published=False,
        featured=src.featured,
        archived=False,
        location=src.location,
        responsibilities=src.responsibilities,
        work_performed=src.work_performed,
        results=src.results,
        related_projects=src.related_projects,
        related_skills=src.related_skills,
        external_url=src.external_url,
        media_id=src.media_id
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@router.put("/experience/{id}/archive", response_model=ExperienceResponse)
def toggle_archive_experience(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    exp.archived = not bool(exp.archived)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/experience/{id}", response_model=ExperienceResponse)
def update_experience(
    id: int,
    req: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(exp, field, val)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/experience/{id}")
def delete_experience(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience deleted successfully"}

