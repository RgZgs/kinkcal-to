import { NextResponse } from 'next/server';
import { generateICS } from '@/lib/ics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const icsContent = await generateICS();
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kinkcal-to.ics"',
        'Cache-Control': 'no-cache, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error generating ICS:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}