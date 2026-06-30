"""
Celery app for background/scheduled agent work: the Opportunity Watch
Agent scan and Follow-up Agent checks run periodically rather than on
direct user request, so the platform feels autonomous.
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("researchos", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.beat_schedule = {
    "scan-opportunities-daily": {
        "task": "app.workers.tasks.scan_opportunities_task",
        "schedule": crontab(hour=6, minute=0),
    },
    "check-followups-daily": {
        "task": "app.workers.tasks.check_followups_task",
        "schedule": crontab(hour=8, minute=0),
    },
}
