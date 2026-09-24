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

  // Use stable, consistent primary model first for determinism
  const preferredModels = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'deepseek-r1-distill-llama-70b',
  ];

  let completion: any = null;
  let lastError: any = null;

  for (const modelName of preferredModels) {
    try {
      completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.0, // Zero temperature for reproducible, deterministic outputs
        seed: 42,         // Seed for consistent sampling
        response_format: { type: 'json_object' },
      });
      if (completion?.choices?.[0]?.message?.content) {
        break; // Success!
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Groq model ${modelName} returned error: ${err.message}. Trying fallback model...`);
    }
  }

  if (!completion?.choices?.[0]?.message?.content) {
    throw new Error(lastError?.message || 'Failed to complete analysis with available Groq models.');
  }

  const responseContent = completion.choices[0].message.content;

  const parsedData = JSON.parse(responseContent);
  return {
    ...parsedData,
    readingTimeMinutes,
    wordCount,
  } as AnalysisReport;
}
