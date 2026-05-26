-- Migration: Add recurring event support
-- V2: Add recurrence rule, source tracking, and event source tables

-- Add recurring_rule to events (already exists but adding source fields)
ALTER TABLE events ADD COLUMN source_url TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN source_name TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN external_id TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN recurrence TEXT DEFAULT '';  -- e.g., "first-sat", "third-fri", "monthly-1", "weekly-tue"
ALTER TABLE events ADD COLUMN recurrence_label TEXT DEFAULT '';  -- human: "Every 1st Saturday"
ALTER TABLE events ADD COLUMN is_recurring INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN parent_event_id INTEGER DEFAULT 0;  -- 0 = template, >0 = generated instance

-- Event sources table for tracking scrapers
CREATE TABLE IF NOT EXISTS event_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  scraper_type TEXT NOT NULL DEFAULT 'manual',  -- 'muzzled', 'yohomo', 'manual', 'ical'
  last_scraped_at TEXT,
  last_scrape_status TEXT DEFAULT '',  -- 'success', 'error', 'empty'
  last_scrape_count INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Scrape log
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