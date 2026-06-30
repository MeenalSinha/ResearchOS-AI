"""
Pipeline routes: trigger the full autonomous multi-agent workflow as a
background task (so the HTTP request returns immediately with a run_id
instead of blocking for ~8 sequential LLM calls), poll its status, or run
individual stages like portfolio-level career strategy.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.api.deps import get_current_user_id
from app.schemas.schemas import PipelineRunRequest, StrategyRequest, OpportunityScanRequest
from app.services.agent_orchestrator import orchestrator

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/run-full")
async def run_full_pipeline(
    payload: PipelineRunRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    """Starts the full pipeline asynchronously and returns immediately.
    Poll GET /pipeline/runs/{run_id} for status, or listen on
    /ws/agents/{user_id} for live step-by-step events."""
    run_id = orchestrator.start_run(user_id)
    background_tasks.add_task(
        orchestrator.run_full_pipeline_background,
        run_id=run_id,
        user_id=user_id,
        resume_text=payload.resume_text,
        transcript_text=payload.transcript_text or "",
        research_field=payload.research_field,
        professor_name=payload.professor_name,
        university=payload.university,
    )
    return {"run_id": run_id, "status": "running"}


@router.get("/runs/{run_id}")
async def get_run_status(run_id: str, user_id: str = Depends(get_current_user_id)):
    run = orchestrator.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this run")
    return run


@router.post("/strategy")
async def run_strategy(payload: StrategyRequest, user_id: str = Depends(get_current_user_id)):
    return await orchestrator.run_strategy(user_id, payload.candidates)


@router.post("/opportunities/scan")
async def scan_opportunities(payload: OpportunityScanRequest, user_id: str = Depends(get_current_user_id)):
    return await orchestrator.run_opportunity_scan(user_id, payload.interests)
