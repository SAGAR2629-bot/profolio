import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from ..database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    public_url = Column(String(500), nullable=False)
    title = Column(String(255), default="")
    alt_text = Column(String(255), default="")
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, default=0)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    project_images = relationship("ProjectImage", back_populates="media", cascade="all, delete-orphan")
    achievement_images = relationship("AchievementImage", back_populates="media", cascade="all, delete-orphan")
    profile_images = relationship("ProfileImage", back_populates="media", cascade="all, delete-orphan")


class SiteContent(Base):
    __tablename__ = "site_contents"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(100), unique=True, index=True, nullable=False)  # 'home', 'contact', etc.
    data = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    published_at = Column(DateTime(timezone=True), nullable=True)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    title = Column(String(300), default="")
    short_intro = Column(Text, default="")
    biography = Column(Text, default="")
    interests = Column(JSON, default=list)
    focus_areas = Column(JSON, default=list)
    social_links = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    images = relationship("ProfileImage", back_populates="profile", order_by="ProfileImage.display_order", cascade="all, delete-orphan")


class ProfileImage(Base):
    __tablename__ = "profile_images"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    caption = Column(String(255), default="")
    display_order = Column(Integer, default=0)
    is_main = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="images")
    media = relationship("MediaAsset", back_populates="profile_images")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(Text, default="")
    full_description = Column(Text, default="")
    year = Column(String(20), default="2025")
    category = Column(String(100), default="AI/ML")
    technologies = Column(JSON, default=list)
    status = Column(String(50), default="COMPLETED")
    github_url = Column(String(500), default="")
    demo_url = Column(String(500), default="")
    color = Column(String(50), default="cyan")
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)

    # Detailed Case Study Fields
    domain = Column(String(100), default="Robotics / AI")
    platform = Column(String(100), default="Physical & Simulation")
    overview = Column(Text, default="")
    problem = Column(Text, default="")
    approach = Column(Text, default="")
    implementation = Column(Text, default="")
    architecture = Column(Text, default="")
    engineering_notes = Column(Text, default="")

    # Structured telemetry & records
    metrics = Column(JSON, default=list)
    challenges = Column(JSON, default=list)
    milestones = Column(JSON, default=list)
    links = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    images = relationship("ProjectImage", back_populates="project", order_by="ProjectImage.display_order", cascade="all, delete-orphan")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    caption = Column(String(255), default="")
    media_type = Column(String(50), default="OTHER")
    display_order = Column(Integer, default=0)
    is_cover = Column(Boolean, default=False)

    project = relationship("Project", back_populates="images")
    media = relationship("MediaAsset", back_populates="project_images")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(20), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    badge = Column(String(50), default="🏆")
    category = Column(String(100), default="Milestone")
    status = Column(String(50), default="COMPLETED")
    organization = Column(String(200), default="")
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)

    # Detailed Log & Evidence Fields
    accomplishment = Column(Text, default="")
    contribution = Column(Text, default="")
    result = Column(Text, default="")
    related_project_slug = Column(String(255), default="")
    verification_url = Column(String(500), default="")
    event_date = Column(String(100), default="")

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    images = relationship("AchievementImage", back_populates="achievement", order_by="AchievementImage.display_order", cascade="all, delete-orphan")


class AchievementImage(Base):
    __tablename__ = "achievement_images"

    id = Column(Integer, primary_key=True, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    caption = Column(String(255), default="")
    media_type = Column(String(50), default="EVIDENCE")
    display_order = Column(Integer, default=0)
    is_cover = Column(Boolean, default=False)

    achievement = relationship("Achievement", back_populates="images")
    media = relationship("MediaAsset", back_populates="achievement_images")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    date = Column(String(50), default="")
    category = Column(String(100), default="AI/ML")
    url = Column(String(500), default="")
    description = Column(Text, default="")
    color = Column(String(50), default="cyan")
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True)
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)

    # Detailed Credential Fields
    credential_id = Column(String(255), default="")
    verification_url = Column(String(500), default="")
    related_skills = Column(JSON, default=list)
    related_project_slug = Column(String(255), default="")

    media = relationship("MediaAsset", foreign_keys=[media_id])


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    degree = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=False)
    duration = Column(String(100), default="")
    description = Column(Text, default="")
    relevant_courses = Column(JSON, default=list)
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)

    # Detailed Academic Fields
    location = Column(String(200), default="")
    status = Column(String(50), default="COMPLETED")
    related_projects = Column(JSON, default=list)
    related_skills = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True)

    media = relationship("MediaAsset", foreign_keys=[media_id])


class Experience(Base):
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    duration = Column(String(100), default="")
    description = Column(Text, default="")
    technologies = Column(JSON, default=list)
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)

    # Detailed Field Record Fields
    location = Column(String(200), default="")
    responsibilities = Column(JSON, default=list)
    work_performed = Column(Text, default="")
    results = Column(Text, default="")
    related_projects = Column(JSON, default=list)
    related_skills = Column(JSON, default=list)
    external_url = Column(String(500), default="")
    media_id = Column(Integer, ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True)

    media = relationship("MediaAsset", foreign_keys=[media_id])


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    color = Column(String(50), default="cyan")
    icon = Column(String(50), default="⚙️")
    items = Column(JSON, default=list)
    display_order = Column(Integer, default=0)
    published = Column(Boolean, default=True, index=True)
    featured = Column(Boolean, default=False, index=True)
    archived = Column(Boolean, default=False, index=True)
    description = Column(Text, default="")

