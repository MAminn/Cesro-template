import type { CesroFeaturedProductsContent } from "../content-schema";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import { CesroProductCard } from "../CesroProductCard";

interface CesroFeaturedProductsProps {
  content: CesroFeaturedProductsContent;
  resolvedProducts: FeaturedProduct[];
  whatsappNumber: string;
}

export function CesroFeaturedProducts({
  content,
  resolvedProducts,
  whatsappNumber,
}: CesroFeaturedProductsProps) {
  if (!content.enabled) return null;
  if (resolvedProducts.length === 0) return null;

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

        {/* Product grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
          {resolvedProducts.map((product) => (
            <CesroProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
              showWhatsappButton={content.showWhatsappButton}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
