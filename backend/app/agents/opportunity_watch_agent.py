"""
Opportunity Watch Agent

Monitors configured sources (MITACS, DAAD, SURGE, IISc, IIT research
portals, etc.) for new internships, fellowships, and research openings,
then recommends opportunities relevant to the student's profile.
"""
from typing import Any, Dict, List

from app.agents.base_agent import BaseAgent
from app.services.web_search_provider import WebSearchProvider

SYSTEM_PROMPT = """You are the Opportunity Watch Agent inside ResearchOS AI.
Given raw snippets about research programs/internships and a student's
interests, return strict JSON: {"opportunities": [{"title","organization",
"program_type","deadline","description","relevance_reason"}]}. Only include
opportunities that genuinely match the student's interests."""


class OpportunityWatchAgent(BaseAgent):
    name = "Opportunity Watch Agent"

    def __init__(self):
        super().__init__()
        self.search = WebSearchProvider()

    async def run(self, user_id: str, interests: List[str]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "scanning", "Monitoring sources for new opportunities")

        raw = await self.search.search_opportunities(interests)
        result = await self.llm.complete_json(SYSTEM_PROMPT, f"Interests: {interests}\n\n{raw}")

        await self.emit_activity(
            user_id, "done",
            f"Found {len(result.get('opportunities', []))} new opportunities",
            result,
        )
        return result
