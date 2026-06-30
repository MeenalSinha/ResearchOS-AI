import { LucideIcon } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  scanning: "text-amber-600",
  reading: "text-blue-600",
  processing: "text-violet-600",
  drafting: "text-brand-600",
  scheduled: "text-emerald-600",
  done: "text-ink-300",
};

interface AgentRowProps {
  icon: LucideIcon;
  name: string;
  status: string;
  detail: string;
}

export function AgentRow({ icon: Icon, name, status, detail }: AgentRowProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-ink-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-900">{name}</p>
          <span className={`text-xs flex items-center gap-1.5 font-medium capitalize ${STATUS_COLORS[status] ?? "text-ink-500"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
          </span>
        </div>
        <p className="text-xs text-ink-500 truncate">{detail}</p>
      </div>
    </div>
  );
}
