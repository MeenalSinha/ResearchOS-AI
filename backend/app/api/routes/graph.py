from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Application, Professor, Paper, User

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("")
async def get_graph(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    # 1. Fetch user
    user_stmt = select(User).where(User.id == user_id)
    user = (await db.execute(user_stmt)).scalars().first()
    
    # 2. Fetch applications + professors
    app_stmt = (
        select(Application, Professor)
        .join(Professor, Application.professor_id == Professor.id)
        .where(Application.user_id == user_id)
    )
    app_result = await db.execute(app_stmt)
    
    nodes = []
    edges = []
    
    # Add User Node
    user_node_id = f"user_{user_id}"
    nodes.append({
        "id": user_node_id,
        "label": user.full_name if user else "You",
        "type": "user",
        "color": "#6366f1"
    })
    
    professors = set()
    for app, prof in app_result.all():
        prof_node_id = f"prof_{prof.id}"
        if prof_node_id not in professors:
            professors.add(prof_node_id)
            nodes.append({
                "id": prof_node_id,
                "label": prof.name,
                "type": "professor",
                "color": "#10b981",
                "subtitle": prof.university
            })
            
            # Edge from user to professor (Application)
            edges.append({
                "source": user_node_id,
                "target": prof_node_id,
                "label": app.status.value,
                "type": "applied"
            })
            
    # 3. Fetch papers for these professors
    if professors:
        # Extract raw UUIDs
        prof_ids = [pid.replace("prof_", "") for pid in professors]
        paper_stmt = select(Paper).where(Paper.professor_id.in_(prof_ids))
        paper_result = await db.execute(paper_stmt)
        papers = paper_result.scalars().all()
        
        for paper in papers:
            paper_node_id = f"paper_{paper.id}"
            nodes.append({
                "id": paper_node_id,
                "label": paper.title[:30] + "..." if len(paper.title) > 30 else paper.title,
                "type": "paper",
                "color": "#f59e0b",
                "subtitle": "Paper"
            })
            
            # Edge from professor to paper
            edges.append({
                "source": f"prof_{paper.professor_id}",
                "target": paper_node_id,
                "label": "authored",
                "type": "authored"
            })

    return {"nodes": nodes, "edges": edges}
