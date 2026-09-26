import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3-flash-lite'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentText, documentName, messages } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server GEMINI_API_KEY is not configured in Vercel environment variables.' },
        { status: 500 }
      );
    }

    if (!documentText || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing document text or message history.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const truncatedDoc = documentText.length > 200000 ? documentText.slice(0, 200000) + '\n\n[Document truncated]' : documentText;

    const systemInstruction = `You are a consumer advocate, legal rights advisor, and privacy assistant explaining the Terms of Service / Privacy Policy for "${documentName || 'this service'}".

DOCUMENT CONTEXT:
---
${truncatedDoc}
---

INSTRUCTIONS:
1. Answer the user's question directly, clearly, and concisely in plain English.
2. Ground your answer strictly in the provided document. If a clause exists, cite or quote the relevant terms.
3. If the document does NOT mention what the user asks about, explicitly clarify that the text makes no mention of it.
4. Highlight any hidden traps, consumer risks, or opt-out steps relevant to their question.
5. Use markdown formatting (bolding, bullet points) for readability.`;

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    let reply: string | null = null;
    let lastError: any = null;

    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            { role: 'user', parts: [{ text: systemInstruction + '\n\nUser question: ' + lastUserMessage }] },
          ],
          config: {
            temperature: 0.2,
          },
        });

        if (response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini Chat model ${modelName} failed:`, err.message);
      }
    }

    if (!reply) {
      throw new Error(lastError?.message || 'I could not generate an answer based on this document.');
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response with Gemini.' },
      { status: 500 }
    );
  }
}
