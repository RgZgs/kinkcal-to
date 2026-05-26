import { createEvents } from 'ics';
import { getUpcomingEvents } from './db';
import { categories } from './data';

export async function generateICS(): Promise<string> {
  const eventsList = getUpcomingEvents(90);
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c]));

  const icsEvents = eventsList.map(e => {
    const slugs: string[] = e.category_slugs || [];
    const start = new Date(e.start_time);
    const end = e.end_time ? new Date(e.end_time) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const catNames = slugs.map(s => catMap[s]?.name || s).join(', ');

    const descLines = [e.description || '', '', `Venue: ${e.venue || 'TBD'}`];
    if (e.address) descLines.push(`Address: ${e.address}`);
    if (e.url) descLines.push(`URL: ${e.url}`);
    if (e.recurrence_label || e.recurrence_note) descLines.push(`Recurrence: ${e.recurrence_label || e.recurrence_note}`);
    descLines.push(`Categories: ${catNames}`);

    return {
      title: e.title,
      description: descLines.filter(Boolean).join('\n'),
      location: [e.venue, e.address].filter(Boolean).join(' — '),
      start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()] as [number, number, number, number, number],
      end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()] as [number, number, number, number, number],
      url: e.url || undefined,
      categories: slugs.map(s => catMap[s]?.name || s),
      uid: `toronto-kink-${e.id}@kinkcal.to`,
    };
  });

  const { error, value } = createEvents(icsEvents);
  if (error) throw error;
  return value || '';
}