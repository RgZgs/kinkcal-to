// Smart event scraper with split-title search, Toronto context, and future date validation
// Designed to be run by a cron job or manually

import { Event, events, categories } from './data';

export interface ScrapedEvent {
  title: string;
  description: string;
  venue: string;
  address: string;
  start_time: string;
  end_time: string;
  url: string;
  source: string;
  category_slugs: string[];
  verification_status: 'verified' | 'unverified' | 'not_found' | 'past';
  verification_notes: string;
  search_attempts: string[];
}

export interface ScrapeReport {
  generated_at: string;
  sources_checked: string[];
  total_detected: number;
  verified: number;
  unverified: number;
  not_found: number;
  past_events_filtered: number;
  events: ScrapedEvent[];
  known_event_ids: string[];
}

// Sources to scrape
export const SCRAPE_SOURCES = [
  { name: 'YoHomo', url: 'https://www.yohomo.ca/home', type: 'yohomo' },
  { name: 'Muzzled', url: 'https://www.getmuzzled.ca', type: 'muzzled' },
  { name: 'Pitbull Events', url: 'https://www.pitbullevents.com', type: 'pitbull' },
  { name: 'Impulse TO', url: 'https://www.impulseto.com', type: 'impulse' },
  { name: 'Toronto Goth Events', url: 'https://www.torontogothevents.com', type: 'goth' },
  { name: 'BLUF', url: 'https://www.bluf.com/events/', type: 'bluf' },
  { name: 'Lybertine', url: 'https://lybertine.com', type: 'lybertine' },
  { name: 'Eventbrite Toronto', url: 'https://www.eventbrite.ca/d/canada--toronto/kink/', type: 'eventbrite' },
];

// Categories that are KINK/FETISH — these are the ones we care about
const KINK_CATEGORIES = new Set([
  'circuit', 'leather', 'latex', 'bdsm', 'puppy', 'furry', 'fetish',
  'underwear', 'cruising', 'bluf', 'pet-play', 'goth', 'workshop',
]);

// Categories that are NOT kink — exclude by default
const EXCLUDED_CATEGORIES = new Set(['drag']);

// Keywords that suggest kink/fetish content
const KINK_KEYWORDS = [
  'fetish', 'kink', 'bdsm', 'leather', 'latex', 'rubber', 'puppy', 'pup',
  'handler', 'bondage', 'dom', 'sub', 'harness', 'harness-up', 'dark room',
  'cruising', 'underwear', 'jockstrap', 'bear', 'cub', 'daddy',
  'munch', 'play party', 'dungeon', 'spanking', 'rope', 'suspension',
  'fisting', 'piss', 'watersports', 'pup mosh', 'pup play', 'pet play',
  'circuit', 'circuit party', 'goth', 'industrial', 'dark alternative',
  'bluf', 'uniform', 'boot', 'neoprene', 'spandex',
];

// Keywords that suggest NOT kink (to filter out)
const NON_KINK_KEYWORDS = [
  'drag show', 'drag queen', 'drag king', 'drag brunch', 'drag performance',
  'comedy night', 'bingo', 'trivia', 'karaoke', 'cabaret',
  'family-friendly', 'all ages',
  'straight', 'hetero',
];

/**
 * Classify an event as kink or not based on title, description, and categories
 */
