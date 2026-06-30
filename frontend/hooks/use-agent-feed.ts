"use client";

import { useEffect, useRef, useState } from "react";
import { openAgentSocket } from "@/lib/api-client";

export interface AgentEvent {
  agent_name: string;
  status: string;
  message: string;
  payload: Record<string, any>;
  timestamp: string;
  user_id: string;
}

/**
 * Opens the real backend WebSocket at /ws/agents/{userId} and accumulates
 * incoming agent activity events. This is the piece that was previously
 * missing: the backend event bus and endpoint were fully built and
 * already broadcasting events, but nothing in the frontend ever opened
 * the socket. This hook is what makes the live multi-agent feed real.
 */
export function useAgentFeed(userId: string | null, maxEvents = 50) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = openAgentSocket(userId, (event: AgentEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents));
    });
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [userId, maxEvents]);

  return { events, connected };
}
