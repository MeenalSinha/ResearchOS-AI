from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime, timedelta

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import EmailMessage, Professor

router = APIRouter(tags=["messages"])

@router.get("")
async def get_messages(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    """
    Returns all email messages for the user.
    """
    # Check if there are any messages. If not, auto-seed some for demo purposes
    stmt = select(EmailMessage).where(EmailMessage.user_id == user_id).order_by(EmailMessage.timestamp.desc())
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    if not messages:
        # Generate some mock messages
        prof_result = await db.execute(select(Professor).limit(2))
        profs = prof_result.scalars().all()
        
        if profs:
            msg1 = EmailMessage(
                user_id=user_id,
                professor_id=profs[0].id,
                direction="outbound",
                subject="Inquiry regarding PhD opportunities in your lab",
                body_text=f"Dear Dr. {profs[0].name},\n\nI am writing to express my interest in joining your research group for a PhD next fall. I have read your recent papers and found them fascinating. Attached is my CV for your review.\n\nBest regards,\nApplicant",
                is_read=True,
                timestamp=datetime.utcnow() - timedelta(days=2)
            )
            msg2 = EmailMessage(
                user_id=user_id,
                professor_id=profs[0].id,
                direction="inbound",
                subject="Re: Inquiry regarding PhD opportunities in your lab",
                body_text=f"Hi,\n\nThank you for reaching out. We do have openings next year. Could you send me a short summary of your past research projects?\n\nBest,\n{profs[0].name}",
                is_read=False,
                timestamp=datetime.utcnow() - timedelta(hours=12)
            )
            
            db.add_all([msg1, msg2])
            
            if len(profs) > 1:
                msg3 = EmailMessage(
                    user_id=user_id,
                    professor_id=profs[1].id,
                    direction="outbound",
                    subject="Interest in your recent work on AI Agents",
                    body_text=f"Dear Prof. {profs[1].name},\n\nI really enjoyed your recent talk. Are you taking on new master's students this year?\n\nThanks,\nApplicant",
                    is_read=True,
                    timestamp=datetime.utcnow() - timedelta(days=5)
                )
                db.add(msg3)
                
            await db.commit()
            
            # Re-fetch
            result = await db.execute(stmt)
            messages = result.scalars().all()

    response = []
    for m in messages:
        prof_name = "Unknown Professor"
        prof_image = None
        if m.professor_id:
            prof_result = await db.execute(select(Professor).where(Professor.id == m.professor_id))
            prof = prof_result.scalar_one_or_none()
            if prof:
                prof_name = prof.name
                prof_image = prof.profile_image_url
                
        response.append({
            "id": m.id,
            "application_id": m.application_id,
            "professor_id": m.professor_id,
            "professor_name": prof_name,
            "professor_image": prof_image,
            "direction": m.direction,
            "subject": m.subject,
            "body_text": m.body_text,
            "is_read": m.is_read,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        })
        
    return response
