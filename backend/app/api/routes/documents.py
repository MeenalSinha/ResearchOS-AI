from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("")
async def list_documents(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    stmt = select(Document).where(Document.user_id == user_id)
    result = await db.execute(stmt)
    docs = result.scalars().all()
    
    documents = []
    for doc in docs:
        documents.append({
            "id": str(doc.id),
            "doc_type": doc.doc_type,
            "file_name": doc.file_name,
            "storage_path": doc.storage_path,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "excerpt": doc.parsed_text[:200] + "..." if doc.parsed_text and len(doc.parsed_text) > 200 else doc.parsed_text
        })
    return documents
