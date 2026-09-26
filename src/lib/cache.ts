import crypto from 'crypto';
import { AnalysisReport } from '@/types/analyzer';
import { ScrapeResult } from '@/lib/scraper';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL
const MAX_CACHE_ENTRIES = 500;

// Global in-memory stores
const reportCache = new Map<string, CacheEntry<AnalysisReport>>();
const scrapeCache = new Map<string, CacheEntry<ScrapeResult>>();

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key.trim().toLowerCase()).digest('hex');
}

function pruneOldest<T>(map: Map<string, CacheEntry<T>>) {
  if (map.size > MAX_CACHE_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) map.delete(oldestKey);
  }
}

export function getCachedReport(key: string): AnalysisReport | null {
  const hash = hashKey(key);
  const entry = reportCache.get(hash);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    reportCache.delete(hash);
    return null;
  }
  return entry.data;
}

export function setCachedReport(key: string, data: AnalysisReport): void {
  const hash = hashKey(key);
  pruneOldest(reportCache);
  reportCache.set(hash, {
    data,
    timestamp: Date.now(),
  });
}

export function getCachedScrape(url: string): ScrapeResult | null {
  const hash = hashKey(url);
  const entry = scrapeCache.get(hash);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    scrapeCache.delete(hash);
    return null;
  }
  return entry.data;
}

export function setCachedScrape(url: string, data: ScrapeResult): void {
  const hash = hashKey(url);
  pruneOldest(scrapeCache);
  scrapeCache.set(hash, {
    data,
    timestamp: Date.now(),
  });
}
