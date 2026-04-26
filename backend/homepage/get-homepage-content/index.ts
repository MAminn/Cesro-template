import { db } from "#root/shared/database/drizzle/db";
import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import {
  getTemplateDefaults,
  hasCustomDefaults,
  isCesroTemplate,
} from "#root/shared/config/template-defaults";

/**
 * Fetches homepage content for a specific merchant and template
 * Falls back to hardcoded defaults if no content found for the template
 *
 * @param merchantId - The unique identifier for the merchant
 * @param templateId - The template ID to fetch content for
 * @returns Promise resolving to the homepage content
 */
export async function getHomepageContent(
  merchantId: string,
  templateId?: string,
): Promise<HomepageContent | Record<string, unknown>> {
  try {
    const database = db();
    const resolvedTemplateId = templateId || "default";
    const defaults = getTemplateDefaults(resolvedTemplateId);

    // Find content for the specific template
    const result = await database
      .select()
      .from(homepageContent)
      .where(
        and(
          eq(homepageContent.merchantId, merchantId),
          eq(homepageContent.templateId, resolvedTemplateId),
        ),
      )
      .limit(1);

    if (result.length > 0 && result[0]?.content) {
      const storedContent = result[0].content as unknown;
      // Cesro templates use their own shape — return raw JSON, no merging
      if (isCesroTemplate(resolvedTemplateId)) {
        return storedContent as Record<string, unknown>;
      }
      return mergeWithDefaults(
        storedContent as Partial<HomepageContent>,
        defaults as HomepageContent,
      );
    }

    // Templates with their own defaults skip the legacy "default" row
    if (hasCustomDefaults(resolvedTemplateId)) {
      return defaults;
    }

    // If no template-specific content and this isn't already "default",
    // try the legacy "default" row for backward compatibility with existing data
    if (resolvedTemplateId !== "default") {
      const fallback = await database
        .select()
        .from(homepageContent)
        .where(
          and(
            eq(homepageContent.merchantId, merchantId),
            eq(homepageContent.templateId, "default"),
          ),
        )
        .limit(1);

      if (fallback.length > 0 && fallback[0]?.content) {
        const storedContent = fallback[0].content as unknown as HomepageContent;
        return mergeWithDefaults(storedContent, defaults);
      }
    }

    // Return default content for this template
    return defaults;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    return getTemplateDefaults(templateId || "default");
  }
}

/**
 * Recursively strips null values from an object so that
 * defaults are preserved when spreading (null overrides defaults, undefined does not).
 */
function stripNulls<T>(obj: T): T {
  if (obj === null || obj === undefined) return undefined as unknown as T;
  if (Array.isArray(obj)) return obj.map(stripNulls) as unknown as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== null) {
        result[key] = typeof value === "object" ? stripNulls(value) : value;
      }
    }
    return result as T;
  }
  return obj;
}

/**
 * Merges stored content with defaults to ensure all required fields exist
 * This prevents errors if the schema changes or data is incomplete
 */
function mergeWithDefaults(
  storedContent: Partial<HomepageContent>,
  defaults: HomepageContent,
): HomepageContent {
  const clean = stripNulls(storedContent);
  return {
    meta: {
      ...defaults.meta,
      ...clean.meta,
    },
    hero: {
      ...defaults.hero,
      ...clean.hero,
    },
    brandStatement: {
      ...defaults.brandStatement,
      ...clean.brandStatement,
    },
    promoBanner: {
      ...defaults.promoBanner,
      ...clean.promoBanner,
    },
    categories: {
      ...defaults.categories,
      ...clean.categories,
    },
    featuredProducts: {
      ...defaults.featuredProducts,
      ...clean.featuredProducts,
    },
    valueProps: {
      ...defaults.valueProps,
      ...(clean.valueProps || {}),
      items: clean.valueProps?.items || defaults.valueProps.items,
    },
    newsletter: {
      ...defaults.newsletter,
      ...clean.newsletter,
    },
    footerCta: {
      ...defaults.footerCta,
      ...clean.footerCta,
    },
    discountedProducts: clean.discountedProducts ?? defaults.discountedProducts,
    newArrivals: clean.newArrivals ?? defaults.newArrivals,
    marquee: clean.marquee ?? defaults.marquee,
    promoLine: clean.promoLine ?? defaults.promoLine,
    contactBanner: clean.contactBanner ?? defaults.contactBanner,
    bottomCarousel: clean.bottomCarousel ?? defaults.bottomCarousel,
    aboutUs: clean.aboutUs ?? defaults.aboutUs,
    productCarouselTitle:
      clean.productCarouselTitle ?? defaults.productCarouselTitle,
    productCarouselTitleAr:
      clean.productCarouselTitleAr ?? defaults.productCarouselTitleAr,
  };
}
