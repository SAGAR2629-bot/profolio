import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import AdminUser, MediaAsset
from ..auth import get_current_admin
from ..schemas.schemas import MediaAssetResponse, MediaAssetUpdate
from ..services.media_service import validate_and_save_image, check_media_references

router = APIRouter(prefix="/api/admin/media", tags=["Admin Media"])

@router.post("/upload", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    title: Optional[str] = Form(""),
    alt_text: Optional[str] = Form(""),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    safe_name, storage_path, public_url, file_size, width, height = validate_and_save_image(
        file, title=title or "", alt_text=alt_text or ""
    )

    # Ensure robust mime_type detection
    determined_mime = file.content_type or ""
    if not determined_mime or determined_mime == "application/octet-stream":
        _, ext = os.path.splitext(safe_name)
        ext = ext.lower()
        if ext in (".mp4", ".m4v"):
            determined_mime = "video/mp4"
        elif ext == ".webm":
            determined_mime = "video/webm"
        elif ext == ".mov":
            determined_mime = "video/quicktime"
        elif ext in (".jpg", ".jpeg"):
            determined_mime = "image/jpeg"
        elif ext == ".png":
            determined_mime = "image/png"
        elif ext == ".webp":
            determined_mime = "image/webp"

    media = MediaAsset(
        filename=safe_name,
        storage_path=storage_path,
        public_url=public_url,
        title=title or safe_name,
        alt_text=alt_text or "",
        mime_type=determined_mime or "application/octet-stream",
        file_size=file_size,
        width=width,
        height=height
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@router.get("", response_model=List[MediaAssetResponse])
def get_all_media(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    return db.query(MediaAsset).order_by(MediaAsset.created_at.desc()).all()

@router.get("/{id}/references")
def get_references(
    id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    media = db.query(MediaAsset).filter(MediaAsset.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")
    references = check_media_references(db, id)
    return {"media_id": id, "references": references, "count": len(references)}

@router.put("/{id}", response_model=MediaAssetResponse)
def update_media(
    id: int,
    req: MediaAssetUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    media = db.query(MediaAsset).filter(MediaAsset.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")
    if req.title is not None:
        media.title = req.title
    if req.alt_text is not None:
        media.alt_text = req.alt_text
    db.commit()
    db.refresh(media)
    return media

@router.delete("/{id}")
def delete_media(
    id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    media = db.query(MediaAsset).filter(MediaAsset.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")

    references = check_media_references(db, id)
    if references and not force:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Cannot delete media asset because it is actively referenced in content.",
                "references": references
            }
        )

    # Safely remove file on disk
    if os.path.exists(media.storage_path):
        try:
            os.remove(media.storage_path)
        except Exception as e:
            pass

    db.delete(media)
    db.commit()
    return {"message": "Media asset deleted successfully"}
