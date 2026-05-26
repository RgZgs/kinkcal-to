import { categories } from '@/lib/data';

interface Props {
  activeSlug: string | null;
  categories?: any[];
}

export default function CategoryFilter({ activeSlug }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a href="/" className={activeSlug === null ? 'filter-btn active' : 'filter-btn inactive'}>
        All
      </a>
      {categories.map(cat => (
        <a key={cat.slug} href={`/?cat=${cat.slug}`} className={activeSlug === cat.slug ? 'filter-btn active' : 'filter-btn inactive'}>
          {cat.emoji} {cat.name}
        </a>
      ))}
    </div>
  );
}