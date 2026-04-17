import type { HomepageContent } from "#root/shared/types/homepage-content";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import { useLayoutSettings } from "#root/frontend/contexts/LayoutSettingsContext";
import { CesroChrome } from "./CesroChrome";
import { CesroNavbar } from "./CesroNavbar";
import { CesroFooter } from "./CesroFooter";
import { CesroHero } from "./sections/CesroHero";
import { CesroCategories } from "./sections/CesroCategories";
import { CesroFeaturedProducts } from "./sections/CesroFeaturedProducts";
import { CesroAbout } from "./sections/CesroAbout";
import { CesroFinalCTA } from "./sections/CesroFinalCTA";
import { CESRO_DEFAULT_CONTENT } from "./defaults";

export interface LandingTemplateCesroProps {
  content: HomepageContent;
  featuredProducts?: FeaturedProduct[];
  discountedProducts?: FeaturedProduct[];
  categories?: CategoryStripItem[];
  categoriesLoading?: boolean;
  newArrivals?: { id: string; name: string; price: number; imageUrl?: string; images?: { url: string; isPrimary?: boolean }[] }[];
  newArrivalsLoading?: boolean;
  className?: string;
  onCtaClick?: (link: string) => void;
}

/**
 * Demo 5: Cesro — Arabic RTL denim wholesale landing with WhatsApp CTAs.
 *
 * Wraps content in CesroChrome (sets dir="rtl", lang="ar", hides global
 * navbar/footer, applies scoped CSS variables via data-template="cesro").
 */
export function LandingTemplateCesro({
  content,
  featuredProducts = [],
  categories = [],
  categoriesLoading,
}: LandingTemplateCesroProps) {
  const layoutSettings = useLayoutSettings();
  const whatsappNumber = layoutSettings.footer.whatsappNumber ?? "201XXXXXXXXX";

  // Merge with Cesro-specific defaults for fields the generic defaults don't cover
  const hero = { ...CESRO_DEFAULT_CONTENT.hero, ...stripEmpty(content.hero) };
  const cats = { ...CESRO_DEFAULT_CONTENT.categories, ...stripEmpty(content.categories) };
  const featured = { ...CESRO_DEFAULT_CONTENT.featuredProducts, ...stripEmpty(content.featuredProducts) };
  const about = { ...CESRO_DEFAULT_CONTENT.aboutUs!, ...stripEmpty(content.aboutUs ?? {}) };
  const footerCta = { ...CESRO_DEFAULT_CONTENT.footerCta, ...stripEmpty(content.footerCta) };

  // Map categories to the shape CesroCategories expects
  const categoryItems = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug ?? c.id,
    imageUrl: c.imageUrl,
  }));

  return (
    <CesroChrome>
      <CesroNavbar />
      <CesroHero content={hero} whatsappNumber={whatsappNumber} />
      <CesroCategories
        content={cats}
        categories={categoryItems}
        loading={categoriesLoading}
      />
      <CesroFeaturedProducts
        content={featured}
        products={featuredProducts}
        whatsappNumber={whatsappNumber}
      />
      <CesroAbout content={about} />
      <CesroFinalCTA content={footerCta} whatsappNumber={whatsappNumber} />
      <CesroFooter />
    </CesroChrome>
  );
}

/**
 * Strip empty/undefined values from an object so they don't override defaults.
 */
function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    const val = obj[key];
    if (val !== undefined && val !== null && val !== "") {
      result[key] = val;
    }
  }
  return result;
}
