import Link from 'next/link';
import { categories } from '@/lib/data';

export default function SubmitPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 mb-6 inline-block">
        ← Back to Calendar
      </Link>
      <h1 className="text-2xl font-bold mb-2">Submit an Event</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Know of a gay/kink/fetish event in Toronto that&apos;s not listed? Add it below. It&apos;ll be reviewed and published quickly.
      </p>
      <form action="/api/submit" method="POST" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Event Name *</label>
          <input type="text" name="title" required className="input-field" placeholder="e.g., Pup Mosh at The Eagle" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
          <textarea name="description" rows={3} className="input-field" placeholder="What's happening? Dress code? Cover charge?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Start Date & Time *</label>
            <input type="datetime-local" name="start_time" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">End Date & Time</label>
            <input type="datetime-local" name="end_time" className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Venue</label>
          <input type="text" name="venue" className="input-field" placeholder="e.g., The Black Eagle" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Address</label>
          <input type="text" name="address" className="input-field" placeholder="e.g., 718 Queen St W, Toronto" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Event URL</label>
          <input type="url" name="url" className="input-field" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Where'd you hear about this?</label>
          <input type="text" name="source" className="input-field" placeholder="Instagram, friend, flyer, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Is this a recurring event?</label>
          <select name="recurrence" className="input-field">
            <option value="">One-time event</option>
            <option value="nth-weekday:1-6">Every 1st Saturday</option>
            <option value="nth-weekday:2-6">Every 2nd Saturday</option>
            <option value="nth-weekday:3-6">Every 3rd Saturday</option>
            <option value="nth-weekday:4-6">Every 4th Saturday</option>
            <option value="nth-weekday:1-5">Every 1st Friday</option>
            <option value="nth-weekday:2-5">Every 2nd Friday</option>
            <option value="nth-weekday:3-5">Every 3rd Friday</option>
            <option value="weekly:6">Every Saturday</option>
            <option value="weekly:5">Every Friday</option>
            <option value="weekly:0">Every Sunday</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">Categories * <span className="text-zinc-500">(pick all that apply)</span></label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <label key={cat.slug} className="category-pill cursor-pointer border transition-all select-none hover:brightness-125" style={{
                backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color,
              }}>
                <input type="checkbox" name="categories" value={cat.slug} className="peer sr-only" />
                <span className="peer-checked:font-bold peer-checked:ring-1 peer-checked:ring-offset-1 peer-checked:ring-offset-zinc-900" style={{ '--tw-ring-color': cat.color } as any}>
                  {cat.emoji} {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Your Name (optional)</label>
          <input type="text" name="submitted_by" className="input-field" placeholder="Anonymous is fine" />
        </div>
        <button type="submit" className="btn-primary w-full mt-6">📝 Submit for Review</button>
      </form>
      <p className="text-xs text-zinc-500 mt-4 text-center">
        Submitted events are reviewed before publishing. Usually within a few hours.
      </p>
    </main>
  );
}