from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import InterviewSession, Application, Professor

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.get("")
async def list_interviews(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(InterviewSession, Application, Professor)
        .join(Application, InterviewSession.application_id == Application.id)
        .join(Professor, Application.professor_id == Professor.id)
        .where(InterviewSession.user_id == user_id)
    )
    result = await db.execute(stmt)
    
    sessions = []
    for session, app, prof in result.all():
        sessions.append({
            "id": str(session.id),
            "application_id": str(app.id),
            "professor_name": prof.name,
            "university": prof.university,
            "lab_questions": session.lab_questions,
            "paper_questions": session.paper_questions,
            "technical_questions": session.technical_questions,
            "hr_questions": session.hr_questions,
            "created_at": session.created_at.isoformat() if session.created_at else None,
        })
    return sessions
