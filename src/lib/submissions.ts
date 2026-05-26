// Submission storage and notification
// On Vercel (serverless) this uses /tmp which is ephemeral per cold start.
// For persistent storage, swap to Turso/PlanetScale or use a webhook-only approach.

import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

const SUBMISSIONS_DIR = path.join(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(SUBMISSIONS_DIR, 'submissions.json');

export interface Submission {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  start_time: string;
  url: string;
  categories: string[];
  recurrence: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export async function getSubmissions(): Promise<Submission[]> {
  try {
    const data = await readFile(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveSubmission(submission: Omit<Submission, 'id' | 'submitted_at' | 'status'>): Promise<Submission> {
  await mkdir(SUBMISSIONS_DIR, { recursive: true });
  const existing = await getSubmissions();
  const newSub: Submission = {
    ...submission,
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    submitted_at: new Date().toISOString(),
    status: 'pending',
  };
  existing.push(newSub);
  await writeFile(SUBMISSIONS_FILE, JSON.stringify(existing, null, 2));
  return newSub;
}

export async function updateSubmissionStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const existing = await getSubmissions();
  const idx = existing.findIndex(s => s.id === id);
  if (idx >= 0) {
    existing[idx].status = status;
    await writeFile(SUBMISSIONS_FILE, JSON.stringify(existing, null, 2));
  }
}

// Send notification about new submission
export async function notifySubmission(submission: Submission): Promise<boolean> {
  const webhookUrl = process.env.SUBMISSION_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('📧 No SUBMISSION_WEBHOOK_URL set — submission logged only:', submission.title);
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `📅 New Event Submission: *${submission.title}*\n` +
          `📍 ${submission.venue} — ${submission.address}\n` +
          `🕐 ${submission.start_time}\n` +
          `🏷️ ${submission.categories.join(', ')}\n` +
          `${submission.url ? `🔗 ${submission.url}\n` : ''}` +
          `${submission.description ? `📝 ${submission.description}\n` : ''}` +
          `\nReview at: https://kinkcalendartoronto.vercel.app/admin`,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Webhook notification failed:', err);
    return false;
  }
}