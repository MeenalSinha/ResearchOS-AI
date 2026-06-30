"""
Career Strategy Agent

The orchestrating "brain" of ResearchOS AI. Looks across all compatibility
scores, deadlines, and pipeline states to prioritize applications and
recommend where the student should invest effort first. This agent does
not call other agents directly (orchestration lives in
app.services.agent_orchestrator) - it consumes their outputs.
"""
from typing import Any, Dict, List

from app.agents.base_agent import BaseAgent

SYSTEM_PROMPT = """You are the Career Strategy Agent, the strategic brain of
ResearchOS AI. Given a list of candidate applications with match scores,
deadlines, and current pipeline status, recommend a prioritized order and
explain the reasoning in plain language a student can act on immediately.
Return strict JSON: {"prioritized_order": [{"professor_name","reason"}],
"top_recommendation": string, "risk_notes": []}."""


class CareerStrategyAgent(BaseAgent):
    name = "Career Strategy Agent"

    async def run(self, user_id: str, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        await self.emit_activity(user_id, "processing", "Analyzing portfolio to prioritize applications")

        result = await self.llm.complete_json(SYSTEM_PROMPT, f"Candidates:\n{candidates}")

        await self.emit_activity(user_id, "done", "Career strategy ready", result)
        return result
