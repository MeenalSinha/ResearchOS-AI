"""
WebSocket endpoint streaming live agent activity to the frontend's
Multi-Agent Live Workflow dashboard and AI Agent Activity Feed.
"""
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.event_bus import event_bus

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/agents/{user_id}")
async def agent_activity_stream(websocket: WebSocket, user_id: str):
    await websocket.accept()
    queue = await event_bus.subscribe(user_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event)
    except WebSocketDisconnect:
        event_bus.unsubscribe(user_id, queue)
