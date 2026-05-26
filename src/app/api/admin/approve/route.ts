import { NextRequest, NextResponse } from 'next/server';
import { approveSubmission } from '@/lib/db';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const submissionId = Number(formData.get('submission_id'));
  
  if (!submissionId) {
    return NextResponse.redirect(new URL('/admin?error=missing_id', request.url));
  }

  const eventId = approveSubmission(submissionId);
  
  if (!eventId) {
    return NextResponse.redirect(new URL('/admin?error=not_found', request.url));
  }

  return NextResponse.redirect(new URL('/admin?approved=true', request.url));
}