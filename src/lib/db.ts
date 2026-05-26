import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'calendar.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  migrate(_db);
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '',
      color TEXT DEFAULT '#8B5CF6',
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      venue TEXT DEFAULT '',
      address TEXT DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT,
      url TEXT DEFAULT '',
      source TEXT DEFAULT '',
      approved INTEGER DEFAULT 0,
      recurring_rule TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      created_by TEXT DEFAULT '',
      source_url TEXT DEFAULT '',
      source_name TEXT DEFAULT '',
      external_id TEXT DEFAULT '',
      recurrence TEXT DEFAULT '',
      recurrence_label TEXT DEFAULT '',
      is_recurring INTEGER DEFAULT 0,
      parent_event_id INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS event_categories (
      event_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (event_id, category_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      venue TEXT DEFAULT '',
      address TEXT DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT,
      url TEXT DEFAULT '',
      source TEXT DEFAULT '',
      category_slugs TEXT DEFAULT '',
      submitted_by TEXT DEFAULT '',
      submitted_at TEXT DEFAULT (datetime('now')),
      approved INTEGER DEFAULT 0,
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS event_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      scraper_type TEXT NOT NULL DEFAULT 'manual',
      last_scraped_at TEXT,
      last_scrape_status TEXT DEFAULT '',
      last_scrape_count INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scrape_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL,
      scraped_at TEXT DEFAULT (datetime('now')),
      events_found INTEGER DEFAULT 0,
      events_added INTEGER DEFAULT 0,
      events_updated INTEGER DEFAULT 0,
      status TEXT DEFAULT '',
      error TEXT DEFAULT '',
      FOREIGN KEY (source_id) REFERENCES event_sources(id)
    );
  `);

  // Seed categories if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO categories (slug, name, emoji, color, description) VALUES (?, ?, ?, ?, ?)');
    const categories = [
      ['circuit', 'Circuit Party', '🔊', '#E11D48', 'Circuit parties, dance events, big beats'],
      ['leather', 'Leather', '🧥', '#1E1E1E', 'Leather events, leather bars, leather contests'],
      ['latex', 'Latex / Rubber', '🖤', '#0EA5E9', 'Latex and rubber events, dress codes'],
      ['bdsm', 'BDSM / Kink', '⛓️', '#7C3AED', 'BDSM demos, munches, play parties, workshops'],
      ['puppy', 'Puppy Play', '🐕', '#F59E0B', 'Puppy play events, moshes, socials'],
      ['furry', 'Furry', '🐾', '#10B981', 'Furry meetups, socials, events'],
      ['drag', 'Drag', '💄', '#EC4899', 'Drag shows, drag queen events, drag king nights'],
      ['bear', 'Bear', '🐻', '#92400E', 'Bear events, bear socials, bear runs'],
      ['fetish', 'Fetish Night', '🔥', '#DC2626', 'General fetish nights, dress-code parties'],
      ['underwear', 'Underwear', '🩲', '#6366F1', 'Underwear parties, underwear nights'],
      ['cruising', 'Cruising', '👀', '#059669', 'Cruising events, dark rooms, saunas'],
      ['social', 'Social / Mixer', '🍻', '#6B7280', 'Social events, meetups, mixers, brunches'],
      ['workshop', 'Workshop / Education', '📚', '#8B5CF6', 'Educational workshops, skill-sharing, demos'],
      ['pride', 'Pride', '🌈', '#F43F5E', 'Pride events, pride month activities'],
      ['pet-play', 'Pet Play', '🐾', '#D97706', 'Pet play, puppy, kitten, pony play events'],
      ['bluf', 'BLUF', '🔵', '#2563EB', 'BLUF (Brotherhood of Leather Uniforms) events'],
    ];
    for (const [slug, name, emoji, color, desc] of categories) {
      insert.run(slug, name, emoji, color, desc);
    }
  }

  // Seed event sources if empty
  const srcCount = db.prepare('SELECT COUNT(*) as c FROM event_sources').get() as { c: number };
  if (srcCount.c === 0) {
    const insertSrc = db.prepare('INSERT INTO event_sources (name, url, scraper_type) VALUES (?, ?, ?)');
    insertSrc.run('Muzzled (getmuzzled.ca)', 'https://www.getmuzzled.ca', 'muzzled');
    insertSrc.run('YoHomo Toronto', 'https://www.yohomo.ca/event/', 'yohomo');
  }
}

// --- Recurrence Engine ---

export interface RecurrenceSpec {
  pattern: 'monthly-nth-weekday' | 'monthly-day' | 'weekly' | 'once';
  weekday?: number;    // 0=Sun, 1=Mon, ..., 6=Sat
  nth?: number;        // 1=first, 2=second, ..., -1=last
  monthDay?: number;   // day of month for monthly-day
  time?: string;       // HH:MM
  durationHours?: number;
}

export function parseRecurrence(label: string, recurrence: string): RecurrenceSpec | null {
  if (!recurrence) return null;
  // Format: "nth-weekday:N" e.g. "1-6" = first Saturday, "3-5" = third Friday
  // Or: "monthly:D" e.g. "monthly:15" = 15th of every month
  // Or: "weekly:N" e.g. "weekly:6" = every Saturday
  
  if (recurrence.startsWith('nth-weekday:')) {
    const parts = recurrence.replace('nth-weekday:', '').split('-');
    return { pattern: 'monthly-nth-weekday', nth: parseInt(parts[0]), weekday: parseInt(parts[1]) };
  }
  if (recurrence.startsWith('monthly:')) {
    return { pattern: 'monthly-day', monthDay: parseInt(recurrence.split(':')[1]) };
  }
  if (recurrence.startsWith('weekly:')) {
    return { pattern: 'weekly', weekday: parseInt(recurrence.split(':')[1]) };
  }
  return null;
}

export function expandRecurringDates(recurrence: string, fromDate: Date, toDate: Date): Date[] {
  const spec = parseRecurrence('', recurrence);
  if (!spec) return [];
  
  const dates: Date[] = [];
  const current = new Date(fromDate);
  
  if (spec.pattern === 'monthly-nth-weekday' && spec.weekday !== undefined && spec.nth !== undefined) {
    // Walk each month
    current.setDate(1);
    while (current <= toDate) {
      const nthDate = getNthWeekdayOfMonth(current.getFullYear(), current.getMonth(), spec.weekday, spec.nth);
      if (nthDate && nthDate >= fromDate && nthDate <= toDate) {
        dates.push(nthDate);
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else if (spec.pattern === 'monthly-day' && spec.monthDay !== undefined) {
    current.setDate(1);
    while (current <= toDate) {
      const day = new Date(current.getFullYear(), current.getMonth(), spec.monthDay);
      if (day >= fromDate && day <= toDate) {
        dates.push(day);
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else if (spec.pattern === 'weekly' && spec.weekday !== undefined) {
    // Find first matching weekday
    current.setDate(current.getDate() + ((spec.weekday - current.getDay() + 7) % 7 || 7));
    if (current < fromDate) {
      current.setDate(current.getDate() + 7);
    }
    while (current <= toDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  }
  
  return dates;
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const dayOffset = (weekday - firstWeekday + 7) % 7;
  const firstOccurrence = 1 + dayOffset;
  
  if (nth > 0) {
    const day = firstOccurrence + (nth - 1) * 7;
    if (day > new Date(year, month + 1, 0).getDate()) return null;
    return new Date(year, month, day);
  }
  // nth = -1 means last
  const lastDay = new Date(year, month + 1, 0).getDate();
  const lastOccurrence = firstOccurrence + Math.floor((lastDay - firstOccurrence) / 7) * 7;
  return new Date(year, month, lastOccurrence);
}

// --- Queries ---

export function getApprovedEvents(categorySlug?: string): any[] {
  const db = getDb();
  let sql = `
    SELECT e.*, GROUP_CONCAT(c.slug) as category_slugs, GROUP_CONCAT(c.emoji) as category_emojis
    FROM events e
    LEFT JOIN event_categories ec ON e.id = ec.event_id
    LEFT JOIN categories c ON ec.category_id = c.id
    WHERE e.approved = 1 AND e.parent_event_id = 0
  `;
  const params: any[] = [];
  if (categorySlug) {
    sql += ` AND c.slug = ?`;
    params.push(categorySlug);
  }
  sql += ` GROUP BY e.id ORDER BY e.start_time ASC`;
  return db.prepare(sql).all(...params);
}

export function getUpcomingEvents(days: number = 90): any[] {
  const db = getDb();
  const allEvents: any[] = [];
  
  // Get one-off events
  const oneOffs = db.prepare(`
    SELECT e.*, GROUP_CONCAT(c.slug) as category_slugs, GROUP_CONCAT(c.emoji) as category_emojis
    FROM events e
    LEFT JOIN event_categories ec ON e.id = ec.event_id
    LEFT JOIN categories c ON ec.category_id = c.id
    WHERE e.approved = 1 AND (e.is_recurring = 0 OR e.is_recurring IS NULL OR e.is_recurring = 0) AND e.parent_event_id = 0
    GROUP BY e.id
    HAVING e.start_time >= datetime('now', '-1 day')
    ORDER BY e.start_time ASC
    LIMIT 100
  `).all();
  allEvents.push(...oneOffs);
  
  // Get recurring templates and expand them
  const recurring = db.prepare(`
    SELECT e.*, GROUP_CONCAT(c.slug) as category_slugs, GROUP_CONCAT(c.emoji) as category_emojis
    FROM events e
    LEFT JOIN event_categories ec ON e.id = ec.event_id
    LEFT JOIN categories c ON ec.category_id = c.id
    WHERE e.approved = 1 AND e.is_recurring = 1
    GROUP BY e.id
  `).all();
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  for (const t of recurring as any[]) {
    if (!t.recurrence) continue;
    const dates = expandRecurringDates(t.recurrence, now, futureDate);
    
    // Parse the time from the template's start_time
    const templateStart = new Date(t.start_time);
    const templateEnd = t.end_time ? new Date(t.end_time) : null;
    const startHour = templateStart.getHours();
    const startMin = templateStart.getMinutes();
    const durationMs = templateEnd ? templateEnd.getTime() - templateStart.getTime() : 3 * 60 * 60 * 1000;
    
    for (const date of dates) {
      const startTime = new Date(date);
      startTime.setHours(startHour, startMin, 0);
      const endTime = new Date(startTime.getTime() + durationMs);
      
      allEvents.push({
        ...t,
        id: `${t.id}-${date.toISOString().slice(0, 10)}`,
        start_time: startTime.toISOString().replace('Z', '').replace(/\.000/, ''),
        end_time: endTime.toISOString().replace('Z', '').replace(/\.000/, ''),
        is_expanded: true,
        recurrence_note: t.recurrence_label || t.recurrence,
      });
    }
  }
  
  // Sort all events by start_time
  allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  return allEvents;
}

export function getCategories(): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

export function getCategoryBySlug(slug: string): any | null {
  const db = getDb();
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
}

export function createEvent(data: {
  title: string;
  description?: string;
  venue?: string;
  address?: string;
  start_time: string;
  end_time?: string;
  url?: string;
  source?: string;
  category_slugs: string[];
  approved?: boolean;
  created_by?: string;
  source_url?: string;
  source_name?: string;
  external_id?: string;
  recurrence?: string;
  recurrence_label?: string;
  is_recurring?: boolean;
}): number {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO events (title, description, venue, address, start_time, end_time, url, source, approved, created_by, source_url, source_name, external_id, recurrence, recurrence_label, is_recurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(
    data.title,
    data.description || '',
    data.venue || '',
    data.address || '',
    data.start_time,
    data.end_time || null,
    data.url || '',
    data.source || '',
    data.approved ? 1 : 0,
    data.created_by || '',
    data.source_url || '',
    data.source_name || '',
    data.external_id || '',
    data.recurrence || '',
    data.recurrence_label || '',
    data.is_recurring ? 1 : 0,
  );
  const eventId = result.lastInsertRowid as number;

  // Link categories
  const linkStmt = db.prepare('INSERT OR IGNORE INTO event_categories (event_id, category_id) VALUES (?, ?)');
  for (const slug of data.category_slugs) {
    const cat = getCategoryBySlug(slug);
    if (cat) linkStmt.run(eventId, cat.id);
  }

  return eventId;
}

export function approveEvent(eventId: number): void {
  const db = getDb();
  db.prepare('UPDATE events SET approved = 1 WHERE id = ?').run(eventId);
}

export function deleteEvent(eventId: number): void {
  const db = getDb();
  db.prepare('DELETE FROM event_categories WHERE event_id = ?').run(eventId);
  db.prepare('DELETE FROM events WHERE id = ?').run(eventId);
}

export function findEventByExternalId(externalId: string): any | null {
  const db = getDb();
  return db.prepare('SELECT * FROM events WHERE external_id = ?').get(externalId);
}

export function updateEvent(id: number, data: Record<string, any>): void {
  const db = getDb();
  const fields = Object.keys(data);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);
  db.prepare(`UPDATE events SET ${setClause} WHERE id = ?`).run(...values, id);
}

export function createSubmission(data: {
  title: string;
  description?: string;
  venue?: string;
  address?: string;
  start_time: string;
  end_time?: string;
  url?: string;
  source?: string;
  category_slugs: string;
  submitted_by?: string;
}): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO submissions (title, description, venue, address, start_time, end_time, url, source, category_slugs, submitted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title,
    data.description || '',
    data.venue || '',
    data.address || '',
    data.start_time,
    data.end_time || null,
    data.url || '',
    data.source || '',
    data.category_slugs,
    data.submitted_by || ''
  );
  return result.lastInsertRowid as number;
}

export function getPendingSubmissions(): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions WHERE approved = 0 ORDER BY submitted_at DESC').all();
}

export function approveSubmission(submissionId: number): number | null {
  const db = getDb();
  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId) as any;
  if (!sub) return null;
  
  const eventId = createEvent({
    title: sub.title,
    description: sub.description,
    venue: sub.venue,
    address: sub.address,
    start_time: sub.start_time,
    end_time: sub.end_time,
    url: sub.url,
    source: sub.source,
    category_slugs: sub.category_slugs.split(',').map((s: string) => s.trim()).filter(Boolean),
    approved: true,
    created_by: sub.submitted_by || 'community',
  });

  db.prepare('UPDATE submissions SET approved = 1, reviewed_at = datetime(\'now\') WHERE id = ?').run(submissionId);
  return eventId;
}

export function rejectSubmission(submissionId: number): void {
  const db = getDb();
  db.prepare('UPDATE submissions SET approved = -1, reviewed_at = datetime(\'now\') WHERE id = ?').run(submissionId);
}

// --- Scraper helpers ---

export function getEventSources(): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM event_sources WHERE enabled = 1').all();
}

export function logScrape(sourceId: number, found: number, added: number, updated: number, status: string, error?: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO scrape_log (source_id, events_found, events_added, events_updated, status, error)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sourceId, found, added, updated, status, error || '');
  db.prepare('UPDATE event_sources SET last_scraped_at = datetime(\'now\'), last_scrape_status = ?, last_scrape_count = ? WHERE id = ?')
    .run(status, found, sourceId);
}