import { categories, events } from '@/lib/data';

interface Props {
  activeSlug: string | null;
}

export default function CategoryFilter({ activeSlug }: Props) {
  // Only show categories that have at least one event
  const activeCategorySlugs = new Set(events.flatMap(e => e.category_slugs));
  const visibleCategories = categories.filter(c => activeCategorySlugs.has(c.slug));

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a href="/" className={activeSlug === null ? 'filter-btn active' : 'filter-btn inactive'}>
        All
      </a>
      {visibleCategories.map(cat => (
        <a key={cat.slug} href={`/?cat=${cat.slug}`} className={activeSlug === cat.slug ? 'filter-btn active' : 'filter-btn inactive'}>
          {cat.emoji} {cat.name}
        </a>
      ))}
    </div>
  );
}