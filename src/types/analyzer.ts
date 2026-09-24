export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Category =
  | 'Data Selling & Tracking'
  | 'Forced Arbitration & Legal Waivers'
  | 'Intellectual Property Ownership'
  | 'Unilateral Policy Changes'
  | 'Dark Patterns & Auto-Renewals'
  | 'Broad Liability & Indemnity'
  | 'Account Termination & Content Deletion'
  | 'AI Training on User Data';

export interface RedFlag {
  id: string;
  category: Category;
  riskLevel: RiskLevel;
  title: string;
  plainSummary: string;
  exactQuote: string;
  actionableAdvice: string;
}

export interface GoodPractice {
  title: string;
  description: string;
}

export interface AnalysisReport {
  documentName: string;
  documentType: 'Terms of Service' | 'Privacy Policy' | 'EULA' | 'Other Legal Document';
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  overallRiskScore: number; // 0 to 100 (100 is extreme risk)
  executiveSummary: string;
  keyTakeaways: string[];
  riskCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  redFlags: RedFlag[];
  goodPractices: GoodPractice[];
  readingTimeMinutes?: number;
  wordCount?: number;
}
