import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentText, documentName, messages } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server GROQ_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    if (!documentText || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing document text or message history.' },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    const truncatedDoc = documentText.length > 120000 ? documentText.slice(0, 120000) + '\n\n[Document truncated]' : documentText;

    const systemPrompt = `You are a consumer advocate, legal rights advisor, and privacy assistant explaining the Terms of Service / Privacy Policy for "${documentName || 'this service'}".

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

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: chatMessages as any,
      temperature: 0.2,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'I could not generate an answer based on this document.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response.' },
      { status: 500 }
    );
  }
}
