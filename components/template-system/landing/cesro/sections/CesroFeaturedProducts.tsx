import type { HomepageFeaturedProductsContent } from "#root/shared/types/homepage-content";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import { CesroProductCard } from "../CesroProductCard";

interface CesroFeaturedProductsProps {
  content: HomepageFeaturedProductsContent;
  products: FeaturedProduct[];
  whatsappNumber: string;
  loading?: boolean;
}

export function CesroFeaturedProducts({
  content,
  products,
  whatsappNumber,
  loading,
}: CesroFeaturedProductsProps) {
  if (!content.enabled) return null;

  return (
    <section className="w-full bg-(--cesro-bg) py-20 md:py-28">
      <div className="px-6 md:px-16 lg:px-24">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <h2 className="font-black text-3xl sm:text-4xl md:text-5xl uppercase text-(--cesro-fg)">
            {content.titleAr || content.title}
          </h2>
          {content.viewAllLink && (
            <a
              href={content.viewAllLink}
              className="text-(--cesro-accent) text-sm font-bold uppercase tracking-wide hover:underline"
            >
              {content.viewAllTextAr || content.viewAllText}
            </a>
          )}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/5 bg-white/5 rounded-sm animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((product) => (
              <CesroProductCard
                key={product.id}
                product={product}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
