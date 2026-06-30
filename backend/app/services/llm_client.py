"""
Thin wrapper around the OpenAI client so every agent calls the model the
same way, with shared retry logic, JSON-mode handling, and embeddings.
"""
import json
from typing import Any, Optional

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings

settings = get_settings()


class LLMClient:
    def __init__(self):
        # Falls back to a placeholder key so the app boots without OPENAI_API_KEY
        # configured (e.g. first run, CI, or demo without LLM calls yet). Any
        # actual completion/embedding call will fail clearly with an auth error
        # until a real key is set in backend/.env.
        api_key = settings.OPENAI_API_KEY or "sk-not-configured"
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = settings.OPENAI_MODEL
        self.embedding_model = settings.EMBEDDING_MODEL
        self.configured = bool(settings.OPENAI_API_KEY)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def complete(self, system: str, user: str, json_mode: bool = False, temperature: float = 0.4) -> str:
        if not self.configured:
            raise RuntimeError(
                "OPENAI_API_KEY is not set in backend/.env. Add a real key to enable agent runs."
            )
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            response_format={"type": "json_object"} if json_mode else None,
        )
        return response.choices[0].message.content

    async def complete_json(self, system: str, user: str, temperature: float = 0.3) -> Any:
        raw = await self.complete(system, user, json_mode=True, temperature=temperature)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"raw": raw}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def embed(self, text: str) -> list[float]:
        response = await self.client.embeddings.create(model=self.embedding_model, input=text)
        return response.data[0].embedding
