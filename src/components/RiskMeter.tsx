import React from 'react';

interface RiskMeterProps {
  score: number; // 0 to 100
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  const getStatus = (val: number) => {
    if (val < 25) return { label: 'Low Risk' };
    if (val < 50) return { label: 'Moderate Risk' };
    if (val < 75) return { label: 'Elevated Risk' };
    return { label: 'Severe Risk' };
  };

  const status = getStatus(score);

  return (
    <div className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/80">
      <div className="flex justify-between items-end mb-3">
        <div>
          <span className="text-[11px] uppercase font-medium tracking-wider text-zinc-400">Risk Assessment Score</span>
          <div className="text-3xl font-bold text-white font-mono mt-0.5">
            {score}<span className="text-sm font-normal text-zinc-500">/100</span>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
          {status.label}
        </span>
      </div>

      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-200 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-mono">
        <span>0 (Standard)</span>
        <span>50</span>
        <span>100 (High Risk)</span>
      </div>
    </div>
  );
};
