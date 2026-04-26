import { homepageContent } from "#root/shared/database/drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { DatabaseClient } from "#root/shared/database/drizzle/db";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import {
  getTemplateDefaults,
  hasCustomDefaults,
  isCesroTemplate,
} from "#root/shared/config/template-defaults";

/**
 * Direct database query for SSR homepage content injection.
 * Accepts a DatabaseClient so it can be used in both Fastify and Hono SSR handlers
 * without relying on the global db() singleton.
 *
 * Same fallback chain as getHomepageContent:
 *   template-specific → legacy "default" row → hardcoded defaults
 */
export async function getHomepageContentRaw(
  database: DatabaseClient,
  merchantId: string,
  templateId?: string,
): Promise<HomepageContent | Record<string, unknown>> {
  try {
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
      .limit(1)
      .execute();

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
    // try the legacy "default" row for backward compatibility
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
        .limit(1)
        .execute();

      if (fallback.length > 0 && fallback[0]?.content) {
        const storedContent = fallback[0].content as unknown as HomepageContent;
        return mergeWithDefaults(storedContent, defaults);
      }
    }

    return defaults;
  } catch {
    // SSR CMS injection is an enhancement — failures must not break page rendering
    return getTemplateDefaults(templateId || "default");
  }
}

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
