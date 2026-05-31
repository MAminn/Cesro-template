/**
 * Cesro Landing Template — Zod validators
 *
 * Mirrors content-schema.ts 1:1. Enforces invariants documented in
 * the phase-1 spec (whatsapp format, collection source rules, etc.).
 */

import { z } from "zod";

// ── Icon ───────────────────────────────────────────────────

export const cesroIconNameSchema = z.enum([
  "variety",
  "wholesale",
  "supply",
  "whatsapp",
  "quality",
  "shipping",
  "support",
  "shield",
]);

// ── Collection source ──────────────────────────────────────

const cesroAutoSourceSchema = z.enum([
  "latest",
  "featured",
  "best-selling",
  "category",
]);

export const cesroCollectionSourceSchema = z
  .object({
    mode: z.enum(["auto", "manual"]),
    source: cesroAutoSourceSchema,
    categoryId: z.string().optional(),
    limit: z.number().int().min(1).max(24),
    ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.mode === "auto" && data.source === "category") {
        return (
          typeof data.categoryId === "string" && data.categoryId.length > 0
        );
      }
      return true;
    },
    { message: "categoryId is required when source is 'category'" },
  )
  .refine(
    (data) => {
      if (data.mode === "auto" && data.source !== "category") {
        return data.categoryId === undefined;
      }
      return true;
    },
    { message: "categoryId must be undefined when source is not 'category'" },
  );

// ── CTA ────────────────────────────────────────────────────

export const cesroCtaSchema = z
  .object({
    label: z.string().min(1),
    whatsappMessage: z.string().min(1).optional(),
    link: z.string().min(1).optional(),
    enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const hasWhatsapp = data.whatsappMessage !== undefined;
      const hasLink = data.link !== undefined;
      return hasWhatsapp !== hasLink;
    },
    {
      message:
        "Exactly one of whatsappMessage or link must be set, not both and not neither",
    },
  );

// ── Hero ───────────────────────────────────────────────────

export const cesroHeroSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string(),
  headlineLine1: z.string().min(1),
  headlineLine2: z.string().min(1),
  supportingText: z.string(),
  primaryCta: cesroCtaSchema,
  secondaryCta: cesroCtaSchema,
  presenceText: z.string(),
  presenceTextEnabled: z.boolean().optional(),
  backgroundImage: z.string().min(1),
  mobileBackgroundImage: z.string().min(1).optional(),
});

// ── Categories ─────────────────────────────────────────────

export const cesroCategoriesSchema = z
  .object({
    enabled: z.boolean(),
    eyebrow: z.string().default(""),
    headline: z.string().min(1),
    supportingText: z.string().optional(),
    viewAllLabel: z.string().min(1).optional(),
    viewAllLink: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      const hasLabel = data.viewAllLabel !== undefined;
      const hasLink = data.viewAllLink !== undefined;
      return hasLabel === hasLink;
    },
    {
      message:
        "viewAllLink is required when viewAllLabel is present, and vice versa",
    },
  );

// ── Featured Products ──────────────────────────────────────

export const cesroFeaturedProductsSchema = z
  .object({
    enabled: z.boolean(),
    eyebrow: z.string().default(""),
    headline: z.string().min(1),
    supportingText: z.string().optional(),
    viewAllLabel: z.string().min(1).optional(),
    viewAllLink: z.string().min(1).optional(),
    showWhatsappButton: z.boolean(),
  })
  .refine(
    (data) => {
      const hasLabel = data.viewAllLabel !== undefined;
      const hasLink = data.viewAllLink !== undefined;
      return hasLabel === hasLink;
    },
    {
      message:
        "viewAllLink is required when viewAllLabel is present, and vice versa",
    },
  );

// ── Feature item / block ───────────────────────────────────

export const cesroFeatureItemSchema = z.object({
  icon: cesroIconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const cesroFeaturesBlockSchema = z.object({
  layout: z.enum(["grid-2-col", "list"]),
  items: z.array(cesroFeatureItemSchema).min(2).max(6),
});

// ── About ──────────────────────────────────────────────────

export const cesroAboutSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string(),
  headlineLine1: z.string().min(1),
  headlineLine2: z.string(),
  bodyParagraphs: z.array(z.string().min(1)).min(1).max(3),
  features: cesroFeaturesBlockSchema,
  sideImage: z.string().min(1),
});

// ── Trust item ─────────────────────────────────────────────

export const cesroTrustItemSchema = z.object({
  label: z.string().min(1),
  showDot: z.boolean(),
});

// ── Final CTA ──────────────────────────────────────────────

export const cesroFinalCtaSchema = z
  .object({
    enabled: z.boolean(),
    eyebrow: z.string(),
    headlineLines: z.array(z.string().min(1)).min(2).max(4),
    accentLineIndex: z.number().int().min(0),
    supportingText: z.string(),
    cta: cesroCtaSchema,
    trustItems: z.array(cesroTrustItemSchema).min(2).max(4),
    backgroundImage: z.string().min(1),
  })
  .refine((data) => data.accentLineIndex < data.headlineLines.length, {
    message: "accentLineIndex must be less than headlineLines.length",
  });

// ── Theme ──────────────────────────────────────────────────

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const cesroBorderRadiusSchema = z.object({
  sm: z.string().min(1),
  md: z.string().min(1),
  lg: z.string().min(1),
});

export const cesroSpacingSchema = z.object({
  sectionY: z.string().min(1),
});

export const cesroThemeSchema = z.object({
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  fontFamilyDisplay: z.string().min(1),
  fontFamilyBody: z.string().min(1),
  radius: cesroBorderRadiusSchema,
  spacing: cesroSpacingSchema,
});

// ── Meta ───────────────────────────────────────────────────

export const cesroMetaSchema = z.object({
  pageTitle: z.string().min(1),
  pageDescription: z.string().min(1),
});

// ── Root ───────────────────────────────────────────────────

export const cesroLandingContentSchema = z.object({
  whatsappNumber: z.string().regex(/^\+\d{7,15}$/),
  meta: cesroMetaSchema,
  hero: cesroHeroSchema,
  categories: cesroCategoriesSchema,
  featuredProducts: cesroFeaturedProductsSchema,
  about: cesroAboutSchema,
  finalCta: cesroFinalCtaSchema,
  theme: cesroThemeSchema,
});

/** Inferred TypeScript type from the Zod root schema */
export type CesroLandingContentZod = z.infer<typeof cesroLandingContentSchema>;
