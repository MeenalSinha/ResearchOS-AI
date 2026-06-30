"""
Scheduled background tasks that make ResearchOS AI feel autonomous
rather than request-driven.
"""
import asyncio

from app.workers.celery_app import celery_app
from app.services.agent_orchestrator import orchestrator


@celery_app.task(name="app.workers.tasks.scan_opportunities_task")
def scan_opportunities_task(user_id: str, interests: list[str]):
    asyncio.run(orchestrator.run_opportunity_scan(user_id, interests))


@celery_app.task(name="app.workers.tasks.check_followups_task")
def check_followups_task():
    """Iterates submitted applications and triggers the Follow-up Agent
    where a follow-up is due. In production this queries the applications
    table for status=submitted and last_followup_at thresholds."""
    pass
