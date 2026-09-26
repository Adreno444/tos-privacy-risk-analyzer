import { AnalysisReport } from '@/types/analyzer';

export interface HistoryItem {
  id: string;
  timestamp: number;
  documentName: string;
  documentType: string;
  overallGrade: string;
  overallRiskScore: number;
  redFlagsCount: number;
  report: AnalysisReport;
}

const STORAGE_KEY = 'tos_risk_analyzer_history_v1';
const MAX_HISTORY = 20;

export function getScanHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveScanToHistory(report: AnalysisReport): void {
  if (typeof window === 'undefined' || !report) return;
  try {
    const existing = getScanHistory();
    // Avoid duplicate if same name and score
    const filtered = existing.filter(
      (item) => item.documentName !== report.documentName || item.overallRiskScore !== report.overallRiskScore
    );

    const newItem: HistoryItem = {
      id: 'scan_' + Date.now(),
      timestamp: Date.now(),
      documentName: report.documentName,
      documentType: report.documentType,
      overallGrade: report.overallGrade,
      overallRiskScore: report.overallRiskScore,
      redFlagsCount: report.redFlags?.length || 0,
      report,
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to history:', err);
  }
}

export function clearScanHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function removeHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const existing = getScanHistory();
  const updated = existing.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
