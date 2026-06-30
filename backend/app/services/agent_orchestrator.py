"""
Agent Orchestrator

Implements the end-to-end autonomous workflow shown in the product demo:

Profile -> Discovery -> Paper -> Match -> Resume -> SOP -> Email ->
Application -> Follow-up -> Interview -> Strategy

Each step's output feeds the next agent's input, and every step emits a
live activity event so the frontend's Multi-Agent Live Workflow graph can
visualize the pipeline in real time via WebSocket.

The full pipeline chains roughly 8 sequential LLM calls. Running that
synchronously inside one HTTP request is both slow and fragile - one
flaky OpenAI call kills the entire run with no partial-progress recovery,
and it cannot scale past a handful of concurrent users. `run_full_pipeline_background`
is therefore invoked as a FastAPI BackgroundTask (see api/routes/pipeline.py)
so the triggering HTTP request returns a run_id immediately. Per-run status
is tracked in PIPELINE_RUNS so the frontend can poll completion instead of
holding one HTTP connection open for the whole chain, and every status
change is also broadcast over the same event bus the agents already
publish to, for the live WebSocket feed.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.agents.profile_intelligence_agent import ProfileIntelligenceAgent
from app.agents.professor_discovery_agent import ProfessorDiscoveryAgent
from app.agents.paper_intelligence_agent import PaperIntelligenceAgent
from app.agents.compatibility_scoring_agent import CompatibilityScoringAgent
from app.agents.resume_optimizer_agent import ResumeOptimizerAgent
from app.agents.sop_generator_agent import SOPGeneratorAgent
from app.agents.cold_email_agent import ColdEmailAgent
from app.agents.follow_up_agent import FollowUpAgent
from app.agents.interview_coach_agent import InterviewCoachAgent
from app.agents.opportunity_watch_agent import OpportunityWatchAgent
from app.agents.career_strategy_agent import CareerStrategyAgent
from app.services.event_bus import event_bus

# In-memory run-status store. A multi-instance production deployment should
# back this with Redis; for this single-instance prototype it is the actual
# source of truth the polling endpoint reads from, not a placeholder.
PIPELINE_RUNS: Dict[str, Dict[str, Any]] = {}


class AgentOrchestrator:
    def __init__(self):
        self.profile_agent = ProfileIntelligenceAgent()
        self.discovery_agent = ProfessorDiscoveryAgent()
        self.paper_agent = PaperIntelligenceAgent()
        self.match_agent = CompatibilityScoringAgent()
        self.resume_agent = ResumeOptimizerAgent()
        self.sop_agent = SOPGeneratorAgent()
        self.email_agent = ColdEmailAgent()
        self.followup_agent = FollowUpAgent()
        self.interview_agent = InterviewCoachAgent()
        self.opportunity_agent = OpportunityWatchAgent()
        self.strategy_agent = CareerStrategyAgent()

    def start_run(self, user_id: str) -> str:
        run_id = str(uuid.uuid4())
        PIPELINE_RUNS[run_id] = {
            "run_id": run_id,
            "user_id": user_id,
            "status": "running",
            "current_step": "starting",
            "result": None,
            "error": None,
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
        }
        return run_id

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        return PIPELINE_RUNS.get(run_id)

    async def run_full_pipeline_background(
        self,
        run_id: str,
        user_id: str,
        resume_text: str,
        transcript_text: str,
        research_field: str,
        professor_name: str,
        university: str,
    ) -> None:
        try:
            PIPELINE_RUNS[run_id]["current_step"] = "profile"
            profile = await self.profile_agent.run(user_id, resume_text, transcript_text)

            PIPELINE_RUNS[run_id]["current_step"] = "discovery"
            discovery = await self.discovery_agent.run(user_id, research_field, profile.get("research_interests", []))

            PIPELINE_RUNS[run_id]["current_step"] = "paper_analysis"
            paper_analysis = await self.paper_agent.run(user_id, professor_name, university)

            PIPELINE_RUNS[run_id]["current_step"] = "compatibility"
            compatibility = await self.match_agent.run(user_id, profile, paper_analysis, professor_id=professor_name)

            PIPELINE_RUNS[run_id]["current_step"] = "resume"
            resume = await self.resume_agent.run(user_id, profile, paper_analysis)

            PIPELINE_RUNS[run_id]["current_step"] = "sop"
            sop = await self.sop_agent.run(user_id, profile, paper_analysis)

            PIPELINE_RUNS[run_id]["current_step"] = "email"
            email = await self.email_agent.run(user_id, profile, paper_analysis)

            PIPELINE_RUNS[run_id]["current_step"] = "interview_prep"
            interview_prep = await self.interview_agent.run(user_id, profile, paper_analysis)

            PIPELINE_RUNS[run_id]["current_step"] = "followup_plan"
            followup_plan = await self.followup_agent.run(user_id, 0, email.get("body", ""))

            result = {
                "profile": profile,
                "discovery": discovery,
                "paper_analysis": paper_analysis,
                "compatibility": compatibility,
                "resume": resume,
                "sop": sop,
                "email": email,
                "interview_prep": interview_prep,
                "followup_plan": followup_plan,
            }

            PIPELINE_RUNS[run_id].update(
                status="completed", current_step="done", result=result,
                completed_at=datetime.utcnow().isoformat(),
            )
            await event_bus.publish(user_id, {
                "agent_name": "Pipeline", "status": "done",
                "message": "Full pipeline run completed", "payload": {"run_id": run_id},
                "timestamp": datetime.utcnow().isoformat(), "user_id": user_id,
            })
        except Exception as exc:
            PIPELINE_RUNS[run_id].update(
                status="failed", error=str(exc), completed_at=datetime.utcnow().isoformat(),
            )
            await event_bus.publish(user_id, {
                "agent_name": "Pipeline", "status": "error",
                "message": f"Pipeline run failed at step '{PIPELINE_RUNS[run_id]['current_step']}': {exc}",
                "payload": {"run_id": run_id},
                "timestamp": datetime.utcnow().isoformat(), "user_id": user_id,
            })

    async def run_strategy(self, user_id: str, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        return await self.strategy_agent.run(user_id, candidates)

    async def run_opportunity_scan(self, user_id: str, interests: List[str]) -> Dict[str, Any]:
        return await self.opportunity_agent.run(user_id, interests)


orchestrator = AgentOrchestrator()
