import { GoogleGenAI } from '@google/genai';
import { AnalysisReport } from '@/types/analyzer';
import { getCachedReport, setCachedReport } from '@/lib/cache';

const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3-flash-lite'];

function extractAndParseJson<T = any>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip Markdown fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Boundary isolate from first { to last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 1. Direct standard parse
  try {
    return JSON.parse(cleaned);
  } catch (err1: any) {
    // 2. Trailing commas removal
    try {
      const fixedCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixedCommas);
    } catch (err2: any) {
      // 3. Fix unescaped control characters
      try {
        const sanitized = cleaned.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === '\n') return '\\n';
          if (match === '\r') return '\\r';
          if (match === '\t') return '\\t';
          return '';
        });
        return JSON.parse(sanitized);
      } catch (err3: any) {
        throw new Error(`JSON parse error: ${err1.message}`);
      }
    }
  }
}

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

  // 1. Check in-memory hash cache for instant deterministic replay
  const cacheKey = `${docName}:::${text}`;
  const cached = getCachedReport(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey });

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const truncatedText = text.length > 300000 ? text.slice(0, 300000) + '\n\n[Document truncated]' : text;

  const systemPrompt = `You are an expert legal-tech auditor, consumer privacy advocate, and cybersecurity policy analyst.
Your mission is to perform an exhaustive, objective analysis of Terms of Service (ToS), Privacy Policies, End User License Agreements (EULAs), and SaaS Contracts.

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

OBJECTIVE RISK LEVEL ANCHORS:
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

FORMATTING & ESCAPING REQUIREMENT:
- You MUST return strictly valid JSON.
- In all string fields (especially "exactQuote"), all internal double quotes MUST be escaped with a backslash (\\") or formatted as single quotes ('). Never leave unescaped double quotes inside strings.`;

  const userPrompt = `Please analyze the following legal document named "${docName}":

--- START OF DOCUMENT ---
${truncatedText}
--- END OF DOCUMENT ---

Provide your comprehensive structured audit in valid JSON format matching the required schema.`;

  let responseText: string | null = null;
  let parsedReport: AnalysisReport | null = null;
  let lastError: any = null;

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              documentName: { type: 'string' },
              documentType: { type: 'string' },
              overallGrade: { type: 'string', enum: ['A+', 'A', 'B', 'C', 'D', 'F'] },
              overallRiskScore: { type: 'integer' },
              executiveSummary: { type: 'string' },
              keyTakeaways: { type: 'array', items: { type: 'string' } },
              legalComplexityRating: { type: 'string' },
              ambiguityRating: { type: 'string' },
              riskCounts: {
                type: 'object',
                properties: {
                  critical: { type: 'integer' },
                  high: { type: 'integer' },
                  medium: { type: 'integer' },
                  low: { type: 'integer' },
                },
                required: ['critical', 'high', 'medium', 'low'],
              },
              rightsMatrix: {
                type: 'object',
                properties: {
                  rightsYouGiveUp: { type: 'array', items: { type: 'string' } },
                  rightsCompanyClaims: { type: 'array', items: { type: 'string' } },
                },
                required: ['rightsYouGiveUp', 'rightsCompanyClaims'],
              },
              optOutActions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    action: { type: 'string' },
                    deadlineOrMethod: { type: 'string' },
                  },
                  required: ['title', 'action'],
                },
              },
              redFlags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    category: { type: 'string' },
                    riskLevel: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
                    title: { type: 'string' },
                    plainSummary: { type: 'string' },
                    exactQuote: { type: 'string' },
                    actionableAdvice: { type: 'string' },
                    sectionReference: { type: 'string' },
                  },
                  required: ['id', 'category', 'riskLevel', 'title', 'plainSummary'],
                },
              },
              goodPractices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                  required: ['title', 'description'],
                },
              },
            },
            required: [
              'documentName',
              'overallGrade',
              'overallRiskScore',
              'executiveSummary',
              'keyTakeaways',
              'riskCounts',
              'rightsMatrix',
              'redFlags',
              'goodPractices',
            ],
          },
          temperature: 0.0,
          seed: 42,
        },
      });

      if (response.text) {
        responseText = response.text;
        try {
          parsedReport = extractAndParseJson<AnalysisReport>(responseText);
          if (parsedReport) break;
        } catch (parseErr) {
          console.warn(`JSON parse failed on model ${modelName}, trying fallback model...`);
        }
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} error: ${err.message}. Trying next model...`);
    }
  }

  if (!parsedReport) {
    if (responseText) {
      try {
        parsedReport = extractAndParseJson<AnalysisReport>(responseText);
      } catch (parseErr: any) {
        throw new Error(`Failed to parse AI audit response: ${parseErr.message}`);
      }
    } else {
      throw new Error(lastError?.message || 'Failed to analyze document with Gemini AI.');
    }
  }

  const finalReport: AnalysisReport = {
    ...parsedReport,
    readingTimeMinutes,
    wordCount,
  };

  // 3. Cache report for deterministic future lookups
  setCachedReport(cacheKey, finalReport);

  return finalReport;
}
