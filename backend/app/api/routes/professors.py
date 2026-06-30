"""
Professor directory and paper library routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Professor, Paper

router = APIRouter(prefix="/professors", tags=["professors"])


@router.get("")
async def list_professors(db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    result = await db.execute(select(Professor))
    return result.scalars().all()


@router.get("/{professor_id}/papers")
async def list_papers(professor_id: str, db: AsyncSession = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    result = await db.execute(select(Paper).where(Paper.professor_id == professor_id))
    return result.scalars().all()
