import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalDocumentWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, documentName, apiKey } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide at least 50 characters of legal text or Terms of Service content.' },
        { status: 400 }
      );
    }

    const report = await analyzeLegalDocumentWithGemini(text, documentName || 'Legal Document', apiKey);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Gemini Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during Gemini analysis.' },
      { status: 500 }
    );
  }
}
