from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Application, Professor

router = APIRouter(prefix="/calendar", tags=["calendar"])

@router.get("/events")
async def list_events(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Application, Professor)
        .join(Professor, Application.professor_id == Professor.id)
        .where(Application.user_id == user_id)
    )
    result = await db.execute(stmt)
    
    events = []
    for app, prof in result.all():
        if app.deadline:
            events.append({
                "id": f"{app.id}-deadline",
                "application_id": str(app.id),
                "title": f"Deadline: {prof.name}",
                "date": app.deadline.isoformat(),
                "event_type": "deadline",
                "status": app.status.value
            })
        if app.next_followup_at:
            events.append({
                "id": f"{app.id}-followup",
                "application_id": str(app.id),
                "title": f"Follow-up: {prof.name}",
                "date": app.next_followup_at.isoformat(),
                "event_type": "follow_up",
                "status": app.status.value
            })
    
    # Sort events chronologically
    events.sort(key=lambda x: x["date"])
    return events
