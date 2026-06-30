"use client";

import { useState, useEffect } from "react";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface StrategyResult {
  prioritized_order: { professor_name: string; reason: string }[];
  top_recommendation: string;
  risk_notes: string[];
}

// Replaced with dynamic data fetch

export default function StrategyPage() {
  const { checked } = useRequireAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [result, setResult] = useState<StrategyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<any[]>("/applications/candidates")
      .then((data) => {
        if (!cancelled) {
          setCandidates(data);
          setInitialLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  const runStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<StrategyResult>("/pipeline/strategy", {
        method: "POST",
        body: JSON.stringify({ candidates }),
      });
      setResult(data);
    } catch (err: any) {
      setError(
        err.message?.includes("401")
          ? "Sign in to run a live career strategy analysis."
          : "The Career Strategy Agent could not complete this run. This usually means OPENAI_API_KEY is not configured on the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">AI Career Strategy</h1>
        <p className="text-sm text-ink-500 mt-1">
          The Career Strategy Agent looks across every candidate application to recommend where to invest effort first - not
          just which documents to write next.
        </p>
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Candidate applications considered</h3>
        {initialLoading ? (
          <div className="text-sm text-ink-500 py-4 w-full text-center flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading candidates...
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-sm text-ink-500 py-4 w-full text-center">
            You don't have any saved applications yet.
          </div>
        ) : (
          <>
            <div className="space-y-2">
          {candidates.map((c) => (
            <div key={c.professor_name} className="flex items-center justify-between text-sm py-2 border-b border-ink-50 last:border-0">
              <div>
                <p className="font-medium text-ink-900">{c.professor_name}</p>
                <p className="text-xs text-ink-500">{c.university} - deadline {c.deadline}</p>
              </div>
              <span className="text-xs font-medium bg-brand-50 text-brand-600 rounded-full px-2.5 py-1">
                {c.match_percentage}% match
              </span>
            </div>
          ))}
        </div>
            <button
              onClick={runStrategy}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 bg-ink-900 hover:bg-ink-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              {loading ? "Analyzing portfolio..." : "Run Career Strategy Agent"}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">Recommended order</h3>
          <ol className="space-y-3 mb-5">
            {result.prioritized_order?.map((item, i) => (
              <li key={item.professor_name} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">{item.professor_name}</p>
                  <p className="text-xs text-ink-500">{item.reason}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="bg-brand-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-brand-700 mb-1">Top recommendation</p>
            <p className="text-sm text-ink-900">{result.top_recommendation}</p>
          </div>

          {result.risk_notes?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-700 mb-2">Risk notes</p>
              <ul className="list-disc list-inside text-sm text-ink-500 space-y-1">
                {result.risk_notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
