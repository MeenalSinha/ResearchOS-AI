/**
 * Decodes the `sub` claim (user id) out of the locally stored JWT without
 * needing a server round trip. This is read-only client-side decoding for
 * UI convenience (e.g. opening the right WebSocket channel) - the backend
 * is the actual source of truth and re-validates the token signature on
 * every API call.
 */
export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user ? user.id : null;
}

export function getCurrentUser(): { id: string; email: string; full_name: string } | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("researchos_token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      id: payload.sub || "",
      email: payload.email || "user@example.com",
      full_name: payload.full_name || "User",
    };
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("researchos_token", token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("researchos_token");
}

export function isAuthenticated(): boolean {
  return !!getCurrentUserId();
}
