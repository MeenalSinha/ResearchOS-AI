import { useState } from "react";
import { Building2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface RecommendationCardProps {
  university: string;
  professor: string;
  field: string;
  match: number;
  imageSrc?: string;
  recommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
}

export function RecommendationCard({ university, professor, field, match, imageSrc, recommendation, strengths, weaknesses }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-5 flex flex-col relative overflow-hidden min-h-[200px]">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-ink-50 flex items-center justify-center border border-ink-100">
            <Building2 size={12} className="text-ink-500" />
          </div>
          <div className="flex items-center gap-2">
            {university.includes("CMU") && <span className="text-xs font-bold text-brand-600">CMU</span>}
            <p className="text-xs text-ink-500 font-semibold truncate">
              {university.includes("CMU") ? "Carnegie Mellon University" : university}
            </p>
          </div>
        </div>
        <div className="mb-4 relative z-10 w-3/4">
          <p className="font-bold text-ink-900 text-[17px] mb-1 leading-tight">{professor}</p>
          <p className="text-xs font-medium text-ink-500">{field}</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 relative z-10 mt-auto">
        <div className="flex items-center justify-between">
          <span className="inline-block text-[11px] font-bold bg-brand-50 text-brand-600 rounded-md px-2.5 py-1">
            {match}% Match
          </span>
          {recommendation && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-ink-500 hover:text-ink-900 text-xs flex items-center gap-1 transition-colors"
            >
              Why this match? {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-2 pt-3 border-t border-ink-100 text-sm">
            <p className="text-ink-700 mb-3 italic">{recommendation}</p>
            
            {strengths && strengths.length > 0 && (
              <div className="mb-2">
                <p className="font-semibold text-emerald-600 text-xs uppercase mb-1">Strengths</p>
                <ul className="list-disc pl-4 text-ink-600 text-xs space-y-1">
                  {strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            
            {weaknesses && weaknesses.length > 0 && (
              <div className="mb-2">
                <p className="font-semibold text-rose-500 text-xs uppercase mb-1">Missing Skills</p>
                <ul className="list-disc pl-4 text-ink-600 text-xs space-y-1">
                  {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <button className="text-brand-600 text-xs font-bold flex items-center gap-1 hover:text-brand-700 transition-colors w-max mt-2">
          View Profile <ArrowRight size={14} />
        </button>
      </div>

      {imageSrc && !isExpanded && (
        <img 
          src={imageSrc} 
          alt={professor} 
          className="absolute bottom-4 right-4 w-[72px] h-[72px] object-contain mix-blend-multiply drop-shadow-[-4px_4px_0px_#f23344]"
        />
      )}
    </div>
  );
}
