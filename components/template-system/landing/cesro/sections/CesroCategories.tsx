import type { HomepageCategoriesContent } from "#root/shared/types/homepage-content";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface CesroCategoriesProps {
  content: HomepageCategoriesContent;
  categories: CategoryItem[];
  loading?: boolean;
}

export function CesroCategories({
  content,
  categories,
  loading,
}: CesroCategoriesProps) {
  if (!content.enabled) return null;

  return (
    <section className="w-full bg-(--cesro-bg) py-20 md:py-28">
      <div className="px-6 md:px-16 lg:px-24">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <h2 className="font-black text-3xl sm:text-4xl md:text-5xl uppercase text-(--cesro-fg)">
            {content.titleAr || content.title}
          </h2>
        </div>

        {/* Category grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-4/5 bg-white/5 rounded-sm animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.slice(0, 6).map((cat) => (
              <a
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative aspect-4/5 overflow-hidden rounded-sm"
              >
                {cat.imageUrl ? (
                  <img
                    src={
                      cat.imageUrl.startsWith("http")
                        ? cat.imageUrl
                        : `/uploads/${cat.imageUrl}`
                    }
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-white/5" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                {/* Label */}
                <div className="absolute bottom-0 inset-s-0 p-4 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl text-white">
                    {cat.name}
                  </h3>
                </div>
                {/* Hover accent bar */}
                <div className="absolute bottom-0 inset-s-0 w-full h-1 bg-(--cesro-accent) scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right rtl:origin-left" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
