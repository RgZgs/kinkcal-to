import { NextResponse } from 'next/server';
import { categories } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'KinkCal TO scraper API (static data version)',
    sources: [
      { name: 'Muzzled', url: 'https://www.getmuzzled.ca', type: 'muzzled' },
      { name: 'YoHomo', url: 'https://www.yohomo.ca', type: 'yohomo' },
      { name: 'Toronto Goth Events', url: 'https://www.torontogothevents.com', type: 'torontogothevents' },
      { name: 'Pitbull Events', url: 'https://www.pitbullevents.com', type: 'pitbull' },
      { name: 'Impulse TO', url: 'https://www.impulseto.com', type: 'impulse' },
    ],
    categories: categories.length,
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'Scraping is handled by the Pilot agent cron job. Events are added to the static data file.',
  });
}