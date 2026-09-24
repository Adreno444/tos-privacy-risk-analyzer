import React, { useState } from 'react';
import { RedFlag } from '@/types/analyzer';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, FileText, Lightbulb } from 'lucide-react';

interface RedFlagCardProps {
  flag: RedFlag;
}

export const RedFlagCard: React.FC<RedFlagCardProps> = ({ flag }) => {
  const [expanded, setExpanded] = useState(false);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 overflow-hidden shadow-sm">
      <div
        className="p-4 sm:p-5 flex items-start justify-between cursor-pointer gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3.5 flex-1">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-rose-400 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md border ${getRiskBadge(flag.riskLevel)}`}>
                {flag.riskLevel}
              </span>
              <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
                {flag.category}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-100 leading-snug">{flag.title}</h4>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{flag.plainSummary}</p>
          </div>
        </div>

        <button
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5">
          {flag.exactQuote && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Exact Clause Quote</span>
              </div>
              <blockquote className="text-xs sm:text-sm font-mono text-slate-300 bg-slate-900/90 p-3.5 rounded-lg border-l-2 border-rose-500 border-y border-r border-slate-800 overflow-x-auto">
                "{flag.exactQuote}"
              </blockquote>
            </div>
          )}

          {flag.actionableAdvice && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-xs sm:text-sm text-emerald-300 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-200">Recommendation: </span>
                {flag.actionableAdvice}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
