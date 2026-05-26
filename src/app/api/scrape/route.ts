import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const results = await runAllScrapers();
    return NextResponse.json({
      status: 'ok',
      muzzled: results.muzzled,
      yohomo: results.yohomo,
    });
  } catch (error: any) {
    console.error('Scraper error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    const sources = db.prepare('SELECT * FROM event_sources ORDER BY name').all();
    const logs = db.prepare('SELECT * FROM scrape_log ORDER BY scraped_at DESC LIMIT 10').all();
    return NextResponse.json({ sources, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}