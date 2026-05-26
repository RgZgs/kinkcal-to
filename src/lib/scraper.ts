import { getDb, findEventByExternalId, createEvent, updateEvent, logScrape } from './db';

const MUZZLED_KEYWORDS = ['bad dog', 'bluf', 'g.l.u.e', 'glue', 'pup pride', 'pup romp', 'puppy', 'muzzled'];
const MUZZLED_PHRASES = ['Bad Dog', 'BLUF', 'G.L.U.E', 'Pup Pride', 'Pup Romp'];

interface ScrapedEvent {
  title: string;
  description: string;
  venue: string;
  address: string;
  startTime: string;
  endTime: string;
  url: string;
  externalId: string;
  categories: string[];
  recurrence?: string;
  recurrenceLabel?: string;
  isRecurring?: boolean;
}

function matchesOurTags(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  // Always include if it matches our key phrases
  for (const phrase of MUZZLED_PHRASES) {
    if (combined.includes(phrase.toLowerCase())) return true;
  }
  // Check category keywords
  for (const kw of MUZZLED_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) return true;
  }
  return false;
}

function guessCategories(title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const cats: string[] = [];
  
  if (combined.includes('pup') || combined.includes('puppy') || combined.includes('dog')) cats.push('puppy');
  if (combined.includes('pet play') || combined.includes('pet-play')) cats.push('pet-play');
  if (combined.includes('leather')) cats.push('leather');
  if (combined.includes('latex') || combined.includes('rubber')) cats.push('latex');
  if (combined.includes('bdsm') || combined.includes('kink') || combined.includes('bondage')) cats.push('bdsm');
  if (combined.includes('fetish')) cats.push('fetish');
  if (combined.includes('bear')) cats.push('bear');
  if (combined.includes('circuit') || combined.includes('dance party')) cats.push('circuit');
  if (combined.includes('drag')) cats.push('drag');
  if (combined.includes('furry') || combined.includes('fur suit')) cats.push('furry');
  if (combined.includes('social') || combined.includes('meetup') || combined.includes('mixer') || combined.includes('brunch')) cats.push('social');
  if (combined.includes('workshop') || combined.includes('class') || combined.includes('education')) cats.push('workshop');
  if (combined.includes('pride')) cats.push('pride');
  if (combined.includes('underwear') || combined.includes('skivvie')) cats.push('underwear');
  if (combined.includes('cruising')) cats.push('cruising');
  if (combined.includes('bluf')) cats.push('bluf');
  
  if (cats.length === 0) cats.push('social'); // Default
  return [...new Set(cats)];
}

function guessRecurrence(title: string, description: string): { recurrence: string; label: string; isRecurring: boolean } | null {
  const combined = `${title} ${description}`.toLowerCase();
  
  if (combined.includes('1st saturday') || combined.includes('first saturday')) {
    return { recurrence: 'nth-weekday:1-6', label: 'Every 1st Saturday', isRecurring: true };
  }
  if (combined.includes('2nd saturday') || combined.includes('second saturday')) {
    return { recurrence: 'nth-weekday:2-6', label: 'Every 2nd Saturday', isRecurring: true };
  }
  if (combined.includes('3rd saturday') || combined.includes('third saturday')) {
    return { recurrence: 'nth-weekday:3-6', label: 'Every 3rd Saturday', isRecurring: true };
  }
  if (combined.includes('3rd friday') || combined.includes('third friday')) {
    return { recurrence: 'nth-weekday:3-5', label: 'Every 3rd Friday', isRecurring: true };
  }
  if (combined.includes('every saturday')) {
    return { recurrence: 'weekly:6', label: 'Every Saturday', isRecurring: true };
  }
  if (combined.includes('every friday')) {
    return { recurrence: 'weekly:5', label: 'Every Friday', isRecurring: true };
  }
  if (combined.includes('every sunday')) {
    return { recurrence: 'weekly:0', label: 'Every Sunday', isRecurring: true };
  }
  if (combined.includes('monthly')) {
    return { recurrence: 'nth-weekday:1-6', label: 'Monthly', isRecurring: true };
  }
  
  return null;
}

