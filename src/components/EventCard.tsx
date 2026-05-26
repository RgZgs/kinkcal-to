import { categories } from '@/lib/data';

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const catEmojis: string[] = event.category_emojis || [];
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;

  const timeStr = start.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endStr = end ? end.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
  const durationStr = end ? `${timeStr} — ${endStr}` : timeStr;

  const isRecurring = event.is_recurring || event.recurrence || event.recurrence_note;
  const recurLabel = event.recurrence_label || event.recurrence_note || '';

  return (
    <div className="event-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-zinc-100 text-base leading-tight">{event.title}</h3>
            {isRecurring && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                🔄 {recurLabel || 'Recurring'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-400">
            <span>🕐 {durationStr}</span>
            {event.venue && <span>📍 {event.venue}</span>}
          </div>
          {event.description && <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{event.description}</p>}
          {event.url && (
            <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 mt-1 inline-block">
              🔗 Event Link
            </a>
          )}
          {event.source && <span className="text-xs text-zinc-500 ml-2">via {event.source}</span>}
        </div>
      </div>
      {event.category_slugs && event.category_slugs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {event.category_slugs.map((slug: string, i: number) => {
            const cat = categories.find(c => c.slug === slug);
            return (
              <a key={slug} href={`/?cat=${slug}`} className="category-pill" style={{
                backgroundColor: cat ? `${cat.color}20` : '#27272a',
                color: cat ? cat.color : '#a1a1aa',
                border: cat ? `1px solid ${cat.color}40` : '1px solid #3f3f46',
              }}>
                {catEmojis[i] || ''} {cat?.name || slug}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}