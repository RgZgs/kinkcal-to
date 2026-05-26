import { getUpcomingEvents, getCategories, getApprovedEvents } from '@/lib/db';
import EventCard from '@/components/EventCard';
import CategoryFilter from '@/components/CategoryFilter';
import Link from 'next/link';

export const revalidate = 60;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const params = await searchParams;
  const categorySlug = params.cat || null;

  const events = categorySlug
    ? getApprovedEvents(categorySlug)
    : getUpcomingEvents(90);
  const categories = getCategories();

  // Filter to future events only when filtering by category
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const filteredEvents = categorySlug
    ? events.filter((e: any) => new Date(e.start_time) >= now)
    : events;

  // Group events by date
  const grouped: Record<string, any[]> = {};
  for (const event of filteredEvents) {
    const dateKey = event.start_time.slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(event);
  }

  const sortedDates = Object.keys(grouped).sort();

  const activeCategory = categorySlug ? categories.find((c: any) => c.slug === categorySlug) : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          KinkCal TO
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Every gay circuit, fetish, leather, latex, BDSM, puppy, furry & drag event in Toronto
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <a
            href="/api/calendar.ics"
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            📲 Subscribe to Calendar
          </a>
          <Link href="/submit" className="btn-secondary text-sm inline-flex items-center gap-2">
            ➕ Submit Event
          </Link>
        </div>
        <div className="mt-3">
          <Link href="/admin" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>

      {/* Category filters */}
      <CategoryFilter categories={categories} activeSlug={categorySlug} />

      {/* Active filter indicator */}
      {activeCategory && (
        <div className="text-center mt-4">
          <span className="text-sm text-zinc-400">
            Filtering by: <span style={{ color: activeCategory.color }}>{activeCategory.emoji} {activeCategory.name}</span>
            {' '}<a href="/" className="text-zinc-500 hover:text-zinc-300 underline">Clear</a>
          </span>
        </div>
      )}

      {/* Events */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-2xl mb-2">📭</p>
          <p>No events yet. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          {sortedDates.map(date => {
            const d = new Date(date + 'T12:00:00');
            const dayLabel = d.toLocaleDateString('en-CA', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            });
            const isToday = date === new Date().toISOString().slice(0, 10);
            const isTomorrow = date === new Date(Date.now() + 86400000).toISOString().slice(0, 10);
            return (
              <section key={date}>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 sticky top-0 bg-zinc-950/90 backdrop-blur py-2 z-10">
                  {isToday ? '📍 Today — ' : isTomorrow ? '📍 Tomorrow — ' : ''}
                  {dayLabel}
                </h2>
                <div className="space-y-3">
                  {grouped[date].map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <footer className="mt-16 text-center text-zinc-600 text-xs pb-8">
        KinkCal TO — Made with 🔥 in Toronto
      </footer>
    </main>
  );
}