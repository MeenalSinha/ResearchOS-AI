"""
Profile routes: document upload (resume/transcript) and triggering the
Profile Intelligence Agent to build the structured academic profile.
"""
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.agents.profile_intelligence_agent import ProfileIntelligenceAgent
from app.services.document_parser import extract_text_from_upload
from app.services.lemma_client import LemmaClient

router = APIRouter(prefix="/profile", tags=["profile"])
profile_agent = ProfileIntelligenceAgent()
lemma = LemmaClient()


@router.post("/upload")
async def upload_documents(
    resume: UploadFile = File(...),
    transcript: UploadFile | None = File(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    resume_bytes = await resume.read()
    resume_text = extract_text_from_upload(resume.filename, resume_bytes)

    transcript_text = ""
    if transcript:
        transcript_bytes = await transcript.read()
        transcript_text = extract_text_from_upload(transcript.filename, transcript_bytes)

    await lemma.upload_document(resume.filename, resume_bytes, resume.content_type or "application/pdf")

    profile = await profile_agent.run(user_id, resume_text, transcript_text)
    return profile
