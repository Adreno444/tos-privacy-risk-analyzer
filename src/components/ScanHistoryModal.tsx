import React, { useEffect, useState } from 'react';
import { HistoryItem, getScanHistory, clearScanHistory, removeHistoryItem } from '@/lib/history';
import { AnalysisReport } from '@/types/analyzer';
import { GradeBadge } from './GradeBadge';
import { History, X, Trash2, ArrowRight, Clock, Shield } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-100">Audit History</h3>
              <p className="text-xs text-zinc-500">Locally saved scans on this device</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-md hover:bg-zinc-850 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReport(item.report);
                  onClose();
                }}
                className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors hover:bg-zinc-900/80 group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <GradeBadge grade={item.overallGrade as any} size="sm" />
                  <div>
                    <h4 className="font-medium text-sm text-zinc-200 group-hover:text-white transition-colors">
                      {item.documentName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span>
                        {item.redFlagsCount} Flags
                      </span>
                      <span>Score: {item.overallRiskScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleRemove(e, item.id)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-30 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-400">No past audits yet.</p>
              <p className="text-xs text-zinc-500">Scanned policies are stored in your local browser storage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
