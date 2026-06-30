"""
Wrapper around the Lemma SDK, used for two core jobs in ResearchOS AI:

1. Lemma Datastore: structured, versioned storage of agent outputs
   (compatibility scores, SOP drafts, email drafts) so every AI decision
   is auditable, explainable, and - critically - RETRIEVABLE before the
   next agent run, so scores stay consistent rather than being
   regenerated from scratch on every call.
2. Lemma Document Store: durable storage for uploaded resumes,
   transcripts, and generated documents, with signed retrieval URLs.

When LEMMA_API_KEY is configured, every write/read goes through the real
Lemma HTTP API. When it is not configured, a local JSON-file-backed store
is used instead of a silent no-op - this means read-before-write behavior
is real and testable even without a live Lemma account, and every response
carries a `backend` field ("lemma" or "local_fallback") so the UI can be
honest about which one served the request.
"""
import json
import os
import httpx
from pathlib import Path
from typing import Any, Optional

from app.core.config import get_settings

settings = get_settings()

LOCAL_STORE_ROOT = Path(settings.STORAGE_LOCAL_PATH) / "lemma_fallback"


class LemmaClient:
    def __init__(self):
        self.api_key = settings.LEMMA_API_KEY
        self.datastore_url = settings.LEMMA_DATASTORE_URL
        self.docstore_url = settings.LEMMA_DOCSTORE_URL
        self.enabled = bool(self.api_key)
        if not self.enabled:
            LOCAL_STORE_ROOT.mkdir(parents=True, exist_ok=True)

    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def _local_collection_path(self, collection: str) -> Path:
        path = LOCAL_STORE_ROOT / collection
        path.mkdir(parents=True, exist_ok=True)
        return path

    async def put_record(self, collection: str, record_id: str, data: dict) -> dict:
        """Persist a structured agent output record. Real Lemma Datastore
        write when configured; otherwise a real on-disk JSON write (not a
        no-op) so read-before-write logic genuinely works in local dev."""
        if not self.enabled:
            path = self._local_collection_path(collection) / f"{record_id}.json"
            path.write_text(json.dumps(data, indent=2, default=str))
            return {"backend": "local_fallback", "collection": collection, "id": record_id}

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.put(
                f"{self.datastore_url}/{collection}/{record_id}",
                headers=self._headers(),
                json=data,
            )
            resp.raise_for_status()
            body = resp.json()
            body["backend"] = "lemma"
            return body

    async def get_record(self, collection: str, record_id: str) -> Optional[dict]:
        if not self.enabled:
            path = self._local_collection_path(collection) / f"{record_id}.json"
            if not path.exists():
                return None
            return json.loads(path.read_text())

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.datastore_url}/{collection}/{record_id}", headers=self._headers()
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def list_records(self, collection: str, prefix: str = "") -> list[dict]:
        """Lists prior records in a collection (optionally filtered by an
        id prefix, e.g. a user_id) - this is what powers read-before-write:
        an agent calls this to retrieve every prior record for a user
        before generating a new one."""
        if not self.enabled:
            path = self._local_collection_path(collection)
            records = []
            for file in sorted(path.glob(f"{prefix}*.json")):
                records.append(json.loads(file.read_text()))
            return records

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.datastore_url}/{collection}",
                headers=self._headers(),
                params={"prefix": prefix} if prefix else None,
            )
            resp.raise_for_status()
            return resp.json().get("records", [])

    async def upload_document(self, file_name: str, content: bytes, content_type: str) -> dict:
        """Upload a file (resume, transcript, generated SOP/resume PDF) to
        Lemma Document Store, or to local disk storage when not configured."""
        if not self.enabled:
            docs_path = Path(settings.STORAGE_LOCAL_PATH) / "documents"
            docs_path.mkdir(parents=True, exist_ok=True)
            target = docs_path / file_name
            target.write_bytes(content)
            return {"backend": "local_fallback", "file_name": file_name, "url": f"/local-storage/documents/{file_name}"}

        async with httpx.AsyncClient(timeout=30) as client:
            files = {"file": (file_name, content, content_type)}
            resp = await client.post(
                self.docstore_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
            )
            resp.raise_for_status()
            body = resp.json()
            body["backend"] = "lemma"
            return body
