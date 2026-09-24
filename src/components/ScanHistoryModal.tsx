import React, { useEffect, useState } from 'react';
import { HistoryItem, getScanHistory, clearScanHistory, removeHistoryItem } from '@/lib/history';
import { AnalysisReport } from '@/types/analyzer';
import { GradeBadge } from './GradeBadge';
import { History, X, Trash2, ArrowRight, Clock, ShieldAlert } from 'lucide-react';

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: AnalysisReport) => void;
}

export const ScanHistoryModal: React.FC<ScanHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectReport,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getScanHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    clearScanHistory();
    setHistory([]);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = removeHistoryItem(id);
    setHistory(updated);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Recent Audit History</h3>
              <p className="text-xs text-slate-400">Locally saved past scans and risk reports</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReport(item.report);
                  onClose();
                }}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all hover:bg-slate-900/80 group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <GradeBadge grade={item.overallGrade as any} size="sm" />
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {item.documentName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <ShieldAlert className="w-3 h-3" />
                        {item.redFlagsCount} Red Flags
                      </span>
                      <span>Risk: {item.overallRiskScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleRemove(e, item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-400">No past audits recorded yet.</p>
              <p className="text-xs text-slate-500">Scan any Terms of Service or Privacy Policy to save it here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
