"""
Core relational models for ResearchOS AI.

Covers users, academic profiles, professors, papers, compatibility scores,
applications (Kanban pipeline), documents, agent activity logs, follow-ups,
interview prep sessions, and opportunities.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


def gen_uuid():
    return str(uuid.uuid4())


class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    READY = "ready"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VIEWED = "viewed"
    REPLIED = "replied"
    INTERVIEW = "interview"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class AgentStatus(str, enum.Enum):
    IDLE = "idle"
    SCANNING = "scanning"
    READING = "reading"
    PROCESSING = "processing"
    DRAFTING = "drafting"
    SCHEDULED = "scheduled"
    DONE = "done"
    ERROR = "error"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)  # google | github | none
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("AcademicProfile", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="user")
    documents = relationship("Document", back_populates="user")


class AcademicProfile(Base):
    __tablename__ = "academic_profiles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True)

    cgpa = Column(Float, nullable=True)
    skills = Column(JSON, default=list)
    research_interests = Column(JSON, default=list)
    publications = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    education = Column(JSON, default=list)
    resume_raw_text = Column(Text, nullable=True)
    transcript_raw_text = Column(Text, nullable=True)
    profile_completeness = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Professor(Base):
    __tablename__ = "professors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    university = Column(String, nullable=False)
    department = Column(String, nullable=True)
    research_areas = Column(JSON, default=list)
    lab_url = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    recent_focus_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    papers = relationship("Paper", back_populates="professor")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    professor_id = Column(UUID(as_uuid=False), ForeignKey("professors.id"))
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    keywords = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    open_problems = Column(JSON, default=list)
    discussion_points = Column(JSON, default=list)
    published_at = Column(DateTime, nullable=True)
    embedding_id = Column(String, nullable=True)  # pointer into vector DB

    professor = relationship("Professor", back_populates="papers")


class CompatibilityScore(Base):
    __tablename__ = "compatibility_scores"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    professor_id = Column(UUID(as_uuid=False), ForeignKey("professors.id"))
    match_percentage = Column(Float, nullable=False)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    recommendation = Column(Text, nullable=True)
    success_probability = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    professor_id = Column(UUID(as_uuid=False), ForeignKey("professors.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    match_score = Column(Float, nullable=True)
    tailored_resume_id = Column(UUID(as_uuid=False), nullable=True)
    sop_text = Column(Text, nullable=True)
    cold_email_text = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    last_followup_at = Column(DateTime, nullable=True)
    next_followup_at = Column(DateTime, nullable=True)
    # Human-in-the-loop approval: AI-generated SOP/email/resume artifacts are
    # never auto-submitted. A human must explicitly approve before the
    # Application Tracking Agent will allow a transition into `submitted`.
    requires_human_approval = Column(Boolean, default=True)
    approved_by_user = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    doc_type = Column(String, nullable=False)  # resume | transcript | sop | tailored_resume
    file_name = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    parsed_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")


class AgentActivity(Base):
    __tablename__ = "agent_activity"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    agent_name = Column(String, nullable=False)
    status = Column(Enum(AgentStatus), default=AgentStatus.IDLE)
    message = Column(String, nullable=True)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    program_type = Column(String, nullable=True)  # internship | fellowship | masters | phd
    deadline = Column(DateTime, nullable=True)
    source_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    discovered_at = Column(DateTime, default=datetime.utcnow)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    application_id = Column(UUID(as_uuid=False), ForeignKey("applications.id"))
    lab_questions = Column(JSON, default=list)
    paper_questions = Column(JSON, default=list)
    technical_questions = Column(JSON, default=list)
    hr_questions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailMessage(Base):
    __tablename__ = "email_messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    application_id = Column(UUID(as_uuid=False), ForeignKey("applications.id"), nullable=True)
    professor_id = Column(UUID(as_uuid=False), ForeignKey("professors.id"), nullable=True)
    direction = Column(String, nullable=False) # 'inbound' | 'outbound'
    subject = Column(String, nullable=False)
    body_text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    application = relationship("Application")
    professor = relationship("Professor")
