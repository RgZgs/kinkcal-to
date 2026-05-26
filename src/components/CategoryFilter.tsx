interface Category {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  color: string;
}

export default function CategoryFilter({ categories, activeSlug }: { categories: Category[]; activeSlug: string | null }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a
        href="/"
        className={activeSlug === null ? 'filter-btn active' : 'filter-btn inactive'}
      >
        All
      </a>
      {categories.map(cat => (
        <a
          key={cat.slug}
          href={`/?cat=${cat.slug}`}
          className={activeSlug === cat.slug ? 'filter-btn active' : 'filter-btn inactive'}
        >
          {cat.emoji} {cat.name}
        </a>
      ))}
    </div>
  );
}