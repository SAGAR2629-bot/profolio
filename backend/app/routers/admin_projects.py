from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models.models import AdminUser, Project, ProjectImage, MediaAsset
from ..auth import get_current_admin
from ..schemas.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ProjectImageCreate, ProjectImageResponse, ProjectImageOrderItem
)

router = APIRouter(prefix="/api/admin/projects", tags=["Admin Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_all_projects(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return (
        db.query(Project)
        .options(joinedload(Project.images).joinedload(ProjectImage.media))
        .order_by(Project.display_order)
        .all()
    )

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    # Check duplicate slug
    existing = db.query(Project).filter(Project.slug == req.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Project with slug '{req.slug}' already exists")

    proj = Project(
        title=req.title,
        slug=req.slug,
        short_description=req.short_description or "",
        full_description=req.full_description or "",
        year=req.year or "2025",
        category=req.category or "AI/ML",
        technologies=req.technologies or [],
        status=req.status or "COMPLETED",
        github_url=req.github_url or "",
        demo_url=req.demo_url or "",
        color=req.color or "cyan",
        display_order=req.display_order or 0,
        published=req.published if req.published is not None else True,
        featured=req.featured if req.featured is not None else False,
        archived=req.archived if req.archived is not None else False,
        domain=req.domain or "Robotics / AI",
        platform=req.platform or "Physical & Simulation",
        overview=req.overview or "",
        problem=req.problem or "",
        approach=req.approach or "",
        implementation=req.implementation or "",
        architecture=req.architecture or "",
        engineering_notes=req.engineering_notes or "",
        metrics=req.metrics or [],
        challenges=req.challenges or [],
        milestones=req.milestones or [],
        links=req.links or {}
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.get("/{id}", response_model=ProjectResponse)
def get_project_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = (
        db.query(Project)
        .options(joinedload(Project.images).joinedload(ProjectImage.media))
        .filter(Project.id == id)
        .first()
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.put("/{id}", response_model=ProjectResponse)
def update_project(
    id: int,
    req: ProjectUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if req.slug and req.slug != proj.slug:
        existing = db.query(Project).filter(Project.slug == req.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Project slug '{req.slug}' already in use")
        proj.slug = req.slug

    for field, val in req.model_dump(exclude_unset=True).items():
        if field != "slug":
            setattr(proj, field, val)

    db.commit()
    db.refresh(proj)
    return proj

@router.post("/{id}/duplicate", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def duplicate_project(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = (
        db.query(Project)
        .options(joinedload(Project.images))
        .filter(Project.id == id)
        .first()
    )
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Generate unique slug for duplicated draft
    base_slug = f"{proj.slug}-copy"
    candidate_slug = base_slug
    counter = 1
    while db.query(Project).filter(Project.slug == candidate_slug).first():
        counter += 1
        candidate_slug = f"{base_slug}-{counter}"

    new_proj = Project(
        title=f"{proj.title} (Draft Copy)",
        slug=candidate_slug,
        short_description=proj.short_description,
        full_description=proj.full_description,
        year=proj.year,
        category=proj.category,
        technologies=list(proj.technologies or []),
        status="DRAFT",
        github_url=proj.github_url,
        demo_url=proj.demo_url,
        color=proj.color,
        display_order=proj.display_order + 1,
        published=False,  # Duplicate defaults to draft
        featured=False,
        archived=False,
        domain=proj.domain,
        platform=proj.platform,
        overview=proj.overview,
        problem=proj.problem,
        approach=proj.approach,
        implementation=proj.implementation,
        architecture=proj.architecture,
        engineering_notes=proj.engineering_notes,
        metrics=list(proj.metrics or []),
        challenges=list(proj.challenges or []),
        milestones=list(proj.milestones or []),
        links=dict(proj.links or {})
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    # Duplicate image associations (reuses underlying media_assets without copying physical files)
    for img in proj.images:
        new_img = ProjectImage(
            project_id=new_proj.id,
            media_id=img.media_id,
            caption=img.caption,
            media_type=img.media_type or "OTHER",
            display_order=img.display_order,
            is_cover=img.is_cover
        )
        db.add(new_img)
    db.commit()

    return (
        db.query(Project)
        .options(joinedload(Project.images).joinedload(ProjectImage.media))
        .filter(Project.id == new_proj.id)
        .first()
    )

@router.put("/{id}/archive")
def archive_project(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    proj.archived = not proj.archived
    db.commit()
    return {"id": proj.id, "archived": proj.archived, "title": proj.title}

@router.delete("/{id}")
def delete_project(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project deleted successfully"}

# --- Project Gallery ---
@router.post("/{id}/images", response_model=ProjectImageResponse)
def add_project_image(
    id: int,
    req: ProjectImageCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    media = db.query(MediaAsset).filter(MediaAsset.id == req.media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")

    # If this is marked cover, unmark existing covers
    if req.is_cover:
        db.query(ProjectImage).filter(ProjectImage.project_id == id).update({"is_cover": False})

    # If no other image exists, default this to cover
    is_cover = req.is_cover or (len(proj.images) == 0)

    p_img = ProjectImage(
        project_id=id,
        media_id=req.media_id,
        caption=req.caption or "",
        media_type=req.media_type or "OTHER",
        display_order=req.display_order if req.display_order is not None else len(proj.images),
        is_cover=is_cover
    )
    db.add(p_img)
    db.commit()
    db.refresh(p_img)
    return p_img

@router.put("/{id}/images/reorder")
def reorder_project_images(
    id: int,
    items: List[ProjectImageOrderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    proj = db.query(Project).filter(Project.id == id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    for item in items:
        p_img = db.query(ProjectImage).filter(
            ProjectImage.id == item.image_id,
            ProjectImage.project_id == id
        ).first()
        if p_img:
            p_img.display_order = item.display_order
            if item.media_type is not None:
                p_img.media_type = item.media_type
            if item.caption is not None:
                p_img.caption = item.caption
            if item.is_cover is not None:
                if item.is_cover:
                    # Clear other covers first
                    db.query(ProjectImage).filter(ProjectImage.project_id == id).update({"is_cover": False})
                p_img.is_cover = item.is_cover

    db.commit()
    return {"message": "Project images reordered successfully"}

@router.delete("/{id}/images/{image_id}")
def remove_project_image(
    id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    p_img = db.query(ProjectImage).filter(
        ProjectImage.id == image_id,
        ProjectImage.project_id == id
    ).first()
    if not p_img:
        raise HTTPException(status_code=404, detail="Project image not found")

    was_cover = p_img.is_cover
    db.delete(p_img)
    db.commit()

    # If deleted image was cover, assign cover to next remaining image
    if was_cover:
        remaining = db.query(ProjectImage).filter(ProjectImage.project_id == id).order_by(ProjectImage.display_order).first()
        if remaining:
            remaining.is_cover = True
            db.commit()

    return {"message": "Project image removed successfully"}
