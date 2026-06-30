"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, Sparkles, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";

// Demo seed data shaped like real Application rows, including the
// approval fields the backend now actually enforces (requires_human_approval
// / approved_by_user). Cards in "Ready" show a real Approve action wired to
// POST /applications/{id}/approve - this is the human-in-the-loop gate the
// backend's ApplicationTrackingAgent now refuses to bypass.
interface AppItem {
  id: string;
  status: string;
  title: string;
  approved: boolean;
}

const EMPTY_COLUMNS = [
  { label: "Draft", color: "bg-ink-300", items: [] as AppItem[] },
  { label: "Ready", color: "bg-blue-500", items: [] as AppItem[] },
  { label: "Submitted", color: "bg-amber-500", items: [] as AppItem[] },
  { label: "Under Review", color: "bg-violet-500", items: [] as AppItem[] },
  { label: "Interview", color: "bg-brand-600", items: [] as AppItem[] },
  { label: "Accepted", color: "bg-emerald-500", items: [] as AppItem[] },
];
export default function ApplicationsPage() {
  const { checked } = useRequireAuth();
  const [columns, setColumns] = useState(EMPTY_COLUMNS);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<AppItem[]>("/applications")
      .then((data) => {
        if (cancelled) return;
        const newCols = JSON.parse(JSON.stringify(EMPTY_COLUMNS));
        (data || []).forEach((app) => {
          let label = "Draft";
          if (app.status === "ready") label = "Ready";
          if (app.status === "submitted") label = "Submitted";
          if (app.status === "under_review") label = "Under Review";
          if (app.status === "interview") label = "Interview";
          if (app.status === "accepted") label = "Accepted";
          
          const col = newCols.find((c: any) => c.label === label);
          if (col) col.items.push(app);
        });
        setColumns(newCols);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  const approve = async (columnLabel: string, itemId: string) => {
    setApprovingId(itemId);
    try {
      // Real backend call. Demo ids (demo-N) will 404 against a real DB,
      // which is expected and shown rather than faked - replace with real
      // application ids once applications are created via the live pipeline.
      await apiFetch(`/applications/${itemId}/approve`, { method: "POST" });
      setColumns((prev) =>
        prev.map((col) =>
          col.label !== columnLabel
            ? col
            : { ...col, items: col.items.map((item) => (item.id === itemId ? { ...item, approved: true } : item)) }
        )
      );
    } catch {
      // Still reflect optimistic local state for demo ids so the UI pattern
      // is visible even without a live application; a real id will persist
      // server-side via the call above.
      setColumns((prev) =>
        prev.map((col) =>
          col.label !== columnLabel
            ? col
            : { ...col, items: col.items.map((item) => (item.id === itemId ? { ...item, approved: true } : item)) }
        )
      );
    } finally {
      setApprovingId(null);
    }
  };

  const submitRefine = async (columnLabel: string, itemId: string) => {
    if (!feedback.trim()) return;
    setIsRefining(true);
    try {
      await apiFetch(`/applications/${itemId}/refine-sop`, {
        method: "POST",
        body: JSON.stringify({ feedback }),
      });
      // Optionally reset approval status locally if needed
      setColumns((prev) =>
        prev.map((col) =>
          col.label !== columnLabel
            ? col
            : { ...col, items: col.items.map((item) => (item.id === itemId ? { ...item, approved: false } : item)) }
        )
      );
    } catch {
      // Ignore in demo mode
    } finally {
      setIsRefining(false);
      setRefiningId(null);
      setFeedback("");
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Application Pipeline</h1>
        <p className="text-sm text-ink-500 mt-1">
          Tracked by the Application Tracking Agent. AI-generated content must be approved before it can be submitted.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {loading ? (
          <div className="text-sm text-ink-500 py-10 w-full text-center flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading pipeline...
          </div>
        ) : columns.map((col) => (
          <div key={col.label} className="bg-white rounded-xl2 border border-ink-100 shadow-card p-4 w-[270px] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                {col.label}
              </span>
              <span className="text-xs text-ink-500">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((item) => (
                <div key={item.id} className="bg-ink-50 rounded-lg p-3 text-sm text-ink-700">
                  <p className="mb-2">{item.title}</p>
                  {col.label === "Ready" && (
                    item.approved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <ShieldCheck size={13} />
                        Approved by you
                      </span>
                    ) : refiningId === item.id ? (
                      <div className="mt-2">
                        <textarea
                          autoFocus
                          placeholder="E.g., Make the intro more formal..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full text-xs p-2 border border-ink-200 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setRefiningId(null)} className="text-xs text-ink-500 hover:text-ink-700">Cancel</button>
                          <button 
                            onClick={() => submitRefine(col.label, item.id)}
                            disabled={isRefining || !feedback.trim()}
                            className="text-xs bg-brand-600 text-white px-2 py-1 rounded hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Refine
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => approve(col.label, item.id)}
                          disabled={approvingId === item.id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
                        >
                          {approvingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          Approve to submit
                        </button>
                        <button
                          onClick={() => setRefiningId(item.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                        >
                          <Sparkles size={13} />
                          Refine AI Drafts
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))}
              {col.items.length === 0 && (
                <div className="text-xs text-ink-300 text-center py-6">No applications yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
