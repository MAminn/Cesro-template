import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import { CesroWhatsAppButton } from "./CesroWhatsAppButton";

interface CesroProductCardProps {
  product: FeaturedProduct;
  whatsappNumber: string;
  whatsappLabel?: string;
}

/**
 * Cesro-specific product card with WhatsApp button.
 * Wraps the standard product data shape; does NOT modify the shared ProductCard.
 */
export function CesroProductCard({
  product,
  whatsappNumber,
  whatsappLabel = "اطلب عبر واتساب",
}: CesroProductCardProps) {
  const imageUrl = product.images?.find((i) => i.isPrimary)?.url
    ?? product.images?.[0]?.url
    ?? product.imageUrl;
  const resolvedImage = imageUrl?.startsWith("http")
    ? imageUrl
    : imageUrl
      ? `/uploads/${imageUrl}`
      : undefined;

  const price = Number(product.price);
  const discountPrice = product.discountPrice
    ? Number(product.discountPrice)
    : null;
  const hasDiscount = discountPrice != null && discountPrice < price;

  const waMessage = `مرحبًا، أريد الاستفسار عن المنتج: ${product.name}`;

  return (
    <div className="group flex flex-col bg-white/5 rounded-sm overflow-hidden">
      {/* Image */}
      <a
        href={`/product/${product.id}`}
        className="relative aspect-3/4 overflow-hidden"
      >
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
            <span className="text-white/30 text-sm">لا توجد صورة</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 inset-s-3 bg-(--cesro-accent) text-white text-xs font-bold px-2 py-1 rounded-sm">
            تخفيض
          </span>
        )}
      </a>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <a href={`/product/${product.id}`} className="block">
          <h3 className="text-(--cesro-fg) font-bold text-sm line-clamp-2 group-hover:text-(--cesro-accent) transition-colors">
            {product.name}
          </h3>
        </a>

        <div className="flex items-baseline gap-2 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-(--cesro-accent) font-bold text-lg">
                {discountPrice.toFixed(0)} ج.م
              </span>
              <span className="text-(--cesro-muted) line-through text-sm">
                {price.toFixed(0)} ج.م
              </span>
            </>
          ) : (
            <span className="text-(--cesro-fg) font-bold text-lg">
              {price.toFixed(0)} ج.م
            </span>
          )}
        </div>

        {/* WhatsApp quick-order button */}
        <CesroWhatsAppButton
          label={whatsappLabel}
          whatsappNumber={whatsappNumber}
          message={waMessage}
          variant="primary"
          size="base"
          className="w-full text-sm px-4! py-2.5!"
        />
      </div>
    </div>
  );
}
