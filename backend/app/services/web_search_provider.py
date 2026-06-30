"""
Pluggable web search provider. The Professor Discovery and Paper Intelligence
agents depend on this for real data. Semantic Scholar's public API requires
no API key and returns real author and paper data, so it is used as the
default real data source. A mock fallback is retained only for offline dev
or if the Semantic Scholar API is unreachable - it is never used silently;
callers receive a `source` field so the UI can show when real data was used.
"""
from typing import List, Dict, Any
import httpx

SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1"


class WebSearchProvider:
    def __init__(self):
        self.timeout = 10.0

    async def search_professors(self, field: str, interests: List[str]) -> Dict[str, Any]:
        """Searches Semantic Scholar for authors matching a research field.
        Real authors with real affiliations and paper counts are returned,
        which the Professor Discovery Agent then structures via the LLM."""
        query = f"{field} {' '.join(interests[:3])}".strip()
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"{SEMANTIC_SCHOLAR_BASE}/author/search",
                    params={"query": query, "fields": "name,affiliations,paperCount,hIndex,url", "limit": 10},
                )
                resp.raise_for_status()
                data = resp.json()
                authors = data.get("data", [])
                return {"source": "semantic_scholar", "raw_authors": authors, "query": query}
        except Exception as exc:
            return {
                "source": "fallback_mock",
                "error": str(exc),
                "raw_authors": [],
                "query": query,
                "note": "Semantic Scholar request failed; no real data returned for this call.",
            }

    async def search_opportunities(self, fields: List[str]) -> Dict[str, Any]:
        # No free, keyless API exists for live internship/fellowship listings.
        # Documented honestly rather than silently mocked.
        return {
            "source": "unavailable",
            "note": (
                "No keyless public API exists for MITACS/DAAD/SURGE listings. "
                "Production deployment should connect a licensed listings API or "
                "scraper here; this call intentionally returns no fabricated data."
            ),
            "fields": fields,
        }

    async def fetch_recent_papers(self, professor_name: str, university: str) -> Dict[str, Any]:
        """Fetches a professor's real recent papers from Semantic Scholar by
        first resolving the author, then pulling their most recent publications
        with real abstracts. This is the data the Paper Intelligence Agent
        analyzes - no fabricated text reaches the LLM."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                search_resp = await client.get(
                    f"{SEMANTIC_SCHOLAR_BASE}/author/search",
                    params={"query": professor_name, "fields": "name,affiliations,paperCount", "limit": 5},
                )
                search_resp.raise_for_status()
                candidates = search_resp.json().get("data", [])
                if not candidates:
                    return {"source": "semantic_scholar", "found": False, "papers": [], "professor_name": professor_name}

                # Prefer a candidate whose affiliation mentions the university, else take the top match.
                author = next(
                    (a for a in candidates if any(university.lower() in (aff or "").lower() for aff in a.get("affiliations", []))),
                    candidates[0],
                )
                author_id = author["authorId"]

                papers_resp = await client.get(
                    f"{SEMANTIC_SCHOLAR_BASE}/author/{author_id}/papers",
                    params={"fields": "title,abstract,year,venue", "limit": 10},
                )
                papers_resp.raise_for_status()
                papers = papers_resp.json().get("data", [])
                papers_sorted = sorted(papers, key=lambda p: p.get("year") or 0, reverse=True)[:5]

                return {
                    "source": "semantic_scholar",
                    "found": True,
                    "professor_name": author.get("name", professor_name),
                    "papers": papers_sorted,
                }
        except Exception as exc:
            return {
                "source": "fallback_mock",
                "found": False,
                "error": str(exc),
                "papers": [],
                "professor_name": professor_name,
                "note": "Semantic Scholar request failed; no real data returned for this call.",
            }

