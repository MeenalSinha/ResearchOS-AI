"""
Follow-up Agent

Recommends follow-up timing based on submission date, professor
responsiveness norms, and program deadlines, then drafts a reminder
email when a follow-up is due.
"""
from datetime import datetime, timedelta
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Follow-up Agent inside ResearchOS AI.
Given days since submission and prior email context, decide if a follow-up
is appropriate and draft one if so. Return strict JSON:
{"should_follow_up": bool, "recommended_date": "YYYY-MM-DD", "draft_email": string}.
Be polite, brief, and non-pushy."""


class FollowUpAgent(BaseAgent):
    name = "Follow-up Agent"

    async def run(self, user_id: str, days_since_submission: int, original_email: str) -> Dict[str, Any]:
        await self.emit_activity(user_id, "scheduled", "Evaluating follow-up timing")

        user_prompt = f"Days since submission: {days_since_submission}\nOriginal email:\n{original_email}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        if "recommended_date" not in result:
            result["recommended_date"] = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

        await self.emit_activity(user_id, "done", "Follow-up plan ready", result)
        return result
