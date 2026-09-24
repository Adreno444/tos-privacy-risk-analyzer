import { NextRequest, NextResponse } from 'next/server';
import { scrapeLegalTextFromUrl } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required.' }, { status: 400 });
    }

    const result = await scrapeLegalTextFromUrl(url);
    if (!result.text || result.text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract substantial legal text from the provided URL. Try copying and pasting the text directly.' },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch and scrape the URL.' },
      { status: 500 }
    );
  }
}
