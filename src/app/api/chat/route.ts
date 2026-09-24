import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

    // Dynamically query available models
    let activeModels: string[] = [];
    try {
      const list = await ai.models.list();
      for await (const m of list) {
        const name = m.name?.replace(/^models\//, '') || '';
        if (name && (name.includes('flash') || name.includes('pro') || name.includes('gemini'))) {
          activeModels.push(name);
        }
      }
      activeModels.sort((a, b) => {
        const score = (n: string) => {
          const lower = n.toLowerCase();
          if (lower.includes('flash') && lower.includes('2.5')) return 100;
          if (lower.includes('flash') && lower.includes('1.5')) return 90;
          if (lower.includes('flash')) return 80;
          return 50;
        };
        return score(b) - score(a);
      });
    } catch {
      activeModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    }

    if (activeModels.length === 0) {
      activeModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    }

    let reply: string | null = null;
    let lastError: any = null;

    for (const modelName of activeModels) {
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
