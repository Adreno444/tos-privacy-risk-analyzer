import React, { useState } from 'react';
import { RedFlag } from '@/types/analyzer';
import { ChevronDown, ChevronUp, FileText, Lightbulb, AlertCircle } from 'lucide-react';

interface RedFlagCardProps {
  flag: RedFlag;
}

export const RedFlagCard: React.FC<RedFlagCardProps> = ({ flag }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors duration-150 overflow-hidden break-inside-avoid">
      <div
        className="p-4 sm:p-5 flex items-start justify-between cursor-pointer gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3.5 flex-1">
          <div className="p-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-medium tracking-wider uppercase px-2 py-0.5 rounded border bg-zinc-800 text-zinc-300 border-zinc-700">
                {flag.riskLevel}
              </span>
              <span className="text-[11px] font-medium text-zinc-400">
                {flag.category}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-zinc-100 leading-snug">{flag.title}</h4>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">{flag.plainSummary}</p>
          </div>
        </div>

        <button
          className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition-colors shrink-0 no-print"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className={`${expanded ? 'block' : 'hidden print:block'} px-5 pb-5 pt-2 border-t border-zinc-800 bg-zinc-950/40 space-y-3`}>
        {flag.exactQuote && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span>Exact Clause Quote</span>
            </div>
            <blockquote className="text-xs font-mono text-zinc-300 bg-zinc-900 p-3 rounded-lg border-l-2 border-zinc-500 border-y border-r border-zinc-800 overflow-x-auto leading-relaxed">
              "{flag.exactQuote}"
            </blockquote>
          </div>
        )}

        {flag.actionableAdvice && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 flex items-start gap-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-200">Advice: </span>
              {flag.actionableAdvice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
