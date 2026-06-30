"""
Paper Intelligence Agent

Reads a professor's real recent publications (fetched from Semantic
Scholar - real titles, abstracts, venues, years) and produces a digestible
research summary, keyword list, current lab focus, open problems, and
suggested discussion points. Every output carries a `data_source` field
and the actual paper titles used, so the UI can show the evidence behind
the analysis rather than an opaque AI claim.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.services.web_search_provider import WebSearchProvider

SYSTEM_PROMPT = """You are the Paper Intelligence Agent inside ResearchOS AI.
You will be given REAL paper records (title, abstract, year, venue) for a
professor, fetched from Semantic Scholar. Return strict JSON:
{"summary","keywords":[],"current_lab_focus","open_problems":[],
"discussion_points":[]}. Base every claim only on the abstracts given to you.
If abstracts are missing or sparse, say so in the summary rather than
inventing technical detail that isn't supported by the source text."""


class PaperIntelligenceAgent(BaseAgent):
    name = "Paper Intelligence Agent"

    def __init__(self):
        super().__init__()
        self.search = WebSearchProvider()

    async def run(self, user_id: str, professor_name: str, university: str) -> Dict[str, Any]:
        await self.emit_activity(user_id, "reading", f"Fetching real publications for {professor_name} from Semantic Scholar")

        paper_data = await self.search.fetch_recent_papers(professor_name, university)
        data_source = paper_data.get("source", "unknown")
        papers = paper_data.get("papers", [])

        if not papers:
            note = paper_data.get("note", "No publications found for this professor on Semantic Scholar.")
            await self.emit_activity(user_id, "done", note, {"data_source": data_source})
            return {
                "summary": note,
                "keywords": [],
                "current_lab_focus": "",
                "open_problems": [],
                "discussion_points": [],
                "data_source": data_source,
                "source_papers": [],
            }

        await self.emit_activity(user_id, "reading", f"Analyzing {len(papers)} real papers (source: {data_source})")

        user_prompt = f"Professor: {professor_name}\nReal papers:\n{papers}"
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)
        result["data_source"] = data_source
        result["source_papers"] = [{"title": p.get("title"), "year": p.get("year"), "venue": p.get("venue")} for p in papers]

        await self.emit_activity(user_id, "done", "Paper analysis complete", result)
        return result