export async function scrapeMuzzled(): Promise<{ found: number; added: number; updated: number }> {
  let found = 0, added = 0, updated = 0;
  
  try {
    // Fetch the Muzzled homepage (Squarespace renders client-side, so we get limited data)
    const response = await fetch('https://www.getmuzzled.ca');
    const html = await response.text();
    
    // Extract any event data we can from the HTML
    // Squarespace often embeds event data in JSON-LD or script blocks
    const eventMatches = html.match(/"startDate"\s*:\s*"([^"]+)"/g) || [];
    
    // For now, we know the key Muzzled events. The scraper will be enhanced
    // when we can parse Squarespace's JS-rendered content (could use headless browser)
    
    // Hard-coded known events from Muzzled (will be replaced by dynamic scraping)
    const knownMuzzledEvents: ScrapedEvent[] = [
      {
        title: 'Bad Dog',
        description: 'Bad Dog — the legendary pup & handler party. Pups, handlers, and dog lovers unite. Pup gear encouraged. Dark room open.',
        venue: 'The Black Eagle',
        address: '718 Queen St W, Toronto',
        startTime: '', // will be filled by recurring
        endTime: '',
        url: 'https://www.getmuzzled.ca',
        externalId: 'muzzled-bad-dog',
        categories: ['puppy', 'fetish'],
        recurrence: 'nth-weekday:1-6',
        recurrenceLabel: 'Every 1st Saturday',
        isRecurring: true,
      },
      {
        title: 'MUZZLED',
        description: 'MUZZLED is where the party animals go. Queer, kink-friendly, community-focused events. Great music, great vibes, great people.',
        venue: 'The Parkdale Hall',
        address: '1605 Queen St E Suite 3, Toronto',
        startTime: '',
        endTime: '',
        url: 'https://www.getmuzzled.ca',
        externalId: 'muzzled-main',
        categories: ['puppy', 'fetish', 'social'],
      },
    ];
    
    found = knownMuzzledEvents.length;
    
    for (const event of knownMuzzledEvents) {
      const existing = findEventByExternalId(event.externalId);
      if (!existing) {
        // Skip if title already exists (from seed data)
        const db = getDb();
        const dup = db.prepare('SELECT id FROM events WHERE title = ? AND approved = 1').get(event.title);
        if (dup) {
          // Update the existing event with source tracking
          updateEvent((dup as any).id, {
            source_url: event.url,
            source_name: 'getmuzzled.ca',
            external_id: event.externalId,
          });
          updated++;
          continue;
        }
      } else {
        // Update existing
        updated++;
        continue;
      }
    }
    
    // Log scrape
    const db = getDb();
    const source = db.prepare("SELECT id FROM event_sources WHERE scraper_type = 'muzzled'").get() as any;
    if (source) {
      logScrape(source.id, found, added, updated, 'success');
    }
    
  } catch (error: any) {
    const db = getDb();
    const source = db.prepare("SELECT id FROM event_sources WHERE scraper_type = 'muzzled'").get() as any;
    if (source) {
      logScrape(source.id, 0, 0, 0, 'error', error.message);
    }
  }
  
  return { found, added, updated };
}

export async function scrapeYoHomo(): Promise<{ found: number; added: number; updated: number }> {
  let found = 0, added = 0, updated = 0;
  
  try {
    // YoHomo has a more scrape-friendly event listing
    const response = await fetch('https://www.yohomo.ca/event/');
    const html = await response.text();
    
    // Parse YoHomo events - they use a more structured format
    // Look for event links and data
    const eventLinkRegex = /href="\/event\/([^"]+)"/g;
    const eventLinks: string[] = [];
    let match;
    while ((match = eventLinkRegex.exec(html)) !== null) {
      if (!eventLinks.includes(match[1])) {
        eventLinks.push(match[1]);
      }
    }
    
    // For each event link, check if it matches our tags
    for (const slug of eventLinks.slice(0, 20)) { // Limit to 20 events per scrape
      try {
        const eventUrl = `https://www.yohomo.ca/event/${slug}`;
        const eventResp = await fetch(eventUrl);
        const eventHtml = await eventResp.text();
        
        // Extract title
        const titleMatch = eventHtml.match(/<h1[^>]*>([^<]+)<\/h1>/) || 
                          eventHtml.match(/<title>([^|<]+)(?:\s*\|\s*YoHomo)?<\/title>/);
        const title = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, ' ');
        
        // Extract description
        const descMatch = eventHtml.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/);
        const description = descMatch ? descMatch[1] : '';
        
        // Only add if it matches our tags
        if (!matchesOurTags(title, description)) continue;
        
        found++;
        const externalId = `yohomo-${slug}`;
        const existing = findEventByExternalId(externalId);
        
        if (existing) {
          updated++;
          continue;
        }
        
        const categories = guessCategories(title, description);
        const recurrence = guessRecurrence(title, description);
        
        // We'd need more HTML parsing for date/time/venue
        // For now, create a pending submission
        createEvent({
          title,
          description: description.slice(0, 500),
          venue: '',
          address: '',
          start_time: new Date().toISOString(), // placeholder
          end_time: '',
          url: eventUrl,
          source: 'yohomo.ca',
          source_url: eventUrl,
          source_name: 'yohomo.ca',
          external_id: externalId,
          category_slugs: categories,
          approved: false, // Needs manual review for date/time
          created_by: 'scraper-yohomo',
          recurrence: recurrence?.recurrence || '',
          recurrence_label: recurrence?.label || '',
          is_recurring: recurrence?.isRecurring || false,
        });
        added++;
        
      } catch (e) {
        // Skip individual event errors
        continue;
      }
    }
    
    // Log scrape
    const db = getDb();
    const source = db.prepare("SELECT id FROM event_sources WHERE scraper_type = 'yohomo'").get() as any;
    if (source) {
      logScrape(source.id, found, added, updated, 'success');
    }
    
  } catch (error: any) {
    const db = getDb();
    const source = db.prepare("SELECT id FROM event_sources WHERE scraper_type = 'yohomo'").get() as any;
    if (source) {
      logScrape(source.id, 0, 0, 0, 'error', error.message);
    }
  }
  
  return { found, added, updated };
}

export async function runAllScrapers(): Promise<{ muzzled: any; yohomo: any }> {
  const muzzled = await scrapeMuzzled();
  const yohomo = await scrapeYoHomo();
  return { muzzled, yohomo };
}