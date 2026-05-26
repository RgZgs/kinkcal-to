import { NextResponse } from 'next/server';
import { events } from '@/lib/data';
import { classifyEvent, isFutureDate, validateYear, generateSearchQueries } from '@/lib/scraper';
import { readFile } from 'fs/promises';
import path from 'path';

interface ReportEntry {
  id: string;
  title: string;
  source: string;
  start_time: string;
  category_slugs: string[];
  is_verified: boolean;
  verification_notes: string[];
  search_queries: string[];
  classification: { isKink: boolean; confidence: number; reason: string };
  date_valid: boolean;
  year_valid: boolean;
  is_future: boolean;
}

export async function GET() {
  const report: ReportEntry[] = [];
  
  for (const event of events) {
    const notes: string[] = [];
    const queries = generateSearchQueries(event.title);
    const classification = classifyEvent(event.title, event.description, event.category_slugs);
    const isFuture = isFutureDate(event.start_time);
    const yearCheck = validateYear(event.start_time);

    // Check if event has a verifiable URL
    const hasUrl = event.url && event.url !== '' && event.url !== '#';
    const sourceIsReliable = ['yohomo.ca', 'getmuzzled.ca', 'pitbullevents.com', 'impulseto.com', 'bluf.com', 'pridetoronto.com', 'lybertine.com'].some(s => event.source.includes(s));

    if (!hasUrl) notes.push('No URL provided — cannot verify listing');
    if (!sourceIsReliable && event.source === 'community') notes.push('Source is "community" — needs manual verification');
    if (event.source === 'instagram') notes.push('Source is Instagram — link may be stale, verify manually');
    if (!isFuture) notes.push('Event date is in the past');
    if (!yearCheck.valid) notes.push(yearCheck.note);
    if (classification.confidence < 0.7 && classification.isKink) notes.push(`Low kink confidence (${(classification.confidence * 100).toFixed(0)}%) — may not qualify`);
    if (!classification.isKink) notes.push(`Not classified as kink: ${classification.reason}`);

    // An event is "unverified" if it has any notes, or lacks a reliable source
    const isVerified = notes.length === 0 && hasUrl && sourceIsReliable && isFuture && yearCheck.valid === true;

    report.push({
      id: event.id,
      title: event.title,
      source: event.source,
      start_time: event.start_time,
      category_slugs: event.category_slugs,
      is_verified: isVerified as boolean,
      verification_notes: notes,
      search_queries: queries,
      classification,
      date_valid: yearCheck.valid as boolean,
      year_valid: yearCheck.valid as boolean,
      is_future: isFuture,
    });
  }

  // Also check for new submissions
  let submissions: any[] = [];
  try {
    const subData = await readFile(path.join(process.cwd(), 'data', 'submissions.json'), 'utf-8');
    submissions = JSON.parse(subData).filter((s: any) => s.status === 'pending');
  } catch {
    // no submissions file
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total_events: events.length,
    verified: report.filter(r => r.is_verified).length,
    unverified: report.filter(r => !r.is_verified).length,
    past_events: report.filter(r => !r.is_future).length,
    pending_submissions: submissions.length,
    events: report,
    submissions,
  });
}