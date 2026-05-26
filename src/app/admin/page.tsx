import Link from 'next/link';
import { getPendingSubmissions, getApprovedEvents, approveSubmission, rejectSubmission, deleteEvent } from '@/lib/db';

export default async function AdminPage() {
  const pending = getPendingSubmissions();
  const events = getApprovedEvents();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 inline-block mb-2">
            ← Back to Calendar
          </Link>
          <h1 className="text-2xl font-bold">Admin</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/calendar.ics" className="btn-secondary text-sm">📅 .ics Feed</a>
        </div>
      </div>

      {/* Pending Submissions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-yellow-400 mb-3">
          🕐 Pending Submissions ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-zinc-500 text-sm">No pending submissions.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((sub: any) => (
              <div key={sub.id} className="bg-zinc-900 border border-yellow-800/50 rounded-lg p-4">
                <h3 className="font-semibold">{sub.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{sub.description}</p>
                <div className="text-sm text-zinc-500 mt-2 space-y-0.5">
                  <div>🕐 {sub.start_time}{sub.end_time ? ` — ${sub.end_time}` : ''}</div>
                  {sub.venue && <div>📍 {sub.venue}</div>}
                  {sub.address && <div>📫 {sub.address}</div>}
                  {sub.url && <div>🔗 <a href={sub.url} className="text-violet-400 hover:underline">{sub.url}</a></div>}
                  <div>🏷️ {sub.category_slugs}</div>
                  <div>👤 {sub.submitted_by || 'Anonymous'} · 📅 {sub.submitted_at}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <form action="/api/admin/approve" method="POST">
                    <input type="hidden" name="submission_id" value={sub.id} />
                    <button type="submit" className="btn-primary text-sm">✅ Approve</button>
                  </form>
                  <form action="/api/admin/reject" method="POST">
                    <input type="hidden" name="submission_id" value={sub.id} />
                    <button type="submit" className="bg-red-900/50 hover:bg-red-800/50 text-red-300 font-medium px-4 py-2 rounded-lg transition-colors text-sm">
                      ❌ Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Events */}
      <section>
        <h2 className="text-lg font-semibold text-green-400 mb-3">
          ✅ Published Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-zinc-500 text-sm">No published events yet.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event: any) => (
              <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-sm">{event.title}</span>
                  <span className="text-xs text-zinc-500 ml-2">{event.start_time}</span>
                </div>
                <form action="/api/admin/delete" method="POST">
                  <input type="hidden" name="event_id" value={event.id} />
                  <button type="submit" className="text-xs text-red-400 hover:text-red-300 ml-2">Delete</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}