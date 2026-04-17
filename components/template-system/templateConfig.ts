import type React from "react";
import { HomeFeaturedProducts } from "./home/HomeFeaturedProducts";
import type { HomeFeaturedProductsProps } from "./home/HomeFeaturedProducts";
import { ModernHomeTemplateV2 } from "./home/ModernHomeTemplateV2";
import type { ModernHomeTemplateV2Props } from "./home/ModernHomeTemplateV2";
import { LandingTemplateModern } from "./landing/LandingTemplateModern";
import type { LandingTemplateModernProps } from "./landing/LandingTemplateModern";
import { LandingTemplateClassic } from "./landing/LandingTemplateClassic";
import type { LandingTemplateClassicProps } from "./landing/LandingTemplateClassic";
import { LandingTemplateEditorial } from "./landing/LandingTemplateEditorial";
import type { LandingTemplateEditorialProps } from "./landing/LandingTemplateEditorial";
import { LandingTemplateMinimal } from "./landing/LandingTemplateMinimal";
import type { LandingTemplateMinimalProps } from "./landing/LandingTemplateMinimal";
import { LandingTemplateCesro } from "./landing/cesro/LandingTemplateCesro";
import type { LandingTemplateCesroProps } from "./landing/cesro/LandingTemplateCesro";
import { ProductPageModernSplit } from "./productPage/ProductPageModernSplit";
import type { ProductPageModernSplitProps } from "./productPage/ProductPageModernSplit";
import { ProductPageClassic } from "./productPage/ProductPageClassic";
import type { ProductPageClassicProps } from "./productPage/ProductPageClassic";
import { ProductPageEditorial } from "./productPage/ProductPageEditorial";
import type { ProductPageEditorialProps } from "./productPage/ProductPageEditorial";
import { ProductPageTechnical } from "./productPage/ProductPageTechnical";
import type { ProductPageTechnicalProps } from "./productPage/ProductPageTechnical";
import { ProductPageMinimal } from "./productPage/ProductPageMinimal";
import type { ProductPageMinimalProps } from "./productPage/ProductPageMinimal";
import { ProductPagePerce } from "./productPage/ProductPagePerce";
import type { ProductPagePerceProps } from "./productPage/ProductPagePerce";
import { CategoryPageGridWithFilters } from "./categoryPage/CategoryPageGridWithFilters";
import type { CategoryPageGridWithFiltersProps } from "./categoryPage/CategoryPageGridWithFilters";
import { CategoryGridClassic } from "./categoryPage/CategoryGridClassic";
import type { CategoryGridClassicProps } from "./categoryPage/CategoryGridClassic";
import { CategoryHeroSplit } from "./categoryPage/CategoryHeroSplit";
import type { CategoryHeroSplitProps } from "./categoryPage/CategoryHeroSplit";
import { CategoryMinimal } from "./categoryPage/CategoryMinimal";
import type { CategoryMinimalProps } from "./categoryPage/CategoryMinimal";
import { CategoryShowcase } from "./categoryPage/CategoryShowcase";
import type { CategoryShowcaseProps } from "./categoryPage/CategoryShowcase";
import { SortingMinimalTemplate } from "./sorting/SortingMinimalTemplate";
import type { SortingMinimalTemplateProps } from "./sorting/SortingMinimalTemplate";
import { CartPageModernTemplate } from "./cartPage/CartPageModernTemplate";
import type { CartPageModernTemplateProps } from "./cartPage/CartPageModernTemplate";
import { CheckoutPageModernTemplate } from "./checkoutPage/CheckoutPageModernTemplate";
import type { CheckoutPageModernTemplateProps } from "./checkoutPage/CheckoutPageModernTemplate";
import { SearchResultsGrid } from "./searchResults/SearchResultsGrid";
import type { SearchResultsGridProps } from "./searchResults/SearchResultsGrid";
import { SearchResultsMinimal } from "./searchResults/SearchResultsMinimal";
import type { SearchResultsMinimalProps } from "./searchResults/SearchResultsMinimal";
import { SortingEditorialTemplate } from "./sorting/SortingEditorialTemplate";
import type { SortingEditorialTemplateProps } from "./sorting/SortingEditorialTemplate";
import { CartPageEditorialTemplate } from "./cartPage/CartPageEditorialTemplate";
import type { CartPageEditorialTemplateProps } from "./cartPage/CartPageEditorialTemplate";
import { CheckoutPageEditorialTemplate } from "./checkoutPage/CheckoutPageEditorialTemplate";
import type { CheckoutPageEditorialTemplateProps } from "./checkoutPage/CheckoutPageEditorialTemplate";
import { SearchResultsEditorial } from "./searchResults/SearchResultsEditorial";
import type { SearchResultsEditorialProps } from "./searchResults/SearchResultsEditorial";

