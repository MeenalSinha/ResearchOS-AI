import { MoreHorizontal } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  Draft: "bg-ink-300",
  Ready: "bg-blue-500",
  Submitted: "bg-amber-500",
  "Under Review": "bg-violet-500",
  Interview: "bg-brand-600",
  Accepted: "bg-emerald-500",
};

interface PipelineListProps {
  stages: { label: string; count: number }[];
}

export function PipelineList({ stages }: PipelineListProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-ink-900">Application Pipeline</h3>
        <MoreHorizontal size={20} className="text-ink-400 cursor-pointer" />
      </div>
      <div className="space-y-1 mb-6">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className="flex items-center justify-between py-2 rounded-lg hover:bg-ink-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-semibold text-ink-700">
              <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLORS[stage.label] ?? "bg-ink-300"}`} />
              {stage.label}
            </span>
            <span className="text-sm font-bold text-ink-900">{stage.count}</span>
          </div>
        ))}
      </div>
      <a href="/applications" className="block text-sm text-brand-600 font-semibold">
        View All Applications &rarr;
      </a>
    </div>
  );
}
