/**
 * Cesro Landing Template — Phase 1 barrel
 *
 * Re-exports types, defaults, and validators.
 * Does NOT export the template component or sections — those are
 * wired in Phase 3 when renderers migrate to CesroLandingContent.
 */

// Types
export type {
  CesroIconName,
  CesroCollectionSourceMode,
  CesroAutoSource,
  CesroCollectionSource,
  CesroCTA,
  CesroHeroContent,
  CesroCategoriesContent,
  CesroFeaturedProductsContent,
  CesroFeatureItem,
  CesroFeaturesBlock,
  CesroAboutContent,
  CesroTrustItem,
  CesroFinalCtaContent,
  CesroBorderRadius,
  CesroSpacing,
  CesroTheme,
  CesroMeta,
  CesroLandingContent,
} from "./content-schema";

// Defaults
export { CESRO_DEFAULT_CONTENT } from "./defaults";
// Legacy HomepageContent-shaped defaults (used until Phase 3)
export { CESRO_DEFAULT_CONTENT_HOMEPAGE_SHAPE } from "./defaults";

// Validators
export {
  cesroIconNameSchema,
  cesroCollectionSourceSchema,
  cesroCtaSchema,
  cesroHeroSchema,
  cesroCategoriesSchema,
  cesroFeaturedProductsSchema,
  cesroFeatureItemSchema,
  cesroFeaturesBlockSchema,
  cesroAboutSchema,
  cesroTrustItemSchema,
  cesroFinalCtaSchema,
  cesroBorderRadiusSchema,
  cesroSpacingSchema,
  cesroThemeSchema,
  cesroMetaSchema,
  cesroLandingContentSchema,
} from "./validators";
export type { CesroLandingContentZod } from "./validators";
