"""
A minimal in-process pub/sub event bus that fans agent activity events
out to WebSocket connections, keyed per user. Backed by Redis pub/sub
in multi-worker production deployments (see services/redis_bus.py for
the drop-in replacement using the same publish/subscribe interface).
"""
import asyncio
from collections import defaultdict
from typing import Any, Dict


class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, list[asyncio.Queue]] = defaultdict(list)

    async def subscribe(self, user_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[user_id].append(queue)
        return queue

    def unsubscribe(self, user_id: str, queue: asyncio.Queue):
        if queue in self._subscribers[user_id]:
            self._subscribers[user_id].remove(queue)

    async def publish(self, user_id: str, event: Dict[str, Any]):
        for queue in self._subscribers.get(user_id, []):
            await queue.put(event)


event_bus = EventBus()
