import React, { useState, useEffect } from 'react';
import { AnalysisReport } from '@/types/analyzer';
import { GradeBadge } from './GradeBadge';
import { RiskMeter } from './RiskMeter';
import { RedFlagCard } from './RedFlagCard';
import { PolicyChatDrawer } from './PolicyChatDrawer';
import { saveScanToHistory } from '@/lib/history';
import {
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Filter,
  MessageSquare,
  Sparkles,
  Scale,
  UserX,
  Building2,
  ExternalLink,
  BookMarked,
  Layers,
} from 'lucide-react';

interface AnalysisResultsProps {
  report: AnalysisReport;
  rawText?: string;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ report, rawText = '', onReset }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (report) {
      saveScanToHistory(report);
    }
  }, [report]);

  const filteredFlags = (report.redFlags || []).filter((flag) => {
    const matchesCat = selectedCategory === 'ALL' || flag.category === selectedCategory;
    const matchesRisk = selectedRisk === 'ALL' || flag.riskLevel === selectedRisk;
    return matchesCat && matchesRisk;
  });

  const downloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${report.documentName.toLowerCase().replace(/\s+/g, '_')}_privacy_audit.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const categories = Array.from(new Set((report.redFlags || []).map((f) => f.category)));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Discovered Multi-Document Banner (if available) */}
      {report.discoveredPages && report.discoveredPages.length > 0 && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Multi-Page Policy Link Discovery
              </div>
              <div className="text-xs text-slate-300">
                Audited {report.discoveredPages.length} connected legal policies from this domain:
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.discoveredPages.map((page, idx) => (
              <a
                key={idx}
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-[11px] font-medium text-indigo-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span>{page.title || page.type.toUpperCase()}</span>
                <ExternalLink className="w-3 h-3 text-indigo-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{report.documentType || 'Terms & Privacy Audit'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{report.documentName}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 mt-2">
              {report.wordCount && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {report.wordCount.toLocaleString()} words analyzed
                </span>
              )}
              {report.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{report.readingTimeMinutes} min standard read
                </span>
              )}
              {report.readingGradeLevel && (
                <span className="flex items-center gap-1 text-amber-300/90">
                  <BookMarked className="w-3.5 h-3.5" />
                  {report.readingGradeLevel}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI About Policy</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>

            <button
              onClick={downloadReport}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>

            <button
              onClick={onReset}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              New Scan
            </button>
          </div>
        </div>

        {/* Grade and Risk Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">
              Privacy & Rights Grade
            </span>
            <GradeBadge grade={report.overallGrade} size="xl" />
            <p className="text-xs text-slate-400 mt-3 font-medium max-w-[220px]">
              {report.overallGrade === 'A' || report.overallGrade === 'A+'
                ? 'Consumer friendly with strong user privacy protections.'
                : report.overallGrade === 'B'
                ? 'Standard commercial terms with modest surveillance.'
                : report.overallGrade === 'C'
                ? 'Moderate concerns regarding data monetization or arbitration.'
                : report.overallGrade === 'D'
                ? 'Heavy rights surrender, forced arbitration, or aggressive telemetry.'
                : 'Contains predatory clauses, AI training on user data, or total rights waivers.'}
            </p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <RiskMeter score={report.overallRiskScore} />

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-rose-950/30 border border-rose-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
                  {report.riskCounts?.critical || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-rose-500/90 tracking-wider">Critical</div>
              </div>
              <div className="bg-orange-950/30 border border-orange-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-orange-400">
                  {report.riskCounts?.high || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-orange-500/90 tracking-wider">High</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                  {report.riskCounts?.medium || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-amber-500/90 tracking-wider">Medium</div>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/20 p-2.5 rounded-xl">
                <div className="text-lg sm:text-xl font-bold font-mono text-blue-400">
                  {report.riskCounts?.low || 0}
                </div>
                <div className="text-[10px] uppercase font-bold text-blue-500/90 tracking-wider">Low</div>
              </div>
            </div>

            {/* Readability & Legal Complexity Metrics */}
            {(report.legalComplexityRating || report.ambiguityRating || report.readingGradeLevel) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Legal Complexity</div>
                  <div className="text-xs font-bold text-indigo-300 mt-0.5">
                    {report.legalComplexityRating || 'High Complexity'}
                  </div>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Ambiguity Score</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">
                    {report.ambiguityRating || 'Moderate'}
                  </div>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Education Required</div>
                  <div className="text-xs font-bold text-rose-300 mt-0.5 truncate">
                    {report.readingGradeLevel || 'College Level'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary & Key Takeaways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Executive Audit Summary
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">{report.executiveSummary}</p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              Key Critical Takeaways
            </h3>
            <ul className="space-y-2.5">
              {report.keyTakeaways?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Rights Matrix: Rights You Give Up vs Company Claims */}
      {report.rightsMatrix && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Power & Rights Imbalance Matrix</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rights You Give Up */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <UserX className="w-4 h-4" />
                <span>Rights You Give Up / Waive</span>
              </div>
              <ul className="space-y-2">
                {report.rightsMatrix.rightsYouGiveUp?.map((right, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rights Company Claims */}
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Rights & Powers The Company Claims</span>
              </div>
              <ul className="space-y-2">
                {report.rightsMatrix.rightsCompanyClaims?.map((right, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold shrink-0">✓</span>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Opt-Out Steps */}
      {report.optOutActions && report.optOutActions.length > 0 && (
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Consumer Protection Action Plan & Opt-Outs</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.optOutActions.map((opt, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-indigo-500/20 p-3.5 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{opt.title}</span>
                  {opt.deadlineOrMethod && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {opt.deadlineOrMethod}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{opt.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags Section with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>Discovered Red Flags & Legal Clauses</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {(report.redFlags || []).length} Found
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any clause to reveal verbatim document quotes and actionable advice.
            </p>
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
              All Categories ({(report.redFlags || []).length})
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

      {/* Interactive Policy Q&A Drawer */}
      <PolicyChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documentName={report.documentName}
        documentText={rawText || report.executiveSummary}
      />
    </div>
  );
};