export function classifyEvent(title: string, description: string, categorySlugs: string[]): {
  isKink: boolean;
  confidence: number; // 0-1
  reason: string;
} {
  const text = `${title} ${description}`.toLowerCase();
  const cats = categorySlugs.map(c => c.toLowerCase());

  // Hard exclude: drag-only events
  if (cats.some(c => EXCLUDED_CATEGORIES.has(c)) && !cats.some(c => KINK_CATEGORIES.has(c))) {
    return { isKink: false, confidence: 0.9, reason: 'Excluded category (drag) with no kink categories' };
  }

  // Check for non-kink keywords
  const nonKinkHits = NON_KINK_KEYWORDS.filter(kw => text.includes(kw));
  if (nonKinkHits.length >= 2) {
    return { isKink: false, confidence: 0.7, reason: `Non-kink keywords: ${nonKinkHits.join(', ')}` };
  }

  // Check for kink categories
  const kinkCats = cats.filter(c => KINK_CATEGORIES.has(c));
  if (kinkCats.length >= 2) {
    return { isKink: true, confidence: 0.9, reason: `Kink categories: ${kinkCats.join(', ')}` };
  }

  // Check for kink keywords
  const kinkHits = KINK_KEYWORDS.filter(kw => text.includes(kw));
  if (kinkHits.length >= 2) {
    return { isKink: true, confidence: 0.85, reason: `Kink keywords: ${kinkHits.join(', ')}` };
  }
  if (kinkHits.length === 1 && kinkCats.length === 1) {
    return { isKink: true, confidence: 0.75, reason: `Kink keyword + category: ${kinkHits[0]}, ${kinkCats[0]}` };
  }
  if (kinkHits.length === 1) {
    return { isKink: true, confidence: 0.6, reason: `Single kink keyword: ${kinkHits[0]} — needs verification` };
  }

  // Pride events are included only if they have kink overlap
  if (cats.includes('pride') && kinkHits.length === 0 && kinkCats.length === 0) {
    return { isKink: false, confidence: 0.6, reason: 'Pride event with no kink indicators' };
  }

  // Bear/social events — include only if there's some kink signal
  if ((cats.includes('bear') || cats.includes('social')) && kinkHits.length === 0) {
    return { isKink: false, confidence: 0.5, reason: 'Bear/social with no kink signal — borderline' };
  }

  return { isKink: false, confidence: 0.7, reason: 'No kink indicators found' };
}

/**
 * Smart search: if full title doesn't find results, try split searches
 * E.g. "Rubber Sluts: GIMP" → try "Rubber Sluts" + "GIMP" separately
 */
export function generateSearchQueries(title: string): string[] {
  const queries: string[] = [];

  // 1. Full title + Toronto
  queries.push(`"${title}" toronto`);

  // 2. Split on common separators
  const separators = [':', '—', '–', '|', '·', ' - '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep).map(p => p.trim()).filter(p => p.length > 2);
      for (const part of parts) {
        queries.push(`"${part}" toronto kink`);
        queries.push(`"${part}" toronto event`);
      }
      break; // only split on first found separator
    }
  }

  // 3. Try without quotes for broader results
  queries.push(`${title} toronto`);

  // 4. Remove special characters and retry
  const cleaned = title.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned !== title) {
    queries.push(`${cleaned} toronto kink`);
  }

  // Deduplicate while preserving order
  return [...new Set(queries)];
}

/**
 * Validate that an event date is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  const eventDate = new Date(dateStr);
  const now = new Date();
  // Give 24h grace period for events that ended today
  now.setDate(now.getDate() - 1);
  return eventDate >= now;
}

/**
 * Validate that the year in the date matches the expected year
 * (catches events scraped with wrong year, e.g. 2025 instead of 2026)
 */
export function validateYear(dateStr: string): { valid: boolean; year: number; note: string } {
  const year = new Date(dateStr).getFullYear();
  const currentYear = new Date().getFullYear();
  
  if (year < currentYear) {
    return { valid: false, year, note: `Date is in the past (year ${year}, current ${currentYear})` };
  }
  if (year > currentYear + 1) {
    return { valid: false, year, note: `Date is too far in the future (year ${year}) — likely wrong` };
  }
  return { valid: true, year, note: 'Year is valid' };
}

/**
 * Generate an unverified events report
 */
export function generateReport(detectedEvents: ScrapedEvent[]): ScrapeReport {
  const now = new Date().toISOString();
  const knownIds = events.map(e => e.id);
  
  const verified = detectedEvents.filter(e => e.verification_status === 'verified');
  const unverified = detectedEvents.filter(e => e.verification_status === 'unverified');
  const notFound = detectedEvents.filter(e => e.verification_status === 'not_found');
  const past = detectedEvents.filter(e => e.verification_status === 'past');

  return {
    generated_at: now,
    sources_checked: SCRAPE_SOURCES.map(s => s.name),
    total_detected: detectedEvents.length,
    verified: verified.length,
    unverified: unverified.length,
    not_found: notFound.length,
    past_events_filtered: past.length,
    events: detectedEvents,
    known_event_ids: knownIds,
  };
}