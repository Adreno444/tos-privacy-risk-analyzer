import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Uploaded file must be a PDF.' }, { status: 400 });
    }

    // Limit file size to 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 15MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(new Uint8Array(arrayBuffer));

    const cleanedText = Array.isArray(text) ? text.join('\n\n') : String(text);
    const trimmed = cleanedText.trim();

    if (!trimmed || trimmed.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF. It might be scanned image-only.' },
        { status: 422 }
      );
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const docName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

    return NextResponse.json({
      documentName: docName,
      text: trimmed,
      totalPages,
      wordCount,
    });
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process the PDF file.' },
      { status: 500 }
    );
  }
}
