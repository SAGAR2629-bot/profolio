from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models.models import AdminUser, Achievement, AchievementImage, MediaAsset
from ..auth import get_current_admin
from ..schemas.schemas import (
    AchievementCreate, AchievementUpdate, AchievementResponse,
    AchievementImageCreate, AchievementImageResponse, AchievementImageOrderItem
)

router = APIRouter(prefix="/api/admin/achievements", tags=["Admin Achievements"])

@router.get("", response_model=List[AchievementResponse])
def get_all_achievements(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return (
        db.query(Achievement)
        .options(joinedload(Achievement.images).joinedload(AchievementImage.media))
        .order_by(Achievement.display_order)
        .all()
    )

@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    req: AchievementCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = Achievement(
        year=req.year,
        title=req.title,
        description=req.description or "",
        badge=req.badge or "🏆",
        category=req.category or "Milestone",
        status=req.status or "COMPLETED",
        organization=req.organization or "",
        display_order=req.display_order or 0,
        published=req.published if req.published is not None else True,
        featured=bool(req.featured),
        archived=bool(req.archived),
        accomplishment=req.accomplishment or "",
        contribution=req.contribution or "",
        result=req.result or "",
        related_project_slug=req.related_project_slug or "",
        verification_url=req.verification_url or "",
        event_date=req.event_date or ""
    )
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach

@router.post("/{id}/duplicate", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def duplicate_achievement(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    src = db.query(Achievement).options(joinedload(Achievement.images)).filter(Achievement.id == id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Achievement not found")

    new_ach = Achievement(
        year=src.year,
        title=f"{src.title} (Copy)",
        description=src.description,
        badge=src.badge,
        category=src.category,
        status=src.status,
        organization=src.organization,
        display_order=src.display_order + 1,
        published=False,  # default duplicated to draft
        featured=src.featured,
        archived=False,
        accomplishment=src.accomplishment,
        contribution=src.contribution,
        result=src.result,
        related_project_slug=src.related_project_slug,
        verification_url=src.verification_url,
        event_date=src.event_date
    )
    db.add(new_ach)
    db.commit()
    db.refresh(new_ach)

    # Copy images
    for img in src.images:
        copy_img = AchievementImage(
            achievement_id=new_ach.id,
            media_id=img.media_id,
            caption=img.caption,
            media_type=getattr(img, "media_type", "EVIDENCE") or "EVIDENCE",
            display_order=img.display_order,
            is_cover=img.is_cover
        )
        db.add(copy_img)
    db.commit()
    db.refresh(new_ach)
    return new_ach

@router.put("/{id}/archive", response_model=AchievementResponse)
def toggle_archive_achievement(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    ach.archived = not bool(ach.archived)
    db.commit()
    db.refresh(ach)
    return ach

@router.get("/{id}", response_model=AchievementResponse)
def get_achievement_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = (
        db.query(Achievement)
        .options(joinedload(Achievement.images).joinedload(AchievementImage.media))
        .filter(Achievement.id == id)
        .first()
    )
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return ach

@router.put("/{id}", response_model=AchievementResponse)
def update_achievement(
    id: int,
    req: AchievementUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(ach, field, val)

    db.commit()
    db.refresh(ach)
    return ach

@router.delete("/{id}")
def delete_achievement(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    db.delete(ach)
    db.commit()
    return {"message": "Achievement deleted successfully"}

# --- Achievement Gallery ---
@router.post("/{id}/images", response_model=AchievementImageResponse)
def add_achievement_image(
    id: int,
    req: AchievementImageCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    media = db.query(MediaAsset).filter(MediaAsset.id == req.media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")

    if req.is_cover:
        db.query(AchievementImage).filter(AchievementImage.achievement_id == id).update({"is_cover": False})

    is_cover = req.is_cover or (len(ach.images) == 0)

    a_img = AchievementImage(
        achievement_id=id,
        media_id=req.media_id,
        caption=req.caption or "",
        media_type=req.media_type or "EVIDENCE",
        display_order=req.display_order if req.display_order is not None else len(ach.images),
        is_cover=is_cover
    )
    db.add(a_img)
    db.commit()
    db.refresh(a_img)
    return a_img

@router.put("/{id}/images/reorder")
def reorder_achievement_images(
    id: int,
    items: List[AchievementImageOrderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    for item in items:
        a_img = db.query(AchievementImage).filter(
            AchievementImage.id == item.image_id,
            AchievementImage.achievement_id == id
        ).first()
        if a_img:
            a_img.display_order = item.display_order
            if item.is_cover is not None:
                if item.is_cover:
                    db.query(AchievementImage).filter(AchievementImage.achievement_id == id).update({"is_cover": False})
                a_img.is_cover = item.is_cover

    db.commit()
    return {"message": "Achievement images reordered successfully"}

@router.delete("/{id}/images/{image_id}")
def remove_achievement_image(
    id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    a_img = db.query(AchievementImage).filter(
        AchievementImage.id == image_id,
        AchievementImage.achievement_id == id
    ).first()
    if not a_img:
        raise HTTPException(status_code=404, detail="Achievement image not found")

    was_cover = a_img.is_cover
    db.delete(a_img)
    db.commit()

    if was_cover:
        remaining = db.query(AchievementImage).filter(AchievementImage.achievement_id == id).order_by(AchievementImage.display_order).first()
        if remaining:
            remaining.is_cover = True
            db.commit()

    return {"message": "Achievement image removed successfully"}
