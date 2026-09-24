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

ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"]
}

ALLOWED_VIDEO_MIME_TYPES = {
    "video/mp4": [".mp4", ".m4v"],
    "video/webm": [".webm"],
    "video/quicktime": [".mov"],
    "video/ogg": [".ogv", ".ogg"]
}

ALLOWED_MIME_TYPES = {**ALLOWED_IMAGE_MIME_TYPES, **ALLOWED_VIDEO_MIME_TYPES}

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB
MAX_VIDEO_SIZE = 60 * 1024 * 1024  # 60 MB
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
    elif mime == "image/gif":
        return content.startswith(b"GIF87a") or content.startswith(b"GIF89a")
    elif mime in ("video/mp4", "video/quicktime"):
        return len(content) > 12 and (b"ftyp" in content[:28] or b"moov" in content[:28] or content[:4] in (b"\x00\x00\x00\x18", b"\x00\x00\x00\x1c", b"\x00\x00\x00\x20"))
    elif mime == "video/webm":
        return content.startswith(b"\x1a\x45\xdf\xa3")
    elif mime == "video/ogg":
        return content.startswith(b"OggS")
    return True

def validate_and_save_image(file: UploadFile, title: str = "", alt_text: str = "") -> Tuple[str, str, str, int, Optional[int], Optional[int]]:
    return validate_and_save_media(file, title, alt_text)

def validate_and_save_media(file: UploadFile, title: str = "", alt_text: str = "") -> Tuple[str, str, str, int, Optional[int], Optional[int]]:
    # 1. Normalize and validate MIME header
    mime = (file.content_type or "").lower().strip()
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()

    # Fallback MIME detection by extension if browser passed generic application/octet-stream
    if mime in ("", "application/octet-stream"):
        for m, exts in ALLOWED_MIME_TYPES.items():
            if ext in exts:
                mime = m
                break

    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{mime or ext}'. Supported formats: JPEG, PNG, WEBP, GIF, MP4, WebM, MOV."
        )

    # 2. Validate Extension matches MIME
    valid_exts = ALLOWED_MIME_TYPES.get(mime, [])
    if ext not in valid_exts and not any(ext in exts for exts in ALLOWED_MIME_TYPES.values()):
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' does not match declared media type '{mime}'."
        )

    # 3. Read content and verify size
    content = file.file.read()
    file_size = len(content)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload an empty file.")

    is_video = mime.startswith("video/") or ext in (".mp4", ".m4v", ".webm", ".mov", ".ogv", ".ogg")
    max_size = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE

    if file_size > max_size:
        max_mb = max_size // (1024 * 1024)
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum allowed limit of {max_mb}MB.")

    # 4. Verify binary magic bytes signature
    if not validate_magic_bytes(content, mime):
        raise HTTPException(
            status_code=400,
            detail="File content does not match genuine binary signature for this media format."
        )

    safe_name = sanitize_filename(file.filename or ("upload.mp4" if is_video else "upload.jpg"))
    storage_path = os.path.join(UPLOAD_DIR, safe_name)

    # 5. Video processing: save stream directly without Pillow
    if is_video:
        with open(storage_path, "wb") as f:
            f.write(content)
        public_url = f"/uploads/{safe_name}"
        return safe_name, storage_path, public_url, file_size, None, None

    # 6. Image processing: Pillow inspection & EXIF orientation normalization
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

    # 7. Resize if extraordinarily large (> 2560px) and optimize
    max_dim = 2560
    if width > max_dim or height > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        width, height = img.size

        if ext in (".jpg", ".jpeg") and img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")

        img.save(storage_path, optimize=True, quality=85)
        file_size = os.path.getsize(storage_path)
    else:
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
