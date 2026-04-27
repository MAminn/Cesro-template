import type { CesroFeaturedProductsContent } from "../content-schema";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import { getProductUrl } from "#root/lib/utils/route-helpers";

interface CesroFeaturedProductsProps {
  content: CesroFeaturedProductsContent;
  products: FeaturedProduct[];
  whatsappNumber: string;
}

/**
 * CesroFeaturedProducts — editorial denim product showcase.
 *
 * Consistent 1/2/3-column grid (no asymmetric variation) so the section
 * reads as a coherent lookbook rather than a catalog. No card chrome:
 * names sit beneath the image like a magazine caption. The conversion
 * path is WhatsApp inquiry — no "Add to Cart".
 *
 * Header rhythm (eyebrow → headline → supportingText) sourced from CMS,
 * matching Hero / About / Categories / Final CTA. Section uses
 * bg-cesro-navy + named cesro-orange utilities only.
 */
export function CesroFeaturedProducts({
  content,
  products,
  whatsappNumber,
}: CesroFeaturedProductsProps) {
  if (!content.enabled) return null;
  if (products.length === 0) return null;

  const cleanedNumber = whatsappNumber.replace(/[^0-9]/g, "");

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

        {/* Editorial product grid — consistent 1/2/3 columns */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12'>
          {products.map((product) => {
            // Note: +Page.tsx pre-prefixes `product.imageUrl` with `/uploads/`,
            // but `product.images[].url` arrives raw from the API. Prefer the
            // structured `images` array; only fall back to the already-prefixed
            // `imageUrl` (don't re-prefix it).
            const primaryImage =
              product.images?.find((i) => i.isPrimary)?.url ??
              product.images?.[0]?.url;
            const resolvedImage = primaryImage
              ? primaryImage.startsWith("http")
                ? primaryImage
                : `/uploads/${primaryImage}`
              : (product.imageUrl ?? undefined);

            const price = Number(product.price);
            const discountPrice = product.discountPrice
              ? Number(product.discountPrice)
              : null;
            const hasDiscount = discountPrice != null && discountPrice < price;

            const productHref = getProductUrl(product.id);
            const waMessage = encodeURIComponent(
              `مرحبًا، أريد الاستفسار عن المنتج: ${product.name}`,
            );
            const waHref = `https://wa.me/${cleanedNumber}?text=${waMessage}`;

            return (
              <div key={product.id} className='group block'>
                {/* Image */}
                <a
                  href={productHref}
                  className='relative block aspect-4/5 overflow-hidden bg-cesro-navy/30'>
                  {resolvedImage ? (
                    <img
                      src={resolvedImage}
                      alt={product.name}
                      loading='lazy'
                      className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                    />
                  ) : (
                    <div className='absolute inset-0 bg-linear-to-br from-cesro-navy to-black' />
                  )}
                  <div className='absolute inset-0 bg-cesro-navy/0 group-hover:bg-cesro-navy/15 transition-colors duration-500' />
                </a>

                {/* Caption — minimal, no card chrome */}
                <div className='mt-4'>
                  <a href={productHref} className='block'>
                    <h3 className='text-lg md:text-xl font-bold text-white group-hover:text-cesro-orange transition-colors duration-300'>
                      {product.name}
                    </h3>
                    <div className='flex items-baseline gap-3 mt-2'>
                      {hasDiscount ? (
                        <>
                          <span className='text-cesro-orange text-lg font-bold'>
                            {discountPrice.toFixed(0)} ج.م
                          </span>
                          <span className='text-white/40 text-base line-through'>
                            {price.toFixed(0)} ج.م
                          </span>
                        </>
                      ) : (
                        <span className='text-cesro-orange text-lg font-bold'>
                          {price.toFixed(0)} ج.م
                        </span>
                      )}
                    </div>
                  </a>

                  {/* WhatsApp inquiry — ghost link, not a button */}
                  {content.showWhatsappButton && (
                    <a
                      href={waHref}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-cesro-orange transition-colors duration-300'>
                      <span>اطلب على واتساب</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
