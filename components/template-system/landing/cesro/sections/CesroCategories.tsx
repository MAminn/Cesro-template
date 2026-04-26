import type { CesroCategoriesContent } from "../content-schema";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";

interface CesroCategoriesProps {
  content: CesroCategoriesContent;
  resolvedCategories: CategoryStripItem[];
}

export function CesroCategories({
  content,
  resolvedCategories,
}: CesroCategoriesProps) {
  if (!content.enabled) return null;
  if (resolvedCategories.length === 0) return null;

  return (
    <section className='w-full bg-(--cesro-bg) py-(--cesro-section-y)'>
      <div className='px-6 md:px-16 lg:px-24'>
        {/* Section header */}
        <div className='flex items-end justify-between mb-12 md:mb-16'>
          <h2 className='font-black text-3xl sm:text-4xl md:text-5xl uppercase text-(--cesro-fg)'>
            {content.headline}
          </h2>
          {content.viewAllLabel && content.viewAllLink && (
            <a
              href={content.viewAllLink}
              className='text-(--cesro-accent) text-sm font-bold uppercase tracking-wide hover:underline'>
              {content.viewAllLabel}
            </a>
          )}
        </div>

        {/* Category grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
          {resolvedCategories.map((cat) => (
            <a
              key={cat.id}
              href={`/categories/${cat.slug ?? cat.id}`}
              className='group relative aspect-4/5 overflow-hidden rounded-(--cesro-radius-sm)'>
              {cat.imageUrl ? (
                <img
                  src={
                    cat.imageUrl.startsWith("http")
                      ? cat.imageUrl
                      : `/uploads/${cat.imageUrl}`
                  }
                  alt={cat.name}
                  className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                  loading='lazy'
                />
              ) : (
                <div className='absolute inset-0 bg-white/5' />
              )}
              {/* Overlay */}
              <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />
              {/* Label */}
              <div className='absolute bottom-0 inset-s-0 p-4 md:p-6'>
                <h3 className='font-bold text-lg md:text-xl text-white'>
                  {cat.name}
                </h3>
              </div>
              {/* Hover accent bar */}
              <div className='absolute bottom-0 inset-s-0 w-full h-1 bg-(--cesro-accent) scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right rtl:origin-left' />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
