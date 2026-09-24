import React, { useState } from 'react';
import { AnalysisReport, Category, RiskLevel } from '@/types/analyzer';
import { GradeBadge } from './GradeBadge';
import { RiskMeter } from './RiskMeter';
import { RedFlagCard } from './RedFlagCard';
import { ShieldCheck, AlertOctagon, CheckCircle2, Clock, FileText, Download, Share2, Filter } from 'lucide-react';

interface AnalysisResultsProps {
  report: AnalysisReport;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ report, onReset }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const filteredFlags = report.redFlags.filter((flag) => {
    const matchesCat = selectedCategory === 'ALL' || flag.category === selectedCategory;
    const matchesRisk = selectedRisk === 'ALL' || flag.riskLevel === selectedRisk;
    return matchesCat && matchesRisk;
  });

  const downloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.documentName.toLowerCase().replace(/\s+/g, '_')}_privacy_audit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const categories = Array.from(new Set(report.redFlags.map((f) => f.category)));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{report.documentType} Audit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{report.documentName}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 mt-2">
              {report.wordCount && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {report.wordCount.toLocaleString()} words
                </span>
              )}
              {report.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{report.readingTimeMinutes} min standard read
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={onReset}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              Analyze Another Document
            </button>
          </div>
        </div>

        {/* Grade and Risk Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">Privacy & Rights Grade</span>
            <GradeBadge grade={report.overallGrade} size="xl" />
            <p className="text-xs text-slate-400 mt-3 font-medium max-w-[200px]">
              {report.overallGrade === 'A' || report.overallGrade === 'A+'
                ? 'Consumer friendly with strong protections.'
                : report.overallGrade === 'B'
                ? 'Fair standard terms with minor surveillance.'
                : report.overallGrade === 'C'
                ? 'Moderate concerns regarding data or arbitration.'
                : 'Contains predatory clauses and rights waivers.'}
            </p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <RiskMeter score={report.overallRiskScore} />
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-rose-950/30 border border-rose-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">{report.riskCounts.critical}</div>
                <div className="text-[10px] uppercase font-bold text-rose-500/90 tracking-wider">Critical</div>
              </div>
              <div className="bg-orange-950/30 border border-orange-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-orange-400">{report.riskCounts.high}</div>
                <div className="text-[10px] uppercase font-bold text-orange-500/90 tracking-wider">High</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">{report.riskCounts.medium}</div>
                <div className="text-[10px] uppercase font-bold text-amber-500/90 tracking-wider">Medium</div>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-blue-400">{report.riskCounts.low}</div>
                <div className="text-[10px] uppercase font-bold text-blue-500/90 tracking-wider">Low</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary & Key Takeaways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Executive Summary
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{report.executiveSummary}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {report.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Red Flags Section with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>Discovered Red Flags & Legal Clauses</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {report.redFlags.length} Found
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any clause to reveal verbatim document quote and actionable advice.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                aria-label="Filter by Risk Severity"
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Severities</option>
                <option value="CRITICAL" className="bg-slate-900">Critical Only</option>
                <option value="HIGH" className="bg-slate-900">High Only</option>
                <option value="MEDIUM" className="bg-slate-900">Medium Only</option>
                <option value="LOW" className="bg-slate-900">Low Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors font-medium ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Categories ({report.redFlags.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Cards list */}
        {filteredFlags.length > 0 ? (
          <div className="space-y-3">
            {filteredFlags.map((flag) => (
              <RedFlagCard key={flag.id || flag.title} flag={flag} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No red flags match the selected filters.
          </div>
        )}
      </div>

      {/* Good Practices Section */}
      {report.goodPractices && report.goodPractices.length > 0 && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6">
          <h3 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Positive Consumer Protections Found
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.goodPractices.map((good, idx) => (
              <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/20">
                <h4 className="font-semibold text-slate-100 text-sm">{good.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{good.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
