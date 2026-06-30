"""
BaseAgent defines the contract every ResearchOS AI agent follows:
- run() executes the agent's task and returns structured output
- emit_activity() logs progress to AgentActivity so the frontend's live
  workflow dashboard can render real-time status via WebSocket
- All agents call the shared LLM client wrapper (app.services.llm_client)
  so model choice, retries, and Lemma SDK telemetry stay centralized.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict
from datetime import datetime

from app.services.llm_client import LLMClient
from app.services.lemma_client import LemmaClient
from app.services.event_bus import event_bus


class BaseAgent(ABC):
    name: str = "BaseAgent"

    def __init__(self):
        self.llm = LLMClient()
        self.lemma = LemmaClient()

    async def emit_activity(self, user_id: str, status: str, message: str, payload: Dict[str, Any] | None = None):
        """Publish an activity event consumed by the WebSocket activity feed."""
        event = {
            "agent_name": self.name,
            "status": status,
            "message": message,
            "payload": payload or {},
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
        }
        await event_bus.publish(user_id, event)
        return event

    @abstractmethod
    async def run(self, **kwargs) -> Dict[str, Any]:
        ...
