"""
Application routes: list applications for the Kanban board, update
status, and fetch a single application's full detail (resume, SOP,
email, deadlines).
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Application, Professor, CompatibilityScore
from app.schemas.schemas import StatusUpdateRequest
from app.agents.application_tracking_agent import ApplicationTrackingAgent

router = APIRouter(prefix="/applications", tags=["applications"])
tracking_agent = ApplicationTrackingAgent()


@router.get("")
async def list_applications(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    stmt = select(Application, Professor).join(Professor).where(Application.user_id == user_id)
    result = await db.execute(stmt)
    apps = []
    for app, prof in result.all():
        apps.append({
            "id": str(app.id),
            "status": app.status.value,
            "title": f"{prof.name} - {prof.university}",
            "approved": app.approved_by_user
        })
    return apps


@router.get("/candidates")
async def list_candidates(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Application, Professor, CompatibilityScore)
        .join(Professor, Application.professor_id == Professor.id)
        .join(CompatibilityScore, (CompatibilityScore.professor_id == Professor.id) & (CompatibilityScore.user_id == user_id), isouter=True)
        .where(Application.user_id == user_id)
    )
    result = await db.execute(stmt)
    
    candidates = []
    for app, prof, score in result.all():
        candidates.append({
            "professor_name": prof.name,
            "university": prof.university,
            "match_percentage": int(score.match_percentage) if score else app.match_score or 0,
            "deadline": app.deadline.strftime("%Y-%m-%d") if app.deadline else "TBD",
            "status": app.status.value
        })
    return candidates

@router.get("/pipeline-summary")
async def pipeline_summary(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await tracking_agent.pipeline_summary(db, user_id)


@router.patch("/status")
async def update_status(
    payload: StatusUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await tracking_agent.run(user_id, db, payload.application_id, payload.new_status)


@router.post("/{application_id}/approve")
async def approve_application(
    application_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Human-in-the-loop approval checkpoint. Must be called before an
    application containing AI-generated SOP/email/resume content can be
    submitted - enforced server-side in ApplicationTrackingAgent.run, not
    just suggested in the UI."""
    return await tracking_agent.approve(user_id, db, application_id)

from pydantic import BaseModel
class RefineSOPRequest(BaseModel):
    feedback: str

@router.post("/{application_id}/refine-sop")
async def refine_sop(
    application_id: str,
    payload: RefineSOPRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Iterative refinement of SOP based on user feedback."""
    application = await db.get(Application, application_id)
    if not application or application.user_id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application not found")
        
    prof = await db.get(Professor, application.professor_id)
    
    from app.agents.sop_generator_agent import SOPGeneratorAgent
    agent = SOPGeneratorAgent()
    
    # We pass feedback as part of the professor focus structure for the LLM to process
    prof_focus = {"focus": prof.research_areas if prof else [], "user_feedback": payload.feedback}
    
    # Mock academic profile context since we just need to refine
    profile = {"skills": ["AI", "Research"], "note": "Iterative refinement"}
    
    result = await agent.run(user_id, profile, prof_focus, application_id)
    
    # Reset approval status since document changed
    application.approved_by_user = False
    await db.commit()
    
    return {"status": "success", "new_version": result.get("version"), "file_name": result.get("file_name")}