// Import preview components
import {
  LandingModernPreview,
  LandingClassicPreview,
  LandingEditorialPreview,
  LandingMinimalPreview,
  LandingCesroPreview,
} from "./previews/LandingPreviews";
import {
  ProductPageClassicPreview,
  ProductPageEditorialPreview,
  ProductPageTechnicalPreview,
  ProductPageMinimalPreview,
  ProductPageModernSplitPreview,
  ProductPagePercePreview,
} from "./previews/ProductPagePreviews";
import {
  CategoryGridClassicPreview,
  CategoryHeroSplitPreview,
  CategoryMinimalPreview,
  CategoryShowcasePreview,
  CategoryGridWithFiltersPreview,
} from "./previews/CategoryPagePreviews";
import {
  HomeFeaturedProductsPreview,
  ModernHomeTemplateV2Preview,
  SearchResultsGridPreview,
  SearchResultsMinimalPreview,
  SortingMinimalPreview,
  CartPageModernPreview,
  CheckoutPageModernPreview,
} from "./previews/OtherPreviews";
import {
  SortingEditorialPreview,
  CartPageEditorialPreview,
  CheckoutPageEditorialPreview,
  SearchResultsEditorialPreview,
} from "./previews/EditorialPreviews";

/**
 * Template System Configuration
 *
 * Central registry for all template components in the system.
 * Provides type-safe access to template components by category and ID.
 */

// Define valid template categories
export type TemplateCategory =
  | "landing"
  | "home"
  | "sorting"
  | "productPage"
  | "categoryPage"
  | "cartPage"
  | "checkoutPage"
  | "searchResults";

// Per-template theme tokens (CSS custom-property overrides)
export interface TemplateThemeTokens {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  fontDisplay: string;
  fontBody: string;
}

// Define the structure for a template entry
export interface TemplateEntry<TProps = any> {
  id: string;
  label: string;
  component: React.FC<TProps>;
  previewComponent: React.FC; // Preview-safe component for admin
  /** Text direction — defaults to 'ltr' when omitted */
  direction?: "ltr" | "rtl";
  /** Locale hint — defaults to 'en' when omitted */
  locale?: "ar" | "en";
  /** Scoped CSS variable overrides for this template */
  themeTokens?: TemplateThemeTokens;
}

// Define the structure for the entire template config
export interface TemplateConfig {
  landing: TemplateEntry[];
  home: TemplateEntry[];
  sorting: TemplateEntry[];
  productPage: TemplateEntry[];
  categoryPage: TemplateEntry[];
  cartPage: TemplateEntry[];
  checkoutPage: TemplateEntry[];
  searchResults: TemplateEntry[];
}

/**
 * Template Registry
 *
 * Centralized configuration for all available templates.
 * Add new templates here to make them available throughout the application.
 */
