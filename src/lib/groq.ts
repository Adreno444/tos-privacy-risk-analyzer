import Groq from 'groq-sdk';
import { AnalysisReport } from '@/types/analyzer';

export async function analyzeLegalDocument(
  text: string,
  docName: string = 'Legal Agreement',
  customApiKey?: string
): Promise<AnalysisReport> {
  const apiKey = customApiKey || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please provide an API key in settings or in your .env.local file.');
  }

  const groq = new Groq({ apiKey });

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const truncatedText = text.length > 150000 ? text.slice(0, 150000) + '\n\n[Document truncated for optimal analysis]' : text;

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

Scoring Guidelines:
- overallRiskScore: 0 to 100 integer (0 = Open/consumer-friendly, 50 = Standard commercial, 75-100 = Hostile/predatory).
- overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'.

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

  // Dynamically query available models from Groq API
  let availableModels: string[] = [];
  try {
    const modelList = await groq.models.list();
    if (modelList && Array.isArray(modelList.data)) {
      // Filter out audio transcription models (whisper) and inactive models
      const textModels = modelList.data
        .filter((m: any) => m.active !== false && !m.id.toLowerCase().includes('whisper'))
        .map((m: any) => m.id);

      // Sort models: prioritize 70b models, then 8b instant, then remaining
      textModels.sort((a: string, b: string) => {
        const score = (name: string) => {
          const lower = name.toLowerCase();
          if (lower.includes('70b')) return 100;
          if (lower.includes('8b-instant') || lower.includes('llama-3.1-8b')) return 90;
          if (lower.includes('deepseek')) return 80;
          if (lower.includes('llama')) return 70;
          return 50;
        };
        return score(b) - score(a);
      });

      availableModels = textModels;
    }
  } catch (err: any) {
    console.warn('Dynamic model fetching failed, using fallback list:', err.message);
  }

  // If dynamic list is empty, use safe defaults
  if (availableModels.length === 0) {
    availableModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'];
  }

  let completion: any = null;
  let lastError: any = null;

  for (const modelName of availableModels) {
    try {
      completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      if (completion?.choices?.[0]?.message?.content) {
        break; // Success!
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Groq model ${modelName} returned error: ${err.message}. Trying next available model...`);
    }
  }

  if (!completion?.choices?.[0]?.message?.content) {
    throw new Error(lastError?.message || 'Failed to complete analysis with any active Groq model.');
  }

  const responseContent = completion.choices[0].message.content;

  const parsedData = JSON.parse(responseContent);
  return {
    ...parsedData,
    readingTimeMinutes,
    wordCount,
  } as AnalysisReport;
}
