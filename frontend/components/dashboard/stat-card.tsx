import { LucideIcon, ArrowUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-5 flex-1 min-w-[170px]">
      <div className="flex items-center gap-2 mb-3 text-ink-900">
        <Icon size={18} className="text-brand-600" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="text-[32px] leading-tight font-bold text-ink-900 mb-1">{value}</div>
      {delta ? (
        <div className="text-xs text-brand-600 font-semibold flex items-center gap-1">
          <ArrowUp size={12} strokeWidth={3} /> {delta}
        </div>
      ) : null}
    </div>
  );
}
