"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Radar } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface OpportunityScanResult {
  source: string;
  note: string;
  fields: string[];
}

/**
 * Calls the real backend Opportunity Watch Agent. As documented honestly
 * in the README, no free keyless API exists for MITACS/DAAD/SURGE-style
 * listings, so the backend returns an honest "unavailable" response with
 * a clear note rather than fabricated opportunities - this page surfaces
 * that real response rather than hiding it behind fake data.
 */
export default function OpportunitiesPage() {
  const [interests, setInterests] = useState("Computer Vision, Robotics");
  const [result, setResult] = useState<OpportunityScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<OpportunityScanResult>("/pipeline/opportunities/scan", {
        method: "POST",
        body: JSON.stringify({ interests: interests.split(",").map((s) => s.trim()).filter(Boolean) }),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message?.includes("401") ? "Sign in to scan for opportunities." : "Could not reach the Opportunity Watch Agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Opportunity Watch</h1>
        <p className="text-sm text-ink-500 mt-1">
          The Opportunity Watch Agent monitors for new internships, fellowships, and research openings.
        </p>
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
        <label className="block text-xs font-medium text-ink-700 mb-1.5">Research interests</label>
        <input
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200 mb-3"
        />
        <button
          onClick={runScan}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Radar size={15} />}
          Scan for opportunities
        </button>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mt-4">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-800 mb-1">Agent response (source: {result.source})</p>
            <p className="text-sm text-amber-900">{result.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
