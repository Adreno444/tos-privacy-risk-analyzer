export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Category =
  | 'Data Selling & Tracking'
  | 'Forced Arbitration & Legal Waivers'
  | 'Intellectual Property Ownership'
  | 'Unilateral Policy Changes'
  | 'Dark Patterns & Auto-Renewals'
  | 'Broad Liability & Indemnity'
  | 'Account Termination & Content Deletion'
  | 'AI Training on User Data'
  | 'Biometrics & Telemetry Surveillance';

export interface RedFlag {
  id: string;
  category: Category;
  riskLevel: RiskLevel;
  title: string;
  plainSummary: string;
  exactQuote: string;
  actionableAdvice: string;
  sectionReference?: string;
}

export interface GoodPractice {
  title: string;
  description: string;
}

export interface OptOutAction {
  title: string;
  action: string;
  deadlineOrMethod?: string;
}

export interface RightsMatrix {
  rightsYouGiveUp: string[];
  rightsCompanyClaims: string[];
}

export interface DiscoveredPageMeta {
  title: string;
  url: string;
  type: string;
}

export interface AnalysisReport {
  documentName: string;
  documentType: 'Terms of Service' | 'Privacy Policy' | 'EULA' | 'Comprehensive Legal Suite' | 'Other Legal Document';
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  overallRiskScore: number; // 0 to 100 (100 is extreme risk)
  executiveSummary: string;
  keyTakeaways: string[];
  readingGradeLevel: string; // e.g. "Postgraduate Law Level (Grade 16+)"
  legalComplexityRating: 'Extreme Obfuscation' | 'High Complexity' | 'Moderate Complexity' | 'Accessible & Clear';
  ambiguityRating: 'High Risk of Vague Terms' | 'Moderate' | 'Clear & Specific';
  riskCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  rightsMatrix: RightsMatrix;
  optOutActions: OptOutAction[];
  redFlags: RedFlag[];
  goodPractices: GoodPractice[];
  discoveredPages?: DiscoveredPageMeta[];
  readingTimeMinutes?: number;
  wordCount?: number;
}
