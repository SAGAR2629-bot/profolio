import os
import uuid
from typing import Tuple, List, Dict, Any
from fastapi import UploadFile, HTTPException
from PIL import Image, ImageOps
from sqlalchemy.orm import Session
from ..models.models import (
    MediaAsset, ProfileImage, ProjectImage, AchievementImage,
    Certificate, Education, Experience, Project, Achievement
)

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"]
}

MAGIC_BYTES = {
    "image/jpeg": [b"\xFF\xD8\xFF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"]  # and b"WEBP" at offset 8
}

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB
Image.MAX_IMAGE_PIXELS = 25_000_000  # Protect against decompression bomb attacks
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))

os.makedirs(UPLOAD_DIR, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    # Strip any directory components or path traversal characters
    clean_base = os.path.basename(filename).replace("\\", "/")
    clean_base = os.path.basename(clean_base)
    base, ext = os.path.splitext(clean_base)
    safe_base = "".join(c for c in base if c.isalnum() or c in ("-", "_")).strip()
    if not safe_base:
        safe_base = "upload"
    return f"{safe_base}_{uuid.uuid4().hex[:8]}{ext.lower()}"

def validate_magic_bytes(content: bytes, mime: str) -> bool:
    if mime == "image/jpeg":
        return content.startswith(b"\xFF\xD8\xFF")
    elif mime == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    elif mime == "image/webp":
        return content.startswith(b"RIFF") and len(content) > 12 and content[8:12] == b"WEBP"
    return False

def validate_and_save_image(file: UploadFile, title: str = "", alt_text: str = "") -> Tuple[str, str, str, int, int, int]:
    # 1. Validate MIME header
    mime = file.content_type or ""
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file MIME type: '{mime}'. Supported formats: JPEG, PNG, WEBP."
        )

    # 2. Validate Extension
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in ALLOWED_MIME_TYPES.get(mime, []):
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' does not match declared MIME type '{mime}'."
        )

    # 3. Read content and verify size
    content = file.file.read()
    file_size = len(content)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload an empty file.")
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit of 15MB.")

    # 4. Verify binary magic bytes signature
    if not validate_magic_bytes(content, mime):
        raise HTTPException(
            status_code=400,
            detail="File content does not match genuine image binary signature. Upload rejected."
        )

    # 5. Pillow inspection & EXIF orientation normalization
    try:
        from io import BytesIO
        img = Image.open(BytesIO(content))
        img.verify()

        # Re-open after verify() to inspect and transform
        img = Image.open(BytesIO(content))
        img = ImageOps.exif_transpose(img)
        width, height = img.size
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupted or invalid image data: {str(e)}")

    # 6. Generate secure server-side filename
    safe_name = sanitize_filename(file.filename or "upload.jpg")
    storage_path = os.path.join(UPLOAD_DIR, safe_name)

    # 7. Resize if extraordinarily large (> 2560px) and optimize
    max_dim = 2560
    if width > max_dim or height > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        width, height = img.size

        # Incompatible color modes for JPEG conversion (e.g. RGBA -> RGB)
        if ext in (".jpg", ".jpeg") and img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")

        img.save(storage_path, optimize=True, quality=85)
        file_size = os.path.getsize(storage_path)
    else:
        # If saving as JPEG with alpha channel, convert to RGB
        if ext in (".jpg", ".jpeg") and img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")
            img.save(storage_path, optimize=True, quality=88)
            file_size = os.path.getsize(storage_path)
        else:
            with open(storage_path, "wb") as f:
                f.write(content)

    public_url = f"/uploads/{safe_name}"
    return safe_name, storage_path, public_url, file_size, width, height

def check_media_references(db: Session, media_id: int) -> List[Dict[str, Any]]:
    """Checks if a media asset is referenced anywhere across all 6 registries or profile."""
    references = []

    # 1. Project images
    p_imgs = db.query(ProjectImage).filter(ProjectImage.media_id == media_id).all()
    for pi in p_imgs:
        proj = db.query(Project).filter(Project.id == pi.project_id).first()
        proj_title = proj.title if proj else f"Project #{pi.project_id}"
        references.append({
            "type": "Project",
            "id": pi.project_id,
            "name": proj_title,
            "role": "Cover Image" if pi.is_cover else "Gallery Image"
        })

    # 2. Achievement images
    a_imgs = db.query(AchievementImage).filter(AchievementImage.media_id == media_id).all()
    for ai in a_imgs:
        ach = db.query(Achievement).filter(Achievement.id == ai.achievement_id).first()
        ach_title = ach.title if ach else f"Achievement #{ai.achievement_id}"
        references.append({
            "type": "Achievement",
            "id": ai.achievement_id,
            "name": ach_title,
            "role": "Cover Image" if ai.is_cover else "Gallery Image"
        })

    # 3. Certificates
    certs = db.query(Certificate).filter(Certificate.media_id == media_id).all()
    for c in certs:
        references.append({
            "type": "Certificate",
            "id": c.id,
            "name": c.title,
            "role": "Certificate Document"
        })

    # 4. Education
    edu_records = db.query(Education).filter(Education.media_id == media_id).all()
    for edu in edu_records:
        references.append({
            "type": "Education",
            "id": edu.id,
            "name": edu.degree,
            "role": "Academic Document / Verification"
        })

    # 5. Field Experience
    exp_records = db.query(Experience).filter(Experience.media_id == media_id).all()
    for exp in exp_records:
        references.append({
            "type": "Experience",
            "id": exp.id,
            "name": f"{exp.role} at {exp.company}",
            "role": "Supporting Field Evidence"
        })

    # 6. Profile avatar / media
    prof_imgs = db.query(ProfileImage).filter(ProfileImage.media_id == media_id).all()
    for pri in prof_imgs:
        references.append({
            "type": "Profile",
            "id": pri.profile_id,
            "name": "User Profile",
            "role": "Main Avatar" if pri.is_main else "Gallery Image"
        })

    return references
