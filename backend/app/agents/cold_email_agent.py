"""
Cold Email Agent

Generates professional outreach emails that reference the professor's
recent work and clearly explain why the student is a strong fit.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Cold Email Agent inside ResearchOS AI.
Write a concise, professional outreach email (150-220 words) to a professor.
Reference one specific recent paper or focus area, state the student's
relevant background in one sentence, and propose a clear, low-friction next
step. Return strict JSON: {"subject": string, "body": string}."""


class ColdEmailAgent(BaseAgent):
    name = "Cold Email Agent"

    async def run(self, user_id: str, profile: Dict[str, Any], professor_focus: Dict[str, Any]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "drafting", "Creating personalized outreach email")

        user_prompt = f"PROFILE:\n{profile}\n\nPROFESSOR FOCUS:\n{professor_focus}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        await self.emit_activity(user_id, "done", "Outreach email ready", result)
        return result
