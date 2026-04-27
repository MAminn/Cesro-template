import type { CesroCategoriesContent } from "../content-schema";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";

interface CesroCategoriesProps {
  content: CesroCategoriesContent;
  categories: CategoryStripItem[];
}

/**
 * CesroCategories — editorial denim category showcase.
 *
 * Tall 4:5 image tiles in a 1/2/3-column grid; bottom-anchored title with
 * an orange underline that grows on hover. No borders, no rounded edges,
 * no shadows — meant to read like a lookbook contact sheet, not a catalog.
 *
 * Header rhythm (eyebrow → headline → supportingText) sourced from CMS,
 * matching Hero / About / Final CTA. Section uses bg-cesro-navy + named
 * cesro-orange utilities (no arbitrary hex) so deployers can re-theme via
 * the @theme tokens in style.css.
 */
export function CesroCategories({ content, categories }: CesroCategoriesProps) {
  if (!content.enabled) return null;
  if (categories.length === 0) return null;

  return (
    <section className='relative w-full bg-cesro-navy py-20 md:py-28 overflow-hidden'>
      <div className='relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20'>
        {/* Header — eyebrow + headline + supportingText + view-all link */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16'>
          <div className='max-w-2xl'>
            {content.eyebrow && (
              <p className='text-cesro-orange text-sm md:text-base font-semibold tracking-[0.15em] mb-4'>
                {content.eyebrow}
              </p>
            )}
            <h2 className='font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-3'>
              {content.headline}
            </h2>
            {content.supportingText && (
              <p className='text-base md:text-lg text-white/70'>
                {content.supportingText}
              </p>
            )}
          </div>
          {content.viewAllLabel && content.viewAllLink && (
            <a
              href={content.viewAllLink}
              className='group inline-flex items-center gap-3 text-white/80 hover:text-cesro-orange text-sm font-bold uppercase tracking-[0.2em] transition-colors duration-300 self-start md:self-end'>
              <span>{content.viewAllLabel}</span>
              <span className='inline-block w-8 h-px bg-cesro-orange transition-all duration-500 group-hover:w-14' />
            </a>
          )}
        </div>

        {/* Tall editorial tiles */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
          {categories.map((category) => {
            const href = `/categories/${category.slug ?? category.id}`;
            const resolvedImage = category.imageUrl
              ? category.imageUrl.startsWith("http")
                ? category.imageUrl
                : `/uploads/${category.imageUrl}`
              : undefined;

            return (
              <a
                key={category.id}
                href={href}
                className='group relative aspect-4/5 overflow-hidden bg-cesro-navy/50'>
                {/* Image */}
                {resolvedImage ? (
                  <img
                    src={resolvedImage}
                    alt={category.name}
                    loading='lazy'
                    className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 bg-linear-to-br from-cesro-navy to-black' />
                )}

                {/* Bottom gradient overlay — anchors title legibility */}
                <div className='absolute inset-0 bg-linear-to-t from-cesro-navy/95 via-cesro-navy/60 to-transparent' />

                {/* Hover darken */}
                <div className='absolute inset-0 bg-cesro-navy/0 group-hover:bg-cesro-navy/20 transition-colors duration-500' />

                {/* Title block — bottom anchored */}
                <div className='absolute inset-x-0 bottom-0 p-6 md:p-8'>
                  <div className='inline-block'>
                    <h3 className='text-xl md:text-2xl font-bold text-white'>
                      {category.name}
                    </h3>
                    <div className='h-0.5 w-12 bg-cesro-orange mt-3 transition-all duration-300 group-hover:w-24' />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
