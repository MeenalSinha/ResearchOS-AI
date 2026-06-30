"""
SOP Generator Agent

Generates a personalized Statement of Purpose section that references
the professor's actual research work and the student's real experience,
while maintaining originality and avoiding generic boilerplate.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the SOP Generator Agent inside ResearchOS AI.
Write a personalized Statement of Purpose section (300-450 words) connecting
the student's real background to the professor's specific research focus and
open problems. Avoid cliches and generic phrasing. Return strict JSON:
{"sop_text": string, "professor_references": [], "originality_notes": string}."""


class SOPGeneratorAgent(BaseAgent):
    name = "SOP Generator Agent"

    async def run(self, user_id: str, profile: Dict[str, Any], professor_focus: Dict[str, Any], application_id: str = "unscoped") -> Dict[str, Any]:
        await self.emit_activity(user_id, "drafting", "Writing personalized statement of purpose")

        # Discover previous versions from Lemma Datastore metadata
        prior_versions = await self.lemma.list_records("sop_versions", prefix=f"{application_id}_")
        version_number = len(prior_versions) + 1

        user_prompt = f"PROFILE:\n{profile}\n\nPROFESSOR FOCUS:\n{professor_focus}"
        
        if version_number > 1:
            # We can include prior feedback here if passed via kwargs, but for now just note version
            user_prompt += f"\n\nNOTE: This is version {version_number}. Improve upon previous iterations."

        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        # Store in Document Store with versioned name
        file_name = f"sop_v{version_number}.json"
        doc_content = str(result).encode("utf-8")
        await self.lemma.upload_document(file_name, doc_content, "application/json")
        
        # Track this version in Datastore
        await self.lemma.put_record("sop_versions", f"{application_id}_v{version_number}", {
            "version": version_number,
            "file_name": file_name,
            "timestamp": "now"
        })

        result["version"] = version_number
        result["file_name"] = file_name

        await self.emit_activity(user_id, "done", f"SOP draft v{version_number} ready", result)
        return result
