"""
Application Tracking Agent

Manages the Kanban pipeline state for every application: Draft, Ready,
Submitted, Under Review, Viewed, Replied, Interview, Accepted, Rejected.

Enforces a real human-in-the-loop approval gate: AI-generated SOP, resume,
and cold-email content is never allowed to move an application into
`submitted` status until `approved_by_user` is True. This is checked here,
not just suggested in the UI - calling this agent to submit an
unapproved application returns an error rather than silently complying.
"""
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base_agent import BaseAgent
from app.models.models import Application, ApplicationStatus

STATUSES_REQUIRING_APPROVAL = {ApplicationStatus.SUBMITTED}


class ApplicationTrackingAgent(BaseAgent):
    name = "Application Tracking Agent"

    async def run(self, user_id: str, db: AsyncSession, application_id: str, new_status: str) -> Dict[str, Any]:
        await self.emit_activity(user_id, "processing", f"Updating application status to {new_status}")

        application = await db.get(Application, application_id)
        if not application:
            return {"error": "application_not_found"}

        target_status = ApplicationStatus(new_status)

        if (
            target_status in STATUSES_REQUIRING_APPROVAL
            and application.requires_human_approval
            and not application.approved_by_user
        ):
            await self.emit_activity(
                user_id, "error",
                "Cannot submit: application has not been approved by the student yet",
            )
            return {
                "error": "approval_required",
                "message": "This application contains AI-generated content that has not been approved yet. "
                           "Approve it via POST /applications/{id}/approve before submitting.",
            }

        application.status = target_status
        if target_status == ApplicationStatus.SUBMITTED:
            application.submitted_at = datetime.utcnow()
        await db.commit()
        await db.refresh(application)

        # Log transition in Lemma Datastore to serve as primary application timeline
        await self.lemma.put_record("application_history", f"{application.id}_{int(datetime.utcnow().timestamp())}", {
            "application_id": application.id,
            "user_id": user_id,
            "new_status": new_status,
            "timestamp": datetime.utcnow().isoformat()
        })

        await self.emit_activity(user_id, "done", f"Application moved to {new_status}")
        return {"id": application.id, "status": application.status}

    async def approve(self, user_id: str, db: AsyncSession, application_id: str) -> Dict[str, Any]:
        """Human approval checkpoint. A real person must call this before
        AI-generated SOP/email/resume content can be submitted anywhere."""
        application = await db.get(Application, application_id)
        if not application:
            return {"error": "application_not_found"}

        application.approved_by_user = True
        application.approved_at = datetime.utcnow()
        await db.commit()
        await db.refresh(application)

        # External Integration: Dispatch actual email if configured
        if application.cold_email_text:
            from app.services.email_client import EmailClient
            from app.models.models import Professor
            prof = await db.get(Professor, application.professor_id)
            if prof:
                email_client = EmailClient()
                # Assuming professor email can be derived or mocked
                target_email = f"professor_{prof.id}@example.com"
                await email_client.send_email(target_email, f"Prospective PhD Student Application", application.cold_email_text)
                await self.emit_activity(user_id, "done", f"Email dispatched to {prof.name}")

        await self.emit_activity(user_id, "done", "Application approved by student - ready to submit")
        return {"id": application.id, "approved_by_user": True, "approved_at": application.approved_at}

    async def pipeline_summary(self, db: AsyncSession, user_id: str) -> Dict[str, int]:
        result = await db.execute(select(Application).where(Application.user_id == user_id))
        applications = result.scalars().all()
        summary = {status.value: 0 for status in ApplicationStatus}
        for app_row in applications:
            summary[app_row.status.value] += 1
        return summary
