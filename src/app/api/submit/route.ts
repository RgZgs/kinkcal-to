import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission, notifySubmission, getSubmissions, updateSubmissionStatus } from '@/lib/submissions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    
    if (!title?.trim()) {
      return NextResponse.redirect(new URL('/submit?error=missing_title', request.url));
    }

    const submission = await saveSubmission({
      title: title.trim(),
      description: (formData.get('description') as string) || '',
      venue: (formData.get('venue') as string) || '',
      address: (formData.get('address') as string) || '',
      start_time: (formData.get('start_time') as string) || '',
      url: (formData.get('url') as string) || '',
      categories: formData.getAll('categories') as string[],
      recurrence: (formData.get('recurrence') as string) || '',
    });

    // Fire and forget notification
    notifySubmission(submission).catch(() => {});

    return NextResponse.redirect(new URL('/submit/success', request.url));
  } catch (error) {
    console.error('Error submitting event:', error);
    return NextResponse.redirect(new URL('/submit?error=server', request.url));
  }
}

// GET: list submissions for admin
export async function GET() {
  const subs = await getSubmissions();
  return NextResponse.json({ submissions: subs });
}

// PATCH: approve or reject a submission
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await updateSubmissionStatus(id, status);
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}