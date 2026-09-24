import * as cheerio from 'cheerio';

export async function scrapeLegalTextFromUrl(targetUrl: string): Promise<{ title: string; text: string; wordCount: number }> {
  try {
    const urlObj = new URL(targetUrl);
    
    const response = await fetch(urlObj.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, noscript, nav, header, footer, iframe, svg, form, button, link, aside, .cookie-banner, .advertisement, #cookie-consent').remove();

    // Prioritize main content containers if present
    const contentElement = $('main, article, .content, .legal-content, .terms-content, .privacy-policy, #content, .container');
    
    let rawText = '';
    if (contentElement.length > 0) {
      rawText = contentElement.text();
    } else {
      rawText = $('body').text();
    }

    // Clean up excessive whitespace and blank lines
    const cleanedText = rawText
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    const title = $('title').text().trim() || urlObj.hostname;
    const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

    return {
      title,
      text: cleanedText,
      wordCount,
    };
  } catch (error: any) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
}
