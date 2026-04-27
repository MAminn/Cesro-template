import type { CesroLandingContent } from "./content-schema";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import { CesroChrome } from "./CesroChrome";
import { CesroHero } from "./sections/CesroHero";
import { CesroCategories } from "./sections/CesroCategories";
import { CesroFeaturedProducts } from "./sections/CesroFeaturedProducts";
import { CesroAbout } from "./sections/CesroAbout";
import { CesroFinalCTA } from "./sections/CesroFinalCTA";

export interface LandingTemplateCesroProps {
  content: CesroLandingContent;
  categories: CategoryStripItem[];
  featuredProducts: FeaturedProduct[];
}

/**
 * Demo 5: Cesro — Arabic RTL denim wholesale landing with WhatsApp CTAs.
 *
 * Cesro now uses the SAME global Navbar and Footer as Demos 1–4
 * (rendered by LayoutDefault). CesroChrome remains as a pure theme
 * wrapper that sets dir="rtl", lang="ar", and injects scoped CSS
 * variables via data-template="cesro".
 */
export function LandingTemplateCesro({
  content,
  categories,
  featuredProducts,
}: LandingTemplateCesroProps) {
  return (
    <CesroChrome content={content}>
      <CesroHero
        content={content.hero}
        whatsappNumber={content.whatsappNumber}
        theme={content.theme}
      />
      <CesroAbout content={content.about} />
      <CesroCategories content={content.categories} categories={categories} />
      <CesroFeaturedProducts
        content={content.featuredProducts}
        products={featuredProducts}
        whatsappNumber={content.whatsappNumber}
      />
      <CesroFinalCTA
        content={content.finalCta}
        whatsappNumber={content.whatsappNumber}
      />
    </CesroChrome>
  );
}
