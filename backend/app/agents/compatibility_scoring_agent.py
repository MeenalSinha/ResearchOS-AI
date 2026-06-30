"""
Compatibility Scoring Agent

Matches a student's structured profile against a professor's research
focus to produce an explainable match score: percentage, strengths,
weaknesses, missing skills, and a plain-language recommendation.

Before generating a new score, this agent reads every prior compatibility
score for this student from the Lemma Datastore (read-before-write) and
passes that history to the LLM as context, so scores stay consistent
across runs and the model can note "your match with this professor's lab
has improved since last analysis" rather than re-deriving from zero each
time. The written record always reports which Lemma backend served the
request (`lemma` vs `local_fallback`) so the UI can show real provenance.
"""
from typing import Any, Dict

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Compatibility Scoring Agent inside ResearchOS AI.
Given a student profile, a professor's research focus, and the student's
PRIOR compatibility scores against other professors (for consistency and
context), return strict JSON: {"match_percentage": float 0-100,
"strengths": [], "weaknesses": [], "missing_skills": [], "recommendation":
string, "success_probability": float 0-1, "consistency_note": string}.
Be honest and specific; do not inflate scores. Use the prior scores only to
keep your scoring calibration consistent across this student's professors,
never to copy a previous score outright."""


class CompatibilityScoringAgent(BaseAgent):
    name = "Compatibility Scoring Agent"

    async def run(self, user_id: str, student_profile: Dict[str, Any], professor_focus: Dict[str, Any], professor_id: str = "unscoped") -> Dict[str, Any]:
        await self.emit_activity(user_id, "processing", "Retrieving prior compatibility scores from Lemma Datastore")

        prior_scores = await self.lemma.list_records("compatibility_scores", prefix=f"{user_id}_")

        await self.emit_activity(user_id, "processing", "Matching your profile with professor's research")

        user_prompt = (
            f"STUDENT PROFILE:\n{student_profile}\n\n"
            f"PROFESSOR FOCUS:\n{professor_focus}\n\n"
            f"PRIOR SCORES FOR THIS STUDENT ({len(prior_scores)} found):\n{prior_scores}"
        )
        result = await self.llm.complete_json(SYSTEM_PROMPT, user_prompt)

        record_id = f"{user_id}_{professor_id}"
        write_result = await self.lemma.put_record("compatibility_scores", record_id, result)
        result["lemma_backend"] = write_result.get("backend")
        result["prior_scores_considered"] = len(prior_scores)

        await self.emit_activity(
            user_id, "done",
            f"Match score: {result.get('match_percentage', 'N/A')}% "
            f"(considered {len(prior_scores)} prior scores, stored via {write_result.get('backend')})",
            result,
        )
        return result
