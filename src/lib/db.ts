import { events, categories, type Event, type Category } from './data';

// --- Recurrence Engine ---

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const dayOffset = (weekday - firstWeekday + 7) % 7;
  const firstOccurrence = 1 + dayOffset;
  if (nth > 0) {
    const day = firstOccurrence + (nth - 1) * 7;
    if (day > new Date(year, month + 1, 0).getDate()) return null;
    return new Date(year, month, day);
  }
  const lastDay = new Date(year, month + 1, 0).getDate();
  const lastOccurrence = firstOccurrence + Math.floor((lastDay - firstOccurrence) / 7) * 7;
  return new Date(year, month, lastOccurrence);
}

function expandRecurringDates(recurrence: string, fromDate: Date, toDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(fromDate);

  if (recurrence.startsWith('nth-weekday:')) {
    const parts = recurrence.replace('nth-weekday:', '').split('-');
    const nth = parseInt(parts[0]);
    const weekday = parseInt(parts[1]);
    current.setDate(1);
    while (current <= toDate) {
      const nthDate = getNthWeekdayOfMonth(current.getFullYear(), current.getMonth(), weekday, nth);
      if (nthDate && nthDate >= fromDate && nthDate <= toDate) dates.push(nthDate);
      current.setMonth(current.getMonth() + 1);
    }
  } else if (recurrence.startsWith('monthly:')) {
    const monthDay = parseInt(recurrence.split(':')[1]);
    current.setDate(1);
    while (current <= toDate) {
      const day = new Date(current.getFullYear(), current.getMonth(), monthDay);
      if (day >= fromDate && day <= toDate) dates.push(day);
      current.setMonth(current.getMonth() + 1);
    }
  } else if (recurrence.startsWith('weekly:')) {
    const weekday = parseInt(recurrence.split(':')[1]);
    current.setDate(current.getDate() + ((weekday - current.getDay() + 7) % 7 || 7));
    if (current < fromDate) current.setDate(current.getDate() + 7);
    while (current <= toDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  }

  return dates;
}

export function getUpcomingEvents(days: number = 90): (Event & { category_emojis?: string[]; is_expanded?: boolean; recurrence_note?: string })[] {
  const allEvents: (Event & { category_emojis?: string[]; is_expanded?: boolean; recurrence_note?: string })[] = [];
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // One-off events
  for (const event of events) {
    if (!event.is_recurring && new Date(event.start_time) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
      const catEmojis = event.category_slugs.map(slug => categories.find(c => c.slug === slug)?.emoji || '').filter(Boolean);
      allEvents.push({ ...event, category_emojis: catEmojis });
    }
  }

  // Recurring events — expand
  for (const template of events) {
    if (!template.is_recurring || !template.recurrence) continue;
    const dates = expandRecurringDates(template.recurrence, now, futureDate);
    const templateStart = new Date(template.start_time);
    const templateEnd = template.end_time ? new Date(template.end_time) : null;
    const startHour = templateStart.getHours();
    const startMin = templateStart.getMinutes();
    const durationMs = templateEnd ? templateEnd.getTime() - templateStart.getTime() : 3 * 60 * 60 * 1000;

    for (const date of dates) {
      const startTime = new Date(date);
      startTime.setHours(startHour, startMin, 0);
      const endTime = new Date(startTime.getTime() + durationMs);
      const catEmojis = template.category_slugs.map(slug => categories.find(c => c.slug === slug)?.emoji || '').filter(Boolean);
      allEvents.push({
        ...template,
        id: `${template.id}-${date.toISOString().slice(0, 10)}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category_emojis: catEmojis,
        is_expanded: true,
        recurrence_note: template.recurrence_label || template.recurrence,
      });
    }
  }

  allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  return allEvents;
}

export function getFilteredEvents(categorySlug?: string): (Event & { category_emojis?: string[]; is_expanded?: boolean; recurrence_note?: string })[] {
  const all = getUpcomingEvents(90);
  if (!categorySlug) return all;
  return all.filter(e => e.category_slugs.includes(categorySlug));
}

export { categories, events };
export type { Event, Category };