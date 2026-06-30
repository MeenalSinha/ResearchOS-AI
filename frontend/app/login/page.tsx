"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (email.toLowerCase().trim() === "demo@researchos.com") {
        const { MOCK_TOKEN } = await import("@/lib/mock-data");
        setAuthToken(MOCK_TOKEN);
        router.push("/");
        router.refresh();
        return;
      }

      const data = await apiFetch<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.access_token);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message?.includes("401")
          ? "Incorrect email or password."
          : "Could not sign in. Check that the backend is running and reachable."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-ink-900 text-lg">ResearchOS AI</span>
        </div>

        <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-8">
          <h1 className="text-xl font-semibold text-ink-900 mb-1">Welcome back</h1>
          <p className="text-sm text-ink-500 mb-6">Sign in to your research career operator.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
