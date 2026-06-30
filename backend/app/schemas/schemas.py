"""
Pydantic request/response schemas for the API layer.
"""
from typing import Any, Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PipelineRunRequest(BaseModel):
    research_field: str
    professor_name: str
    university: str
    resume_text: str
    transcript_text: Optional[str] = ""


class StatusUpdateRequest(BaseModel):
    application_id: str
    new_status: str


class OpportunityScanRequest(BaseModel):
    interests: list[str]


class StrategyRequest(BaseModel):
    candidates: list[dict[str, Any]]
