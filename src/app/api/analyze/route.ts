import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalDocument } from '@/lib/groq';

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

    const report = await analyzeLegalDocument(text, documentName || 'Legal Document', apiKey);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during analysis.' },
      { status: 500 }
    );
  }
}
