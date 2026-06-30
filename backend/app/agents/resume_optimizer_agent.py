"""
Resume Optimizer Agent

Creates a customized resume for a specific application by reordering
relevant experience, surfacing matching skills, and optimizing keywords
against the target professor's research focus.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Resume Optimizer Agent inside ResearchOS AI.
Given a base academic profile and a target professor's research focus,
produce a tailored resume. Return strict JSON: {"sections": [{"heading",
"bullets": []}], "keywords_added": [], "reordering_rationale": string}.
Never fabricate experience the student does not have; only reorder, emphasize,
and rephrase truthful content."""


class ResumeOptimizerAgent(BaseAgent):
    name = "Resume Optimizer Agent"

    async def run(self, user_id: str, profile: Dict[str, Any], professor_focus: Dict[str, Any]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "drafting", "Tailoring resume for this application")

        user_prompt = f"PROFILE:\n{profile}\n\nTARGET FOCUS:\n{professor_focus}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        await self.emit_activity(user_id, "done", "Tailored resume ready", result)
        return result
