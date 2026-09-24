import React from 'react';

interface RiskMeterProps {
  score: number; // 0 to 100
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  const getStatus = (val: number) => {
    if (val < 25) return { label: 'Low Risk', color: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (val < 50) return { label: 'Moderate Risk', color: 'text-blue-400', bar: 'bg-blue-500' };
    if (val < 75) return { label: 'High Risk', color: 'text-amber-400', bar: 'bg-amber-500' };
    return { label: 'Severe / Hostile Risk', color: 'text-rose-400', bar: 'bg-rose-500' };
  };

  const status = getStatus(score);

  return (
    <div className="w-full bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Risk Severity Score</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
            {score}<span className="text-sm font-normal text-slate-500">/100</span>
          </div>
        </div>
        <span className={`text-sm font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-slate-800 border border-slate-700 ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bar}`}
          style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-2">
        <span>0 (Consumer Safe)</span>
        <span>50 (Moderate)</span>
        <span>100 (Predatory)</span>
      </div>
    </div>
  );
};
