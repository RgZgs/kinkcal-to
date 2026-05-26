import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission, notifySubmission, getSubmissions, updateSubmissionStatus } from '@/lib/submissions';
import { sanitizeText, sanitizeUrl, sanitizeDatetime, sanitizeCategories, sanitizeRecurrence, checkRateLimit, isAdminRequest } from '@/lib/security';
import { categories } from '@/lib/data';

export async function POST(request: NextRequest) {
  // Rate limit
  if (!checkRateLimit()) {
    return NextResponse.redirect(new URL('/submit?error=rate_limited', request.url));
  }

  try {
    const formData = await request.formData();
    const rawTitle = formData.get('title') as string;
    
    if (!rawTitle?.trim()) {
      return NextResponse.redirect(new URL('/submit?error=missing_title', request.url));
    }

    const title = sanitizeText(rawTitle);
    if (title.length < 3) {
      return NextResponse.redirect(new URL('/submit?error=too_short', request.url));
    }

    const knownSlugs = categories.map(c => c.slug);
    const rawCategories = formData.getAll('categories') as string[];

    const submission = await saveSubmission({
      title,
      description: sanitizeText((formData.get('description') as string) || ''),
      venue: sanitizeText((formData.get('venue') as string) || ''),
      address: sanitizeText((formData.get('address') as string) || ''),
      start_time: sanitizeDatetime((formData.get('start_time') as string) || ''),
      url: sanitizeUrl((formData.get('url') as string) || ''),
      categories: sanitizeCategories(rawCategories, knownSlugs),
      recurrence: sanitizeRecurrence((formData.get('recurrence') as string) || ''),
    });

    // Fire and forget notification
    notifySubmission(submission).catch(() => {});

    return NextResponse.redirect(new URL('/submit/success', request.url));
  } catch (error) {
    console.error('Error submitting event:', error);
    return NextResponse.redirect(new URL('/submit?error=server', request.url));
  }
}

// GET: list submissions — admin only (requires ADMIN_TOKEN env var)
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subs = await getSubmissions();
  return NextResponse.json({ submissions: subs });
}

// PATCH: approve or reject — admin only
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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