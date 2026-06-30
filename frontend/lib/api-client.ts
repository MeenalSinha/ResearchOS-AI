/**
 * Thin fetch wrapper for the ResearchOS AI FastAPI backend.
 * Attaches the bearer token from local storage and centralizes error handling.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("researchos_token");
}

import { isDemoUser, getMockData, createMockWebSocket } from "./mock-data";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  if (isDemoUser(token)) {
    return getMockData(path, options) as Promise<T>;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export function openAgentSocket(userId: string, onMessage: (event: any) => void): WebSocket {
  const token = getToken();
  if (isDemoUser(token)) {
    return createMockWebSocket(onMessage) as unknown as WebSocket;
  }

  const wsBase = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000").replace(/\/$/, "");
  const socket = new WebSocket(`${wsBase}/ws/agents/${userId}`);
  socket.onmessage = (msg) => onMessage(JSON.parse(msg.data));
  return socket;
}
