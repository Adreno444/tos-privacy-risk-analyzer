import React, { useState, useEffect } from 'react';
import { AnalysisReport } from '@/types/analyzer';
import { GradeBadge } from './GradeBadge';
import { RiskMeter } from './RiskMeter';
import { RedFlagCard } from './RedFlagCard';
import { PolicyChatDrawer } from './PolicyChatDrawer';
import { saveScanToHistory } from '@/lib/history';
import {
  Shield,
  FileText,
  Clock,
  FileDown,
  Filter,
  MessageSquare,
  Scale,
  UserX,
  Building2,
  ExternalLink,
  Layers,
  CheckCircle,
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

  const exportPdf = () => {
    window.print();
  };

  const categories = Array.from(new Set((report.redFlags || []).map((f) => f.category)));

  return (
    <div className="space-y-8">
      {/* Discovered Multi-Document Banner (if available) */}
      {report.discoveredPages && report.discoveredPages.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 break-inside-avoid">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                Connected Policy Pages
              </div>
              <div className="text-xs text-zinc-500">
                Found {report.discoveredPages.length} policy links from this domain:
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.discoveredPages.map((page, idx) => (
              <a
                key={idx}
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <span>{page.title || page.type.toUpperCase()}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 no-print" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 relative overflow-hidden break-inside-avoid">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-medium tracking-wider text-zinc-400 mb-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{report.documentType || 'Legal Agreement Audit'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{report.documentName}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2">
              {report.wordCount && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {report.wordCount.toLocaleString()} words
                </span>
              )}
              {report.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{report.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={exportPdf}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onReset}
              className="text-xs font-medium px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            >
              New Scan
            </button>
          </div>
        </div>

        {/* Grade and Risk Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center break-inside-avoid">
            <span className="text-[11px] uppercase font-medium text-zinc-400 mb-3 tracking-wider">
              Privacy Rating
            </span>
            <GradeBadge grade={report.overallGrade} size="xl" />
            <p className="text-xs text-zinc-400 mt-3 max-w-[220px] leading-relaxed">
              {report.overallGrade === 'A' || report.overallGrade === 'A+'
                ? 'Consumer friendly with strong user privacy protections.'
                : report.overallGrade === 'B'
                ? 'Standard commercial terms with modest surveillance.'
                : report.overallGrade === 'C'
                ? 'Moderate concerns regarding data monetization or arbitration.'
                : report.overallGrade === 'D'
                ? 'Surrenders key rights, forced arbitration, or heavy telemetry.'
                : 'Contains predatory clauses, AI training on user data, or total rights waivers.'}
            </p>
          </div>

          <div className="md:col-span-8 space-y-3.5">
            <RiskMeter score={report.overallRiskScore} />

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-lg">
                <div className="text-lg font-bold font-mono text-zinc-200">
                  {report.riskCounts?.critical || 0}
                </div>
                <div className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">Critical</div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-lg">
                <div className="text-lg font-bold font-mono text-zinc-200">
                  {report.riskCounts?.high || 0}
                </div>
                <div className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">High</div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-lg">
                <div className="text-lg font-bold font-mono text-zinc-200">
                  {report.riskCounts?.medium || 0}
                </div>
                <div className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">Medium</div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-lg">
                <div className="text-lg font-bold font-mono text-zinc-200">
                  {report.riskCounts?.low || 0}
                </div>
                <div className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">Low</div>
              </div>
            </div>

            {/* Readability & Legal Complexity */}
            {(report.legalComplexityRating || report.ambiguityRating) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-2.5 rounded-lg">
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Legal Complexity</div>
                  <div className="text-xs font-semibold text-zinc-300 mt-0.5">
                    {report.legalComplexityRating || 'High Complexity'}
                  </div>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-2.5 rounded-lg">
                  <div className="text-[10px] uppercase font-medium text-zinc-500">Ambiguity Score</div>
                  <div className="text-xs font-semibold text-zinc-300 mt-0.5">
                    {report.ambiguityRating || 'Moderate'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary & Key Takeaways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl flex flex-col justify-between break-inside-avoid">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Executive Audit Summary
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{report.executiveSummary}</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl flex flex-col justify-between break-inside-avoid">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-500" />
              Key Critical Takeaways
            </h3>
            <ul className="space-y-2">
              {report.keyTakeaways?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Rights Matrix: Rights You Give Up vs Company Claims */}
      {report.rightsMatrix && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 space-y-4 break-inside-avoid">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Rights & Obligations Balance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rights You Give Up */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <UserX className="w-3.5 h-3.5 text-zinc-500" />
                <span>Rights You Give Up / Waive</span>
              </div>
              <ul className="space-y-1.5">
                {report.rightsMatrix.rightsYouGiveUp?.map((right, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-zinc-500 font-mono shrink-0">—</span>
                    <span className="leading-relaxed">{right}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rights Company Claims */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Rights The Company Asserts</span>
              </div>
              <ul className="space-y-1.5">
                {report.rightsMatrix.rightsCompanyClaims?.map((right, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-zinc-500 font-mono shrink-0">+</span>
                    <span className="leading-relaxed">{right}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Opt-Out Steps */}
      {report.optOutActions && report.optOutActions.length > 0 && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 space-y-3 break-inside-avoid">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-zinc-400" />
            <span>Recommended Opt-Out Actions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.optOutActions.map((opt, idx) => (
              <div key={idx} className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-lg space-y-1">
                <div className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                  <span>{opt.title}</span>
                  {opt.deadlineOrMethod && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {opt.deadlineOrMethod}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{opt.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags Section with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Discovered Clauses</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border bg-zinc-900 border-zinc-800 text-zinc-400">
                {(report.redFlags || []).length}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select any clause to view verbatim contract citations.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap no-print">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                aria-label="Filter by Risk Severity"
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-zinc-900">All Severities</option>
                <option value="CRITICAL" className="bg-zinc-900">Critical Only</option>
                <option value="HIGH" className="bg-zinc-900">High Only</option>
                <option value="MEDIUM" className="bg-zinc-900">Medium Only</option>
                <option value="LOW" className="bg-zinc-900">Low Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-print">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-md border whitespace-nowrap transition-colors text-xs ${
                selectedCategory === 'ALL'
                  ? 'bg-zinc-200 border-zinc-200 text-zinc-950 font-semibold'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({(report.redFlags || []).length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md border whitespace-nowrap transition-colors text-xs ${
                  selectedCategory === cat
                    ? 'bg-zinc-200 border-zinc-200 text-zinc-950 font-semibold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Cards list */}
        {filteredFlags.length > 0 ? (
          <div className="space-y-2.5">
            {filteredFlags.map((flag) => (
              <RedFlagCard key={flag.id || flag.title} flag={flag} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
            No clauses match the selected filter.
          </div>
        )}
      </div>

      {/* Good Practices Section */}
      {report.goodPractices && report.goodPractices.length > 0 && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 break-inside-avoid">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-zinc-400" />
            Positive Consumer Protections Found
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.goodPractices.map((good, idx) => (
              <div key={idx} className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
                <h4 className="font-medium text-zinc-200 text-xs sm:text-sm">{good.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{good.description}</p>
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
