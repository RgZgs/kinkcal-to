import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Public endpoint — returns only the COUNT of pending submissions
// No data exposed, just a number. Used by notification cron.
export async function GET() {
  try {
    const data = await readFile(path.join(process.cwd(), 'data', 'submissions.json'), 'utf-8');
    const submissions = JSON.parse(data);
    const pending = submissions.filter((s: any) => s.status === 'pending');
    return NextResponse.json({ pending_count: pending.length });
  } catch {
    return NextResponse.json({ pending_count: 0 });
  }
}