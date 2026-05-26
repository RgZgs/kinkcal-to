import Link from 'next/link';
import { categories, events } from '@/lib/data';

export default function AdminPage() {
  const approved = events.filter(e => true); // all static events are approved
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 inline-block mb-2">← Back to Calendar</Link>
          <h1 className="text-2xl font-bold">Admin (Static Data)</h1>
          <p className="text-zinc-400 text-sm mt-1">Events are managed via the data.ts file. Submit new events via the form.</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/calendar.ics" className="btn-secondary text-sm">📅 .ics Feed</a>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-green-400 mb-3">✅ Published Events ({approved.length})</h2>
        <div className="space-y-2">
          {approved.map((event: any) => (
            <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm">{event.title}</span>
                <span className="text-xs text-zinc-500 ml-2">{event.start_time}</span>
                {event.recurrence_label && <span className="text-xs text-violet-400 ml-2">🔄 {event.recurrence_label}</span>}
              </div>
              <a href={event.url || '#'} className="text-xs text-zinc-500 hover:text-zinc-300 ml-2" target="_blank">🔗</a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}