import { NextRequest, NextResponse } from 'next/server';
import { rejectSubmission } from '@/lib/db';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const submissionId = Number(formData.get('submission_id'));
  
  if (!submissionId) {
    return NextResponse.redirect(new URL('/admin?error=missing_id', request.url));
  }

  rejectSubmission(submissionId);
  return NextResponse.redirect(new URL('/admin?rejected=true', request.url));
}