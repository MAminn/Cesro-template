/**
 * Cesro Landing Template — Dedicated Content Schema
 *
 * Separate from the shared HomepageContent used by Demos 1–4.
 * Every section is typed here with its own interface.
 */

// ── Icon enum ──────────────────────────────────────────────

export type CesroIconName =
  | "variety"
  | "wholesale"
  | "supply"
  | "whatsapp"
  | "quality"
  | "shipping"
  | "support"
  | "shield";

// ── Collection source (products / categories) ──────────────

export type CesroCollectionSourceMode = "auto" | "manual";

export type CesroAutoSource =
  | "latest"
  | "featured"
  | "best-selling"
  | "category";

export interface CesroCollectionSource {
  mode: CesroCollectionSourceMode;
  /** Only used when mode === 'auto' */
  source: CesroAutoSource;
  /** Required when source === 'category', otherwise must be undefined */
  categoryId?: string;
  /** 1–24 */
  limit: number;
  /** Manual product/category IDs when mode === 'manual' */
  ids?: string[];
}

// ── CTA ────────────────────────────────────────────────────

export interface CesroCTA {
  label: string;
  /** Pre-filled WhatsApp message. Exactly one of whatsappMessage or link must be set. */
  whatsappMessage?: string;
  /** Navigation link. Exactly one of whatsappMessage or link must be set. */
  link?: string;
  /** Whether the CTA is shown. Undefined is treated as true (backward compatible). */
  enabled?: boolean;
}

// ── Hero ───────────────────────────────────────────────────

export interface CesroHeroContent {
  enabled: boolean;
  eyebrow: string;
  /** Main headline — large uppercase text */
  headlineLine1: string;
  /** Second headline line — accent colored */
  headlineLine2: string;
  supportingText: string;
  primaryCta: CesroCTA;
  secondaryCta: CesroCTA;
  /** Presence text below CTAs (e.g. "رد سريع عبر واتساب بيزنس") */
  presenceText: string;
  /** Whether the presence text is shown. Undefined is treated as true (backward compatible). */
  presenceTextEnabled?: boolean;
  /** Full-bleed background image path */
  backgroundImage: string;
  mobileBackgroundImage?: string;
}

// ── Categories ─────────────────────────────────────────────
//
// Phase 1: `source` config removed. Cesro now mirrors Demos 1–4 —
// categories are auto-fetched in the page route via
// trpc.category.view + the existing `showOnLanding` dashboard flag.
// Manual selection / mode toggles live in the dashboard, not the
// landing CMS.

export interface CesroCategoriesContent {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  supportingText?: string;
  viewAllLabel?: string;
  viewAllLink?: string;
}

// ── Featured Products ──────────────────────────────────────
//
// Phase 1: `source` config removed. Featured products are auto-fetched
// in the page route via trpc.product.search using the same convention
// as Demos 1–4 (latest, in-stock).

export interface CesroFeaturedProductsContent {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  supportingText?: string;
  viewAllLabel?: string;
  viewAllLink?: string;
  showWhatsappButton: boolean;
}

// ── About / Features ───────────────────────────────────────

export interface CesroFeatureItem {
  icon: CesroIconName;
  title: string;
  description: string;
}

export interface CesroFeaturesBlock {
  /** 'grid-2-col' | 'list' — controls render layout */
  layout: "grid-2-col" | "list";
  /** 2–6 items */
  items: CesroFeatureItem[];
}

export interface CesroAboutContent {
  enabled: boolean;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  /** 1–3 paragraphs */
  bodyParagraphs: string[];
  features: CesroFeaturesBlock;
  sideImage: string;
}

// ── Final CTA ──────────────────────────────────────────────

export interface CesroTrustItem {
  label: string;
  /** Whether to show a pulsing dot indicator */
  showDot: boolean;
}

export interface CesroFinalCtaContent {
  enabled: boolean;
  eyebrow: string;
  /** Tuple of 2–4 headline lines rendered stacked */
  headlineLines: string[];
  /** Index into headlineLines for the accent-colored line (0-based) */
  accentLineIndex: number;
  supportingText: string;
  cta: CesroCTA;
  /** 2–4 trust items */
  trustItems: CesroTrustItem[];
  backgroundImage: string;
}

// ── Theme overrides ────────────────────────────────────────

export interface CesroBorderRadius {
  sm: string;
  md: string;
  lg: string;
}

export interface CesroSpacing {
  sectionY: string;
}

export interface CesroTheme {
  primaryColor: string;
  accentColor: string;
  fontFamilyDisplay: string;
  fontFamilyBody: string;
  radius: CesroBorderRadius;
  spacing: CesroSpacing;
}

// ── Meta ───────────────────────────────────────────────────

export interface CesroMeta {
  pageTitle: string;
  pageDescription: string;
}

// ── Root ───────────────────────────────────────────────────

export interface CesroLandingContent {
  whatsappNumber: string;
  meta: CesroMeta;
  hero: CesroHeroContent;
  categories: CesroCategoriesContent;
  featuredProducts: CesroFeaturedProductsContent;
  about: CesroAboutContent;
  finalCta: CesroFinalCtaContent;
  theme: CesroTheme;
}
