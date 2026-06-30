"""
Interview Coach Agent

Generates lab-specific questions, paper discussion prompts, technical
questions, and HR/fit questions, plus a mock interview script.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Interview Coach Agent inside ResearchOS AI.
Given a professor's research focus and the student's profile, generate
interview preparation material. Return strict JSON: {"lab_questions": [],
"paper_questions": [], "technical_questions": [], "hr_questions": [],
"mock_interview_script": string}."""


class InterviewCoachAgent(BaseAgent):
    name = "Interview Coach Agent"

    async def run(self, user_id: str, profile: Dict[str, Any], professor_focus: Dict[str, Any]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "processing", "Preparing interview questions")

        user_prompt = f"PROFILE:\n{profile}\n\nPROFESSOR FOCUS:\n{professor_focus}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        await self.emit_activity(user_id, "done", "Interview prep ready", result)
        return result
