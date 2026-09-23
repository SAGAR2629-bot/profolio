from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
import datetime

# --- Auth ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    created_at: Optional[datetime.datetime] = None

# --- Media Asset ---
class MediaAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    storage_path: str
    public_url: str
    title: Optional[str] = ""
    alt_text: Optional[str] = ""
    mime_type: str
    file_size: int = 0
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: Optional[datetime.datetime] = None

class MediaAssetUpdate(BaseModel):
    title: Optional[str] = None
    alt_text: Optional[str] = None

# --- Site Content ---
class SiteContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    section: str
    data: Dict[str, Any]
    updated_at: Optional[datetime.datetime] = None
    published_at: Optional[datetime.datetime] = None

class SiteContentUpdate(BaseModel):
    data: Dict[str, Any]

# --- Profile ---
class ProfileImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    media_id: int
    caption: str = ""
    display_order: int = 0
    is_main: bool = False
    media: Optional[MediaAssetResponse] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    short_intro: Optional[str] = None
    biography: Optional[str] = None
    interests: Optional[List[str]] = None
    focus_areas: Optional[List[str]] = None
    social_links: Optional[Dict[str, Any]] = None

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    title: str = ""
    short_intro: str = ""
    biography: str = ""
    interests: List[str] = []
    focus_areas: List[str] = []
    social_links: Dict[str, Any] = {}
    updated_at: Optional[datetime.datetime] = None
    images: List[ProfileImageResponse] = []

# --- Projects ---
class ProjectImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    media_id: int
    caption: str = ""
    media_type: str = "OTHER"
    display_order: int = 0
    is_cover: bool = False
    media: Optional[MediaAssetResponse] = None

class ProjectImageCreate(BaseModel):
    media_id: int
    caption: Optional[str] = ""
    media_type: Optional[str] = "OTHER"
    display_order: Optional[int] = 0
    is_cover: Optional[bool] = False

class ProjectImageOrderItem(BaseModel):
    image_id: int
    display_order: int
    media_type: Optional[str] = None
    caption: Optional[str] = None
    is_cover: Optional[bool] = None

class ProjectMetricItem(BaseModel):
    label: str
    value: str
    description: Optional[str] = ""
    display_order: Optional[int] = 0

class ProjectChallengeItem(BaseModel):
    challenge: str
    solution: str
    display_order: Optional[int] = 0

class ProjectMilestoneItem(BaseModel):
    date: str
    title: str
    description: Optional[str] = ""
    display_order: Optional[int] = 0

class ProjectCreate(BaseModel):
    title: str
    slug: str
    short_description: Optional[str] = ""
    full_description: Optional[str] = ""
    year: Optional[str] = "2025"
    category: Optional[str] = "AI/ML"
    technologies: Optional[List[str]] = []
    status: Optional[str] = "COMPLETED"
    github_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    color: Optional[str] = "cyan"
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False

    domain: Optional[str] = "Robotics / AI"
    platform: Optional[str] = "Physical & Simulation"
    overview: Optional[str] = ""
    problem: Optional[str] = ""
    approach: Optional[str] = ""
    implementation: Optional[str] = ""
    architecture: Optional[str] = ""
    engineering_notes: Optional[str] = ""

    metrics: Optional[List[Dict[str, Any]]] = []
    challenges: Optional[List[Dict[str, Any]]] = []
    milestones: Optional[List[Dict[str, Any]]] = []
    links: Optional[Dict[str, Any]] = {}

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    year: Optional[str] = None
    category: Optional[str] = None
    technologies: Optional[List[str]] = None
    status: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    color: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None

    domain: Optional[str] = None
    platform: Optional[str] = None
    overview: Optional[str] = None
    problem: Optional[str] = None
    approach: Optional[str] = None
    implementation: Optional[str] = None
    architecture: Optional[str] = None
    engineering_notes: Optional[str] = None

    metrics: Optional[List[Dict[str, Any]]] = None
    challenges: Optional[List[Dict[str, Any]]] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    links: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    slug: str
    short_description: str = ""
    full_description: str = ""
    year: str = ""
    category: str = ""
    technologies: List[str] = []
    status: str = "COMPLETED"
    github_url: str = ""
    demo_url: str = ""
    color: str = "cyan"
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False

    domain: str = "Robotics / AI"
    platform: str = "Physical & Simulation"
    overview: str = ""
    problem: str = ""
    approach: str = ""
    implementation: str = ""
    architecture: str = ""
    engineering_notes: str = ""

    metrics: List[Dict[str, Any]] = []
    challenges: List[Dict[str, Any]] = []
    milestones: List[Dict[str, Any]] = []
    links: Dict[str, Any] = {}

    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    images: List[ProjectImageResponse] = []

# --- Achievements ---
class AchievementImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    media_id: int
    caption: str = ""
    media_type: str = "EVIDENCE"
    display_order: int = 0
    is_cover: bool = False
    media: Optional[MediaAssetResponse] = None

class AchievementImageCreate(BaseModel):
    media_id: int
    caption: Optional[str] = ""
    media_type: Optional[str] = "EVIDENCE"
    display_order: Optional[int] = 0
    is_cover: Optional[bool] = False

class AchievementImageOrderItem(BaseModel):
    image_id: int
    display_order: int
    media_type: Optional[str] = None
    caption: Optional[str] = None
    is_cover: Optional[bool] = None