export const templateConfig: TemplateConfig = {
  landing: [
    {
      id: "landing-modern",
      label: "Demo 1: Modern (Default)",
      component: LandingTemplateModern as React.FC<LandingTemplateModernProps>,
      previewComponent: LandingModernPreview,
    },
    {
      id: "landing-editorial",
      label: "Demo 2: Editorial (Premium Luxury)",
      component:
        LandingTemplateEditorial as React.FC<LandingTemplateEditorialProps>,
      previewComponent: LandingEditorialPreview,
    },
    {
      id: "landing-classic",
      label: "Demo 3: Classic (Commerce-First)",
      component:
        LandingTemplateClassic as React.FC<LandingTemplateClassicProps>,
      previewComponent: LandingClassicPreview,
    },
    {
      id: "landing-minimal",
      label: "Demo 4: Minimal (Typography-First)",
      component:
        LandingTemplateMinimal as React.FC<LandingTemplateMinimalProps>,
      previewComponent: LandingMinimalPreview,
    },
    {
      id: "landing-cesro",
      label: "Demo 5: Cesro (Wholesale RTL)",
      component:
        LandingTemplateCesro as React.FC<LandingTemplateCesroProps>,
      previewComponent: LandingCesroPreview,
      direction: "rtl",
      locale: "ar",
      themeTokens: {
        background: "#0B1F3A",
        foreground: "#F8FAFC",
        accent: "#F97316",
        muted: "#94A3B8",
        fontDisplay: "Tajawal",
        fontBody: "Tajawal",
      },
    },
  ],

  home: [
    {
      id: "featured-products-modern",
      label: "Featured Products (Modern)",
      component: HomeFeaturedProducts as React.FC<HomeFeaturedProductsProps>,
      previewComponent: HomeFeaturedProductsPreview,
    },
    {
      id: "home-modern-v2",
      label: "Modern Home Template V2",
      component: ModernHomeTemplateV2 as React.FC<ModernHomeTemplateV2Props>,
      previewComponent: ModernHomeTemplateV2Preview,
    },
  ],

  sorting: [
    {
      id: "sorting-minimal",
      label: "Minimal Grid",
      component:
        SortingMinimalTemplate as React.FC<SortingMinimalTemplateProps>,
      previewComponent: SortingMinimalPreview,
    },
    {
      id: "sorting-editorial",
      label: "Editorial Collection",
      component:
        SortingEditorialTemplate as React.FC<SortingEditorialTemplateProps>,
      previewComponent: SortingEditorialPreview,
    },
  ],

  productPage: [
    {
      id: "product-perce",
      label: "Percé (Premium — Default)",
      component: ProductPagePerce as React.FC<ProductPagePerceProps>,
      previewComponent: ProductPagePercePreview,
    },
    {
      id: "product-classic",
      label: "Demo 1: Classic (Conversion-Focused)",
      component: ProductPageClassic as React.FC<ProductPageClassicProps>,
      previewComponent: ProductPageClassicPreview,
    },
    {
      id: "product-editorial",
      label: "Demo 2: Editorial (Luxury Storytelling)",
      component: ProductPageEditorial as React.FC<ProductPageEditorialProps>,
      previewComponent: ProductPageEditorialPreview,
    },
    {
      id: "product-technical",
      label: "Demo 3: Technical (Specs-First)",
      component: ProductPageTechnical as React.FC<ProductPageTechnicalProps>,
      previewComponent: ProductPageTechnicalPreview,
    },
    {
      id: "product-minimal",
      label: "Demo 4: Minimal (Premium Clean)",
      component: ProductPageMinimal as React.FC<ProductPageMinimalProps>,
      previewComponent: ProductPageMinimalPreview,
    },
    {
      id: "product-modern-split",
      label: "Modern Split Layout (Legacy)",
      component:
        ProductPageModernSplit as React.FC<ProductPageModernSplitProps>,
      previewComponent: ProductPageModernSplitPreview,
    },
  ],

  categoryPage: [
    {
      id: "category-grid-classic",
      label: "Classic Grid Layout",
      component: CategoryGridClassic as React.FC<CategoryGridClassicProps>,
      previewComponent: CategoryGridClassicPreview,
    },
    {
      id: "category-hero-split",
      label: "Hero Split Layout",
      component: CategoryHeroSplit as React.FC<CategoryHeroSplitProps>,
      previewComponent: CategoryHeroSplitPreview,
    },
    {
      id: "category-minimal",
      label: "Minimal Layout",
      component: CategoryMinimal as React.FC<CategoryMinimalProps>,
      previewComponent: CategoryMinimalPreview,
    },
    {
      id: "category-showcase",
      label: "Showcase Layout",
      component: CategoryShowcase as React.FC<CategoryShowcaseProps>,
      previewComponent: CategoryShowcasePreview,
    },
    {
      id: "category-grid-with-filters",
      label: "Category Grid with Filters (Legacy)",
      component:
        CategoryPageGridWithFilters as React.FC<CategoryPageGridWithFiltersProps>,
      previewComponent: CategoryGridWithFiltersPreview,
    },
  ],

  cartPage: [
    {
      id: "cart-modern",
      label: "Modern Cart Page",
      component:
        CartPageModernTemplate as React.FC<CartPageModernTemplateProps>,
      previewComponent: CartPageModernPreview,
    },
    {
      id: "cart-editorial",
      label: "Editorial Cart Page",
      component:
        CartPageEditorialTemplate as React.FC<CartPageEditorialTemplateProps>,
      previewComponent: CartPageEditorialPreview,
    },
  ],

  checkoutPage: [
    {
      id: "checkout-modern",
      label: "Modern Checkout Page",
      component:
        CheckoutPageModernTemplate as React.FC<CheckoutPageModernTemplateProps>,
      previewComponent: CheckoutPageModernPreview,
    },
    {
      id: "checkout-editorial",
      label: "Editorial Checkout Page",
      component:
        CheckoutPageEditorialTemplate as React.FC<CheckoutPageEditorialTemplateProps>,
      previewComponent: CheckoutPageEditorialPreview,
    },
  ],

  searchResults: [
    {
      id: "search-results-grid",
      label: "Grid Layout (Standard)",
      component: SearchResultsGrid as React.FC<SearchResultsGridProps>,
      previewComponent: SearchResultsGridPreview,
    },
    {
      id: "search-results-minimal",
      label: "Minimal Layout (Clean)",
      component: SearchResultsMinimal as React.FC<SearchResultsMinimalProps>,
      previewComponent: SearchResultsMinimalPreview,
    },
    {
      id: "search-results-editorial",
      label: "Editorial Layout",
      component: SearchResultsEditorial as React.FC<SearchResultsEditorialProps>,
      previewComponent: SearchResultsEditorialPreview,
    },
  ],
};

/**
 * Get a template component by category and ID
 *
 * @param category - The template category
 * @param id - The unique template ID
 * @returns The template entry or undefined if not found
 */
export function getTemplateComponent(
  category: TemplateCategory,
  id: string,
): TemplateEntry | undefined {
  const categoryTemplates = templateConfig[category];
  return categoryTemplates.find((template) => template.id === id);
}

/**
 * Get all templates for a specific category
 *
 * @param category - The template category
 * @returns Array of template entries for the category
 */
export function getTemplatesByCategory(
  category: TemplateCategory,
): TemplateEntry[] {
  return templateConfig[category] || [];
}

/**
 * Check if a template exists
 *
 * @param category - The template category
 * @param id - The unique template ID
 * @returns True if the template exists
 */
export function templateExists(
  category: TemplateCategory,
  id: string,
): boolean {
  return getTemplateComponent(category, id) !== undefined;
}

/**
 * Get all available template IDs for a category
 *
 * @param category - The template category
 * @returns Array of template IDs
 */
export function getTemplateIds(category: TemplateCategory): string[] {
  return templateConfig[category].map((template) => template.id);
}
