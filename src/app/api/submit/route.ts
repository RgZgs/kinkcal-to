import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In the static version, submissions are logged to console
  // In production, this would write to Turso DB
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const start_time = formData.get('start_time') as string;
    const categories = formData.getAll('categories') as string[];
    
    console.log('📅 New submission:', JSON.stringify({
      title, description, start_time, categories,
      venue: formData.get('venue'),
      address: formData.get('address'),
      url: formData.get('url'),
      recurrence: formData.get('recurrence'),
    }));
    
    return NextResponse.redirect(new URL('/submit/success', request.url));
  } catch (error) {
    console.error('Error submitting event:', error);
    return NextResponse.redirect(new URL('/submit?error=server', request.url));
  }
}