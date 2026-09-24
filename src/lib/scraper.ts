import * as cheerio from 'cheerio';

export interface DiscoveredPage {
  title: string;
  url: string;
  type: 'terms' | 'privacy' | 'eula' | 'cookies' | 'acceptable-use' | 'legal' | 'general';
}

export interface ScrapeResult {
  title: string;
  text: string;
  wordCount: number;
  sourceUrl: string;
  discoveredPages: DiscoveredPage[];
}

const LEGAL_KEYWORDS = [
  'terms',
  'tos',
  'terms-of-service',
  'terms-of-use',
  'user-agreement',
  'conditions-of-use',
  'privacy',
  'privacy-policy',
  'data-policy',
  'privacy-statement',
  'cookie-policy',
  'cookies',
  'eula',
  'end-user-license',
  'acceptable-use',
  'community-guidelines',
  'legal',
];

const STANDARD_FALLBACK_PATHS = [
  '/terms',
  '/privacy',
  '/tos',
  '/legal',
  '/terms-of-service',
  '/privacy-policy',
  '/privacy-notice',
  '/legal/terms-of-service',
  '/legal/privacy-policy',
];

function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

function cleanHtmlToText($: cheerio.CheerioAPI): string {
  // Remove noise elements
  $('script, style, noscript, nav, header, footer, iframe, svg, form, button, link, aside, .cookie-banner, .advertisement, #cookie-consent, [role="banner"], [role="navigation"]').remove();

  // Focus on main content containers if found
  const contentElement = $('main, article, .content, .legal-content, .terms-content, .privacy-policy, .entry-content, #content, .container, .page-content, .main-content');
  let rawText = '';
  if (contentElement.length > 0) {
    rawText = contentElement.text();
  } else {
    rawText = $('body').text();
  }

  return rawText
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Fetch page with realistic browser headers
 */
async function fetchDirect(url: string, timeoutMs: number = 10000): Promise<{ html: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const html = await response.text();
    return { html, finalUrl: response.url || url };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * High-reliability fallback for Cloudflare/bot-protected/SPA websites using Jina Reader
 */
async function fetchViaJinaReader(url: string, timeoutMs: number = 12000): Promise<{ text: string; title: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const rawMarkdown = await response.text();
    if (!rawMarkdown || rawMarkdown.length < 100) return null;

    // Extract title from markdown if available (e.g. Title: ...)
    let title = '';
    const titleMatch = rawMarkdown.match(/Title:\s*(.+)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Strip markdown links and clean text
    const cleaned = rawMarkdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
      .replace(/#{1,6}\s+/g, '') // remove header markers
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();

    return { text: cleaned, title };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function classifyLinkType(text: string, href: string): DiscoveredPage['type'] {
  const combined = `${text} ${href}`.toLowerCase();
  if (combined.includes('terms') || combined.includes('tos') || combined.includes('user-agreement') || combined.includes('conditions')) return 'terms';
  if (combined.includes('privacy') || combined.includes('data-policy')) return 'privacy';
  if (combined.includes('eula') || combined.includes('license')) return 'eula';
  if (combined.includes('cookie')) return 'cookies';
  if (combined.includes('acceptable') || combined.includes('guidelines')) return 'acceptable-use';
  if (combined.includes('legal')) return 'legal';
  return 'general';
}

function isLikelyLegalDocument(text: string): boolean {
  const lower = text.toLowerCase();
  const legalMarkers = [
    'these terms',
    'privacy policy',
    'terms of service',
    'terms of use',
    'arbitration',
    'indemnification',
    'limitation of liability',
    'intellectual property rights',
    'governing law',
    'personal data',
    'we collect',
    'cookie',
    'warranty disclaimer',
    'data protection',
    'user agreement',
  ];
  let matches = 0;
  for (const marker of legalMarkers) {
    if (lower.includes(marker)) matches++;
  }
  return matches >= 2 && text.length > 500;
}

export async function scrapeLegalTextFromUrl(targetUrl: string): Promise<ScrapeResult> {
  const normalized = normalizeUrl(targetUrl);
  const parsedUrl = new URL(normalized);

  // 1. Attempt Direct Fetch
  const initialFetch = await fetchDirect(normalized);
  
  if (initialFetch) {
    const $ = cheerio.load(initialFetch.html);
    const initialTitle = $('title').text().trim() || parsedUrl.hostname;
    const initialText = cleanHtmlToText($);
    const discoveredPages: DiscoveredPage[] = [];

    // Check if initial page is already a dense legal document
    if (isLikelyLegalDocument(initialText) && initialText.length > 800) {
      const wordCount = initialText.split(/\s+/).filter(Boolean).length;
      return {
        title: initialTitle,
        text: initialText,
        wordCount,
        sourceUrl: initialFetch.finalUrl,
        discoveredPages: [{
          title: initialTitle,
          url: initialFetch.finalUrl,
          type: classifyLinkType(initialTitle, initialFetch.finalUrl),
        }],
      };
    }

    // 2. Discover all legal links on the page
    const seenUrls = new Set<string>();
    const discoveredLinks: DiscoveredPage[] = [];

    $('a[href]').each((_, el) => {
      const rawHref = $(el).attr('href');
      const linkText = $(el).text().trim();
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:')) {
        return;
      }

      try {
        const resolved = new URL(rawHref, initialFetch.finalUrl).toString();
        if (!resolved.startsWith('http')) return;
        if (seenUrls.has(resolved)) return;

        const combined = `${linkText} ${rawHref}`.toLowerCase();
        const isLegal = LEGAL_KEYWORDS.some((kw) => combined.includes(kw));

        if (isLegal) {
          seenUrls.add(resolved);
          const linkType = classifyLinkType(linkText, resolved);
          discoveredLinks.push({
            title: linkText || linkType.toUpperCase(),
            url: resolved,
            type: linkType,
          });
        }
      } catch {
        // ignore invalid URL
      }
    });

    // Fallback paths if no anchor links discovered
    if (discoveredLinks.length === 0) {
      for (const path of STANDARD_FALLBACK_PATHS) {
        const fallbackUrl = new URL(path, parsedUrl.origin).toString();
        if (!seenUrls.has(fallbackUrl)) {
          seenUrls.add(fallbackUrl);
          discoveredLinks.push({
            title: path.replace('/', '').replace(/-/g, ' ').toUpperCase(),
            url: fallbackUrl,
            type: classifyLinkType(path, path),
          });
        }
      }
    }

    // 3. Crawl top discovered legal pages
    const priorityOrder: Record<DiscoveredPage['type'], number> = {
      terms: 1,
      privacy: 2,
      eula: 3,
      legal: 4,
      cookies: 5,
      'acceptable-use': 6,
      general: 7,
    };

    discoveredLinks.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
    const targetsToFetch = discoveredLinks.slice(0, 3);
    const fetchedDocs: { type: string; title: string; url: string; text: string }[] = [];

    await Promise.all(
      targetsToFetch.map(async (doc) => {
        // Try direct fetch first, fallback to Jina reader if blocked
        let docText = '';
        let docTitle = doc.title;

        const fetched = await fetchDirect(doc.url);
        if (fetched) {
          const doc$ = cheerio.load(fetched.html);
          docText = cleanHtmlToText(doc$);
          docTitle = doc.title || doc$('title').text().trim() || doc.url;
        }

        if (!docText || docText.length < 300) {
          const jinaFallback = await fetchViaJinaReader(doc.url);
          if (jinaFallback && jinaFallback.text.length > 300) {
            docText = jinaFallback.text;
            docTitle = jinaFallback.title || docTitle;
          }
        }

        if (docText.length > 300) {
          fetchedDocs.push({
            type: doc.type,
            title: docTitle,
            url: doc.url,
            text: docText,
          });
          discoveredPages.push({
            title: docTitle,
            url: doc.url,
            type: doc.type,
          });
        }
      })
    );

    if (fetchedDocs.length > 0) {
      let aggregatedText = '';
      for (const doc of fetchedDocs) {
        aggregatedText += `\n\n========================================\nDOCUMENT: ${doc.title.toUpperCase()} (${doc.type.toUpperCase()})\nSOURCE: ${doc.url}\n========================================\n\n${doc.text}\n`;
      }

      const wordCount = aggregatedText.split(/\s+/).filter(Boolean).length;
      return {
        title: `${initialTitle} (Legal Policies)`,
        text: aggregatedText.trim(),
        wordCount,
        sourceUrl: initialFetch.finalUrl,
        discoveredPages,
      };
    }

    if (initialText.length > 200) {
      const wordCount = initialText.split(/\s+/).filter(Boolean).length;
      return {
        title: initialTitle,
        text: initialText,
        wordCount,
        sourceUrl: initialFetch.finalUrl,
        discoveredPages: [{
          title: initialTitle,
          url: initialFetch.finalUrl,
          type: 'general',
        }],
      };
    }
  }

  // 4. If direct fetch completely failed or was blocked by Cloudflare/Anti-bot, use Jina Reader Fallback
  const jinaFallback = await fetchViaJinaReader(normalized);
  if (jinaFallback && jinaFallback.text.length > 200) {
    const wordCount = jinaFallback.text.split(/\s+/).filter(Boolean).length;
    const title = jinaFallback.title || parsedUrl.hostname;
    return {
      title,
      text: jinaFallback.text,
      wordCount,
      sourceUrl: normalized,
      discoveredPages: [{
        title,
        url: normalized,
        type: classifyLinkType(title, normalized),
      }],
    };
  }

  throw new Error(
    `Could not access or connect to ${normalized}. The website may be blocking automated web scrapers. Try copying and pasting the legal text into the 'Paste Text' tab.`
  );
}
