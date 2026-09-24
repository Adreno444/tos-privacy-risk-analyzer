import { GoogleGenAI } from '@google/genai';
import { AnalysisReport } from '@/types/analyzer';

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

  const ai = new GoogleGenAI({ apiKey });

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const truncatedText = text.length > 300000 ? text.slice(0, 300000) + '\n\n[Document truncated]' : text;

  const systemPrompt = `You are an elite legal-tech auditor, consumer rights defender, and cybersecurity/privacy analyst.
Your mission is to perform an exhaustive, unforgiving, and deeply objective analysis of Terms of Service (ToS), Privacy Policies, End User License Agreements (EULAs), and SaaS Contracts.

Identify clauses related to:
1. Data Selling, Monetization, Telemetry, and Third-Party Sharing (data brokers, ad networks).
2. Forced Mandatory Arbitration, Class Action Waivers, and loss of Jury Trial rights.
3. Intellectual Property Overreach (perpetual, irrevocable, royalty-free commercial licenses to user content).
4. Unilateral Modification Rights (changing terms, pricing, or data practices at will without notice).
5. Dark Patterns, Hidden Auto-Renewals, Buried Cancellation Fees, and billing traps.
6. Broad Liability Disclaimers and Asymmetric Indemnification Clauses.
7. Arbitrary Account Termination and Content Deletion without recourse.
8. AI Training on User Data (using user data, prompts, or files to train proprietary AI/ML models).

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

Return strictly valid JSON matching this schema:
{
  "documentName": string,
  "documentType": "Terms of Service" | "Privacy Policy" | "EULA" | "Other Legal Document",
  "overallGrade": "A+" | "A" | "B" | "C" | "D" | "F",
  "overallRiskScore": number,
  "executiveSummary": string,
  "keyTakeaways": [string, string, string],
  "riskCounts": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "redFlags": [
    {
      "id": string,
      "category": "Data Selling & Tracking" | "Forced Arbitration & Legal Waivers" | "Intellectual Property Ownership" | "Unilateral Policy Changes" | "Dark Patterns & Auto-Renewals" | "Broad Liability & Indemnity" | "Account Termination & Content Deletion" | "AI Training on User Data",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": string,
      "plainSummary": string,
      "exactQuote": string,
      "actionableAdvice": string
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

Provide your structured audit in the requested JSON format.`;

  // Dynamically query available models from Gemini API
  let activeModels: string[] = [];
  try {
    const list = await ai.models.list();
    for await (const m of list) {
      const name = m.name?.replace(/^models\//, '') || '';
      if (name && (name.includes('flash') || name.includes('pro') || name.includes('gemini'))) {
        activeModels.push(name);
      }
    }

    // Sort to prioritize flash models, then pro models
    activeModels.sort((a, b) => {
      const score = (n: string) => {
        const lower = n.toLowerCase();
        if (lower.includes('flash') && lower.includes('2.5')) return 100;
        if (lower.includes('flash') && lower.includes('1.5')) return 90;
        if (lower.includes('flash')) return 80;
        if (lower.includes('pro')) return 70;
        return 50;
      };
      return score(b) - score(a);
    });
  } catch (err: any) {
    console.warn('Gemini models.list failed, using standard list:', err.message);
  }

  if (activeModels.length === 0) {
    activeModels = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-pro',
    ];
  }

  let responseText: string | null = null;
  let lastError: any = null;

  for (const modelName of activeModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.0,
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

  const parsedData = JSON.parse(responseText);
  return {
    ...parsedData,
    readingTimeMinutes,
    wordCount,
  } as AnalysisReport;
}
