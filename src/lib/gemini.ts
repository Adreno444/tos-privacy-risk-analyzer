import { GoogleGenAI } from '@google/genai';
import { AnalysisReport } from '@/types/analyzer';
import { getCachedReport, setCachedReport } from '@/lib/cache';

export async function analyzeLegalDocumentWithGemini(
  text: string,
  docName: string = 'Legal Agreement',
  customApiKey?: string
): Promise<AnalysisReport> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your environment variables on Vercel or in your .env.local file.'
    );
  }

  // Check in-memory hash cache for instant deterministic replay
  const cacheKey = `${docName}:::${text}`;
  const cached = getCachedReport(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey });

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const truncatedText = text.length > 300000 ? text.slice(0, 300000) + '\n\n[Document truncated]' : text;

  const systemPrompt = `You are the world's most thorough legal-tech auditor, consumer rights defender, and cybersecurity/privacy analyst.
Your mission is to perform an exhaustive, unforgiving, and deeply objective analysis of Terms of Service (ToS), Privacy Policies, End User License Agreements (EULAs), and SaaS Contracts.

Audit specifically for these 9 major risk categories:
1. "Data Selling & Tracking": Sharing personal info with data brokers, ad networks, cross-app tracking, device fingerprinting.
2. "Forced Arbitration & Legal Waivers": Mandatory binding arbitration, jury trial waivers, class-action bans, short statute of limitations.
3. "Intellectual Property Ownership": Broad, perpetual, irrevocable, royalty-free, transferable worldwide licenses to user content, AI derivatives, or forfeiture of user creations.
4. "Unilateral Policy Changes": Company rights to alter terms, fees, or data practices at will without individual notice or opt-out.
5. "Dark Patterns & Auto-Renewals": Hidden charges, recurring subscription traps, friction in cancellation, non-refundable billing.
6. "Broad Liability & Indemnity": Asymmetric indemnity (user pays company legal fees), total liability disclaimers, "$0 or $50" max recovery caps.
7. "Account Termination & Content Deletion": Company terminating access arbitrarily without notice, refund, or data export rights.
8. "AI Training on User Data": Using user prompts, uploaded images, code, or personal data to train generative AI/LLM models without explicit opt-in.
9. "Biometrics & Telemetry Surveillance": Collecting facial geometry, keystrokes, precise location, audio, or persistent hardware identifiers.

OBJECTIVE RISK LEVEL ANCHORS (Use these strict standards consistently):
- CRITICAL: Selling/sharing PII or biometrics without opt-in; mandatory binding arbitration with total class action waivers; unilateral retroactive changes with no notice; total waiver of liability with full user indemnification.
- HIGH: Using private user prompts/content to train AI/LLMs without opt-out; indefinite data retention after account deletion; cross-app telemetry profiling; auto-renewals with strict no-refund barriers.
- MEDIUM: Standard analytics cookies; standard IP licenses limited strictly to operating the service; auto-renewals with advance email notification.
- LOW: Routine maintenance logging; standard third-party infrastructure hosting disclosures; standard warranty disclaimers.

DETERMINISTIC SCORING RULES:
- Calculate overallRiskScore using this exact formula:
  * Each CRITICAL red flag = +25 points
  * Each HIGH red flag = +15 points
  * Each MEDIUM red flag = +8 points
  * Each LOW red flag = +3 points
  * Subtract 5 points for every significant consumer good practice found.
  * Clamp final overallRiskScore strictly between 0 and 100.

- Assign overallGrade based strictly on overallRiskScore:
  * 0 - 15  -> "A+"
  * 16 - 30 -> "A"
  * 31 - 45 -> "B"
  * 46 - 60 -> "C"
  * 61 - 75 -> "D"
  * 76 - 100 -> "F"

You MUST extract:
- Exact verbatim quotes for every discovered red flag.
- Complexity metrics (legalComplexityRating, ambiguityRating).
- A Rights Matrix: "Rights You Give Up / Waive" vs "Rights & Powers The Company Asserts".
- Actionable Opt-Out Steps (e.g. arbitration opt-out address, email notice deadlines, cookie privacy settings).
- Positive consumer-friendly protections.

Return strictly valid JSON matching this schema:
{
  "documentName": string,
  "documentType": "Terms of Service" | "Privacy Policy" | "EULA" | "Comprehensive Legal Suite" | "Other Legal Document",
  "overallGrade": "A+" | "A" | "B" | "C" | "D" | "F",
  "overallRiskScore": number,
  "executiveSummary": string,
  "keyTakeaways": [string, string, string, string],
  "legalComplexityRating": "Extreme Obfuscation" | "High Complexity" | "Moderate Complexity" | "Accessible & Clear",
  "ambiguityRating": "High Risk of Vague Terms" | "Moderate" | "Clear & Specific",
  "riskCounts": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "rightsMatrix": {
    "rightsYouGiveUp": [string, string, string],
    "rightsCompanyClaims": [string, string, string]
  },
  "optOutActions": [
    {
      "title": string,
      "action": string,
      "deadlineOrMethod": string
    }
  ],
  "redFlags": [
    {
      "id": string,
      "category": "Data Selling & Tracking" | "Forced Arbitration & Legal Waivers" | "Intellectual Property Ownership" | "Unilateral Policy Changes" | "Dark Patterns & Auto-Renewals" | "Broad Liability & Indemnity" | "Account Termination & Content Deletion" | "AI Training on User Data" | "Biometrics & Telemetry Surveillance",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": string,
      "plainSummary": string,
      "exactQuote": string,
      "actionableAdvice": string,
      "sectionReference": string
    }
  ],
  "goodPractices": [
    {
      "title": string,
      "description": string
    }
  ]
}`;

  const userPrompt = `Please analyze the following legal document named "${docName}":

--- START OF DOCUMENT ---
${truncatedText}
--- END OF DOCUMENT ---

Provide your comprehensive structured audit in the requested JSON format.`;

  // Pinned fast & deterministic model pipeline (Gemini 2.0 Flash -> 1.5 Flash -> 2.5 Flash)
  const candidateModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-pro'
  ];

  let responseText: string | null = null;
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.0,
          seed: 42,
        },
      });

      if (response.text) {
        responseText = response.text;
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} returned error: ${err.message}. Trying next model...`);
    }
  }

  if (!responseText) {
    throw new Error(lastError?.message || 'Failed to analyze document with available Gemini AI models.');
  }

  // Clean possible markdown code fences (e.g. ```json ... ```)
  const cleanedJson = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsedData = JSON.parse(cleanedJson);
  const finalReport: AnalysisReport = {
    ...parsedData,
    readingTimeMinutes,
    wordCount,
  };

  // Cache report
  setCachedReport(cacheKey, finalReport);

  return finalReport;
}
