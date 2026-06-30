"""
Dashboard and analytics aggregation routes powering the Home Overview
and Analytics modules (applications sent, response rate, average match
score, interviews, acceptance rate, upcoming deadlines, etc.).
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Application, ApplicationStatus, CompatibilityScore, Professor

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def dashboard_summary(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    total_apps = await db.scalar(
        select(func.count()).select_from(Application).where(Application.user_id == user_id)
    )
    interviews = await db.scalar(
        select(func.count()).select_from(Application).where(
            Application.user_id == user_id, Application.status == ApplicationStatus.INTERVIEW
        )
    )
    replied = await db.scalar(
        select(func.count()).select_from(Application).where(
            Application.user_id == user_id, Application.status.in_([
                ApplicationStatus.REPLIED, ApplicationStatus.INTERVIEW,
                ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED,
            ])
        )
    )
    accepted = await db.scalar(
        select(func.count()).select_from(Application).where(
            Application.user_id == user_id, Application.status == ApplicationStatus.ACCEPTED
        )
    )
    avg_match = await db.scalar(
        select(func.avg(CompatibilityScore.match_percentage)).where(CompatibilityScore.user_id == user_id)
    )

    total_apps = total_apps or 0
    response_rate = round((replied / total_apps) * 100, 1) if total_apps else 0.0
    acceptance_rate = round((accepted / total_apps) * 100, 1) if total_apps else 0.0

    return {
        "applications_sent": total_apps,
        "responses": replied or 0,
        "response_rate": response_rate,
        "interviews": interviews or 0,
        "acceptance_rate": acceptance_rate,
        "average_match_score": round(avg_match, 1) if avg_match else 0.0,
    }


@router.get("/recommendations")
async def dashboard_recommendations(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    """Fetch top matching professors for the user"""
    stmt = (
        select(CompatibilityScore, Professor)
        .join(Professor, CompatibilityScore.professor_id == Professor.id)
        .where(CompatibilityScore.user_id == user_id)
        .order_by(CompatibilityScore.match_percentage.desc())
        .limit(3)
    )
    results = await db.execute(stmt)
    
    recommendations = []
    for score, prof in results.all():
        recommendations.append({
            "university": prof.university,
            "professor": prof.name,
            "field": prof.department or "Research",
            "match": int(score.match_percentage),
            "imageSrc": prof.profile_image_url,
            "recommendation": score.recommendation,
            "strengths": score.strengths,
            "weaknesses": score.weaknesses
        })
        
    return recommendations

@router.get("/tasks")
async def dashboard_tasks(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    """Fetch upcoming tasks based on applications and interviews"""
    # Just returning some placeholder items linked to their data for now if they have applications
    stmt = select(Application, Professor).join(Professor).where(Application.user_id == user_id).order_by(Application.updated_at.desc()).limit(3)
    results = await db.execute(stmt)
    
    tasks = []
    for app, prof in results.all():
        if app.status == ApplicationStatus.DRAFT:
            tasks.append({
                "icon": "file",
                "title": f"Complete draft for {prof.name}",
                "due": "Action required"
            })
        elif app.status == ApplicationStatus.INTERVIEW:
            tasks.append({
                "icon": "calendar",
                "title": f"Prepare for interview with {prof.name}",
                "due": "Upcoming"
            })
        else:
            tasks.append({
                "icon": "mail",
                "title": f"Follow up with {prof.name}",
                "due": "Pending"
            })
            
    return tasks
