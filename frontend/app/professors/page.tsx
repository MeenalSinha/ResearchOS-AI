"use client";

import { useState } from "react";
import { Loader2, AlertCircle, PlayCircle, Radio } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUserId } from "@/lib/auth";
import { useEffect } from "react";
import { useAgentFeed } from "@/hooks/use-agent-feed";

interface PipelineRunResponse {
  run_id: string;
  status: string;
}

interface RunStatus {
  run_id: string;
  status: "running" | "completed" | "failed";
  current_step: string;
  result: any;
  error: string | null;
}

/**
 * This is the pipeline-trigger UI that was previously missing entirely:
 * the backend's full 8-agent pipeline and the live WebSocket feed both
 * worked, but nothing in the frontend ever called POST /pipeline/run-full.
 * This form does exactly that, then polls GET /pipeline/runs/{run_id}
 * while the already-wired live agent feed (useAgentFeed) shows the same
 * run's step-by-step events in real time.
 */
export default function ProfessorsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [researchField, setResearchField] = useState("Computer Vision");
  const [professorName, setProfessorName] = useState("Antonio Torralba");
  const [university, setUniversity] = useState("MIT");
  const [resumeText, setResumeText] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { events, connected } = useAgentFeed(userId);

  useEffect(() => {
    setUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    if (!runId || runStatus?.status === "completed" || runStatus?.status === "failed") return;
    const interval = setInterval(async () => {
      try {
        const status = await apiFetch<RunStatus>(`/pipeline/runs/${runId}`);
        setRunStatus(status);
      } catch {
        // Keep polling - a transient failure here shouldn't kill the UI.
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [runId, runStatus?.status]);

  const startPipeline = async () => {
    if (!userId) {
      setError("Sign in to run the live agent pipeline.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setRunStatus(null);
    try {
      const res = await apiFetch<PipelineRunResponse>("/pipeline/run-full", {
        method: "POST",
        body: JSON.stringify({
          research_field: researchField,
          professor_name: professorName,
          university,
          resume_text: resumeText || "No resume text provided for this demo run.",
        }),
      });
      setRunId(res.run_id);
      setRunStatus({ run_id: res.run_id, status: "running", current_step: "starting", result: null, error: null });
    } catch (err: any) {
      setError(
        err.message?.includes("401")
          ? "Sign in to run the live agent pipeline."
          : err.message?.includes("429")
          ? "Too many requests right now - wait a minute and try again."
          : "Could not start the pipeline. Check that the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Professor Discovery</h1>
        <p className="text-sm text-ink-500 mt-1">
          Run the full multi-agent pipeline: discovery, real paper analysis, compatibility scoring, document drafting, and
          interview prep - all in one autonomous run.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-4">Run the agent pipeline</h3>

          {!userId && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={15} className="shrink-0" />
              <span>
                <a href="/login" className="font-medium underline">Sign in</a> to run a live pipeline.
              </span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Research field</label>
              <input
                value={researchField}
                onChange={(e) => setResearchField(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">Professor name</label>
                <input
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">University</label>
                <input
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Resume text (optional)</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={4}
                placeholder="Paste resume text, or leave blank for a demo run"
                className="w-full px-3 py-2.5 rounded-lg border border-ink-100 text-sm outline-none focus:ring-2 focus:ring-brand-200 resize-none"
              />
            </div>

            <button
              onClick={startPipeline}
              disabled={submitting || runStatus?.status === "running"}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
            >
              {submitting || runStatus?.status === "running" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PlayCircle size={16} />
              )}
              {runStatus?.status === "running" ? "Agents working..." : "Run Full Agent Pipeline"}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mt-4">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {runStatus && (
            <div className="mt-4 text-sm">
              <p className="text-ink-700">
                Status: <span className="font-medium">{runStatus.status}</span>
                {runStatus.status === "running" && <span className="text-ink-500"> - currently on step: {runStatus.current_step}</span>}
              </p>
              {runStatus.status === "failed" && (
                <p className="text-red-600 text-xs mt-1">
                  Failed at step &quot;{runStatus.current_step}&quot;: {runStatus.error}
                  {runStatus.error?.includes("RuntimeError") && " (likely missing OPENAI_API_KEY on the backend)"}
                </p>
              )}
              {runStatus.status === "completed" && (
                <p className="text-emerald-600 text-xs mt-1">
                  Pipeline completed - match score: {runStatus.result?.compatibility?.match_percentage ?? "N/A"}%
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio size={16} className={connected ? "text-emerald-500" : "text-ink-300"} />
              <h3 className="text-sm font-semibold text-ink-900">Live Agent Steps</h3>
            </div>
            <span className={`text-xs font-medium ${connected ? "text-emerald-600" : "text-ink-400"}`}>
              {connected ? "Connected" : "Not connected"}
            </span>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-ink-500 text-center py-10">
              Run the pipeline to watch each agent work in real time.
            </p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {events.map((event, i) => (
                <div key={`${event.timestamp}-${i}`} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-brand-500" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink-900">{event.agent_name}</span>
                      <span className="text-xs text-ink-400 capitalize">{event.status}</span>
                    </div>
                    <p className="text-xs text-ink-500">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
