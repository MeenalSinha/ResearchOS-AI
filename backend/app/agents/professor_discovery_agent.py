"""
Professor Discovery Agent

Searches Semantic Scholar (real author/affiliation/paper-count data, no
mocked text) for professors matching a research field and the student's
interests, then structures the result via the LLM. Every result carries a
`data_source` field so the UI can show whether real data or a fallback was
used for this specific run.
"""
from typing import Any, Dict, List

from app.agents.base_agent import BaseAgent
from app.services.web_search_provider import WebSearchProvider

SYSTEM_PROMPT = """You are the Professor Discovery Agent inside ResearchOS AI.
You will be given REAL author records from Semantic Scholar (name, affiliations,
paper count, h-index) for a research field, plus a student's interests.
Return strict JSON: {"professors": [{"name","university","department",
"research_areas":[],"lab_url","bio","paper_count","h_index"}]}.
Only include professors clearly relevant to the field. Use the real
affiliation strings given to you for "university" - do not invent universities
not present in the source data. If a field like department is not present in
the source data, infer a reasonable one from research_areas rather than
fabricating a specific number or fact."""


class ProfessorDiscoveryAgent(BaseAgent):
    name = "Professor Discovery Agent"

    def __init__(self):
        super().__init__()
        self.search = WebSearchProvider()

    async def run(self, user_id: str, research_field: str, interests: List[str]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "scanning", f"Searching Semantic Scholar for {research_field} researchers")

        search_result = await self.search.search_professors(research_field, interests)
        data_source = search_result.get("source", "unknown")

        if not search_result.get("raw_authors"):
            await self.emit_activity(
                user_id, "done",
                "No real author records found for this query",
                {"professors": [], "data_source": data_source},
            )
            return {"professors": [], "data_source": data_source, "note": search_result.get("note", "")}

        user_prompt = f"Field: {research_field}\nInterests: {interests}\nReal author records:\n{search_result['raw_authors']}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)
        result["data_source"] = data_source

        await self.emit_activity(
            user_id, "done",
            f"Discovered {len(result.get('professors', []))} matching professors (source: {data_source})",
            result,
        )
        return result
