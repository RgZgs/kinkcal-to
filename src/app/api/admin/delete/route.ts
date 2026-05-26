import { NextRequest, NextResponse } from 'next/server';
import { deleteEvent } from '@/lib/db';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const eventId = Number(formData.get('event_id'));
  
  if (!eventId) {
    return NextResponse.redirect(new URL('/admin?error=missing_id', request.url));
  }

  deleteEvent(eventId);
  return NextResponse.redirect(new URL('/admin?deleted=true', request.url));
}