class AchievementCreate(BaseModel):
    year: str
    title: str
    description: Optional[str] = ""
    badge: Optional[str] = "🏆"
    category: Optional[str] = "Milestone"
    status: Optional[str] = "COMPLETED"
    organization: Optional[str] = ""
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False
    accomplishment: Optional[str] = ""
    contribution: Optional[str] = ""
    result: Optional[str] = ""
    related_project_slug: Optional[str] = ""
    verification_url: Optional[str] = ""
    event_date: Optional[str] = ""

class AchievementUpdate(BaseModel):
    year: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    organization: Optional[str] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None
    accomplishment: Optional[str] = None
    contribution: Optional[str] = None
    result: Optional[str] = None
    related_project_slug: Optional[str] = None
    verification_url: Optional[str] = None
    event_date: Optional[str] = None

class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    year: str
    title: str
    description: str = ""
    badge: str = "🏆"
    category: str = "Milestone"
    status: str = "COMPLETED"
    organization: str = ""
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False
    accomplishment: str = ""
    contribution: str = ""
    result: str = ""
    related_project_slug: str = ""
    verification_url: str = ""
    event_date: str = ""
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    images: List[AchievementImageResponse] = []

# --- Certificates ---
class CertificateCreate(BaseModel):
    title: str
    issuer: str
    date: Optional[str] = ""
    category: Optional[str] = "AI/ML"
    url: Optional[str] = ""
    description: Optional[str] = ""
    color: Optional[str] = "cyan"
    media_id: Optional[int] = None
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False
    credential_id: Optional[str] = ""
    verification_url: Optional[str] = ""
    related_skills: Optional[List[str]] = []
    related_project_slug: Optional[str] = ""

class CertificateUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    media_id: Optional[int] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    related_skills: Optional[List[str]] = None
    related_project_slug: Optional[str] = None

class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    issuer: str
    date: str = ""
    category: str = "AI/ML"
    url: str = ""
    description: str = ""
    color: str = "cyan"
    media_id: Optional[int] = None
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False
    credential_id: str = ""
    verification_url: str = ""
    related_skills: List[str] = []
    related_project_slug: str = ""
    media: Optional[MediaAssetResponse] = None

# --- Education ---
class EducationCreate(BaseModel):
    degree: str
    institution: str
    duration: Optional[str] = ""
    description: Optional[str] = ""
    relevant_courses: Optional[List[str]] = []
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False
    location: Optional[str] = ""
    status: Optional[str] = "COMPLETED"
    related_projects: Optional[List[str]] = []
    related_skills: Optional[List[str]] = []
    achievements: Optional[List[str]] = []
    media_id: Optional[int] = None

class EducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    relevant_courses: Optional[List[str]] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None
    location: Optional[str] = None
    status: Optional[str] = None
    related_projects: Optional[List[str]] = None
    related_skills: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    media_id: Optional[int] = None

class EducationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    degree: str
    institution: str
    duration: str = ""
    description: str = ""
    relevant_courses: List[str] = []
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False
    location: str = ""
    status: str = "COMPLETED"
    related_projects: List[str] = []
    related_skills: List[str] = []
    achievements: List[str] = []
    media_id: Optional[int] = None
    media: Optional[MediaAssetResponse] = None

# --- Experience ---
class ExperienceCreate(BaseModel):
    role: str
    company: str
    duration: Optional[str] = ""
    description: Optional[str] = ""
    technologies: Optional[List[str]] = []
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False
    location: Optional[str] = ""
    responsibilities: Optional[List[str]] = []
    work_performed: Optional[str] = ""
    results: Optional[str] = ""
    related_projects: Optional[List[str]] = []
    related_skills: Optional[List[str]] = []
    external_url: Optional[str] = ""
    media_id: Optional[int] = None

class ExperienceUpdate(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None
    location: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    work_performed: Optional[str] = None
    results: Optional[str] = None
    related_projects: Optional[List[str]] = None
    related_skills: Optional[List[str]] = None
    external_url: Optional[str] = None
    media_id: Optional[int] = None

class ExperienceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    company: str
    duration: str = ""
    description: str = ""
    technologies: List[str] = []
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False
    location: str = ""
    responsibilities: List[str] = []
    work_performed: str = ""
    results: str = ""
    related_projects: List[str] = []
    related_skills: List[str] = []
    external_url: str = ""
    media_id: Optional[int] = None
    media: Optional[MediaAssetResponse] = None

# --- Skill Categories ---
class SkillCategoryCreate(BaseModel):
    category: str
    color: Optional[str] = "cyan"
    icon: Optional[str] = "⚙️"
    items: Optional[List[Any]] = []
    display_order: Optional[int] = 0
    published: Optional[bool] = True
    featured: Optional[bool] = False
    archived: Optional[bool] = False
    description: Optional[str] = ""

class SkillCategoryUpdate(BaseModel):
    category: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    items: Optional[List[Any]] = None
    display_order: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    archived: Optional[bool] = None
    description: Optional[str] = None

class SkillCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    color: str = "cyan"
    icon: str = "⚙️"
    items: List[Any] = []
    display_order: int = 0
    published: bool = True
    featured: bool = False
    archived: bool = False
    description: str = ""

# --- Dashboard Stats ---
class DashboardStatsResponse(BaseModel):
    total_projects: int
    published_projects: int
    draft_projects: int
    total_achievements: int
    published_achievements: int
    draft_achievements: int
    total_certificates: int
    published_certificates: int = 0
    draft_certificates: int = 0
    total_media_assets: int
    total_skills: int
    published_skills: int = 0
    draft_skills: int = 0
    total_experience: int
    published_experience: int = 0
    draft_experience: int = 0
    total_education: int
    published_education: int = 0
    draft_education: int = 0
