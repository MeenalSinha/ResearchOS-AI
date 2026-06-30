"""
Profile Intelligence Agent

Parses resume and transcript text (already OCR'd/extracted upstream by
services.document_parser) into a structured academic profile: skills,
CGPA, projects, publications, and education history.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Profile Intelligence Agent inside ResearchOS AI.
Extract a structured academic profile from raw resume and transcript text.
Return strict JSON with keys: cgpa (float or null), skills (list of strings),
research_interests (list of strings), publications (list of objects with
title/venue/year), projects (list of objects with title/description/tech_stack),
education (list of objects with degree/institution/year), profile_completeness
(float 0-1 estimating how complete this profile is for research applications)."""


class ProfileIntelligenceAgent(BaseAgent):
    name = "Profile Intelligence Agent"

    async def run(self, user_id: str, resume_text: str, transcript_text: str = "") -> Dict[str, Any]:
        await self.emit_activity(user_id, "processing", "Parsing resume and transcript")

        user_prompt = f"RESUME:\n{resume_text}\n\nTRANSCRIPT:\n{transcript_text}"
        profile = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        await self.lemma.put_record("profiles", user_id, profile)
        await self.emit_activity(user_id, "done", "Academic profile built", profile)
        return profile
