import type { CesroLandingContent } from "./content-schema";
import type { FeaturedProduct } from "#root/components/template-system/home/HomeFeaturedProducts";
import type { CategoryStripItem } from "#root/components/shop/CategoryStrip";
import { CesroChrome } from "./CesroChrome";
import { CesroNavbar } from "./CesroNavbar";
import { CesroFooter } from "./CesroFooter";
import { CesroHero } from "./sections/CesroHero";
import { CesroCategories } from "./sections/CesroCategories";
import { CesroFeaturedProducts } from "./sections/CesroFeaturedProducts";
import { CesroAbout } from "./sections/CesroAbout";
import { CesroFinalCTA } from "./sections/CesroFinalCTA";

export interface LandingTemplateCesroProps {
  content: CesroLandingContent;
  resolvedCategories: CategoryStripItem[];
  resolvedProducts: FeaturedProduct[];
}

/**
 * Demo 5: Cesro — Arabic RTL denim wholesale landing with WhatsApp CTAs.
 *
 * Wraps content in CesroChrome (sets dir="rtl", lang="ar", hides global
 * navbar/footer, applies scoped CSS variables via data-template="cesro").
 */
export function LandingTemplateCesro({
  content,
  resolvedCategories,
  resolvedProducts,
}: LandingTemplateCesroProps) {
  return (
    <CesroChrome content={content}>
      <CesroNavbar />
      <CesroHero
        content={content.hero}
        whatsappNumber={content.whatsappNumber}
        theme={content.theme}
      />
      <CesroCategories
        content={content.categories}
        resolvedCategories={resolvedCategories}
      />
      <CesroFeaturedProducts
        content={content.featuredProducts}
        resolvedProducts={resolvedProducts}
        whatsappNumber={content.whatsappNumber}
      />
      <CesroAbout content={content.about} />
      <CesroFinalCTA
        content={content.finalCta}
        whatsappNumber={content.whatsappNumber}
      />
      <CesroFooter />
    </CesroChrome>
  );
}
