import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const start_time = formData.get('start_time') as string;
    const end_time = (formData.get('end_time') as string) || '';
    const venue = (formData.get('venue') as string) || '';
    const address = (formData.get('address') as string) || '';
    const url = (formData.get('url') as string) || '';
    const source = (formData.get('source') as string) || '';
    const submitted_by = (formData.get('submitted_by') as string) || '';
    const categories = formData.getAll('categories') as string[];

    if (!title || !start_time) {
      return NextResponse.redirect(new URL('/submit?error=missing', request.url));
    }

    createSubmission({
      title,
      description,
      venue,
      address,
      start_time,
      end_time: end_time || undefined,
      url,
      source,
      category_slugs: categories.join(','),
      submitted_by,
    });

    return NextResponse.redirect(new URL('/submit/success', request.url));
  } catch (error) {
    console.error('Error submitting event:', error);
    return NextResponse.redirect(new URL('/submit?error=server', request.url));
  }
}