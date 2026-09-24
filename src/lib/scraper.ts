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
  const contentElement = $('main, article, .content, .legal-content, .terms-content, .privacy-policy, .entry-content, #content, .container, .page-content');
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

async function fetchPage(url: string, timeoutMs: number = 8000): Promise<{ html: string; finalUrl: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
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
  ];
  let matches = 0;
  for (const marker of legalMarkers) {
    if (lower.includes(marker)) matches++;
  }
  return matches >= 2 && text.length > 800;
}

export async function scrapeLegalTextFromUrl(targetUrl: string): Promise<ScrapeResult> {
  const normalized = normalizeUrl(targetUrl);
  const parsedUrl = new URL(normalized);

  // 1. Fetch the target URL
  const initialFetch = await fetchPage(normalized);
  if (!initialFetch) {
    throw new Error(`Could not access or connect to ${normalized}. Please check the URL or paste the legal text directly.`);
  }

  const $ = cheerio.load(initialFetch.html);
  const initialTitle = $('title').text().trim() || parsedUrl.hostname;
  const initialText = cleanHtmlToText($);
  const discoveredPages: DiscoveredPage[] = [];

  // Check if initial page is already a heavy legal document
  if (isLikelyLegalDocument(initialText) && initialText.length > 1500) {
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
      // Keep only HTTP(S) and avoid re-adding identical URLs
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

  // If no links discovered from anchor tags, try fallback standard paths on the same domain
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

  // 3. Crawl discovered legal pages (Prioritize Terms + Privacy)
  // Sort priority: terms, privacy, eula, legal, cookies, acceptable-use, general
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

  // Take top 2 distinct high-priority legal documents to fetch concurrently
  const targetsToFetch = discoveredLinks.slice(0, 3);
  const fetchedDocs: { type: string; title: string; url: string; text: string }[] = [];

  await Promise.all(
    targetsToFetch.map(async (doc) => {
      const fetched = await fetchPage(doc.url);
      if (fetched) {
        const doc$ = cheerio.load(fetched.html);
        const docText = cleanHtmlToText(doc$);
        if (docText.length > 300) {
          fetchedDocs.push({
            type: doc.type,
            title: doc.title || doc$('title').text().trim() || doc.url,
            url: doc.url,
            text: docText,
          });
          discoveredPages.push({
            title: doc.title,
            url: doc.url,
            type: doc.type,
          });
        }
      }
    })
  );

  // If we found and extracted legal subpages, assemble aggregated legal document
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

  // Fallback to initial page text if it has enough content
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

  throw new Error(
    `Found no readable legal clauses or policy links on ${normalized}. Try navigating directly to the specific /terms or /privacy page, or paste the text directly.`
  );
}
