import { Target } from "lucide-react";

interface MatchScoreRingProps {
  label: string;
  value: number;
}

export function MatchScoreRing({ label, value }: MatchScoreRingProps) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-5 flex-1 min-w-[170px] flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4 text-ink-900 self-start w-full">
        <Target size={18} className="text-brand-600" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="relative w-28 h-28 flex-1 flex items-center justify-center">
        <svg width="112" height="112" className="-rotate-90 absolute">
          <circle cx="56" cy="56" r="42" stroke="#f0f0f3" strokeWidth="12" fill="none" />
          <circle
            cx="56"
            cy="56"
            r="42"
            stroke="#dc1f33"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-ink-900">
          {value}%
        </div>
      </div>
    </div>
  );
}
