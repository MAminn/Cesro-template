/**
 * Zod schema for validating HomepageContent.
 *
 * Extracted from backend/homepage/trpc.ts so it can be safely imported
 * by both client and server code (the backend module pulls in Effect,
 * Drizzle, etc. which are server-only).
 */
import { z } from "zod";
import { ValuePropIconType } from "./homepage-content";

export const HomepageContentSchema = z.object({
  meta: z.object({
    enabled: z.boolean(),
    pageTitle: z.string(),
    pageDescription: z.string(),
  }),
  hero: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
    backgroundImage: z.string().nullish(),
    mobileBackgroundImage: z.string().nullish(),
    heroSlides: z
      .array(
        z.object({
          id: z.string(),
          imageUrl: z.string(),
          mobileImageUrl: z.string().nullish(),
          linkUrl: z.string().nullish(),
          alt: z.string().nullish(),
        }),
      )
      .nullish(),
  }),
  brandStatement: z.object({
    enabled: z.boolean(),
    title: z.string(),
    description: z.string(),
    image: z.string().nullish(),
  }),
  promoBanner: z.object({
    enabled: z.boolean(),
    text: z.string(),
    linkText: z.string().nullish(),
    linkUrl: z.string().nullish(),
  }),
  categories: z.object({
    enabled: z.boolean(),
    title: z.string(),
    titleAr: z.string().nullish(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
  featuredProducts: z.object({
    enabled: z.boolean(),
    title: z.string(),
    titleAr: z.string().nullish(),
    subtitle: z.string(),
    viewAllText: z.string(),
    viewAllTextAr: z.string().nullish(),
    viewAllLink: z.string(),
    productIds: z.array(z.string().uuid()).nullish(),
  }),
  valueProps: z.object({
    enabled: z.boolean(),
    items: z.array(
      z.object({
        icon: z.nativeEnum(ValuePropIconType),
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
  newsletter: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    placeholderText: z.string(),
    ctaText: z.string(),
    privacyText: z.string(),
  }),
  footerCta: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
  }),
  discountedProducts: z
    .object({
      enabled: z.boolean(),
      title: z.string(),
      titleAr: z.string().nullish(),
      viewAllText: z.string(),
      viewAllTextAr: z.string().nullish(),
      viewAllLink: z.string(),
      productIds: z.array(z.string().uuid()).nullish(),
    })
    .nullish(),
  newArrivals: z
    .object({
      enabled: z.boolean(),
      title: z.string(),
      titleAr: z.string().nullish(),
      viewAllText: z.string(),
      viewAllTextAr: z.string().nullish(),
      viewAllLink: z.string(),
      productIds: z.array(z.string().uuid()).nullish(),
    })
    .nullish(),
  marquee: z
    .object({
      enabled: z.boolean(),
      text: z.string(),
      textAr: z.string().nullish(),
    })
    .nullish(),
  promoLine: z
    .object({
      text: z.string(),
      textAr: z.string().nullish(),
    })
    .nullish(),
  contactBanner: z
    .object({
      enabled: z.boolean(),
      slides: z.array(
        z.object({
          id: z.string(),
          imageUrl: z.string(),
          mobileImageUrl: z.string().nullish(),
          alt: z.string().nullish(),
        }),
      ),
      heading: z.string(),
      headingAr: z.string().nullish(),
      description: z.string(),
      descriptionAr: z.string().nullish(),
      directionsUrl: z.string().nullish(),
    })
    .nullish(),
  bottomCarousel: z
    .object({
      enabled: z.boolean(),
      slides: z.array(
        z.object({
          id: z.string(),
          imageUrl: z.string(),
          mobileImageUrl: z.string().nullish(),
          linkUrl: z.string().nullish(),
          alt: z.string().nullish(),
        }),
      ),
    })
    .nullish(),
  aboutUs: z
    .object({
      enabled: z.boolean(),
      title: z.string(),
      titleAr: z.string().nullish(),
      description: z.string(),
      descriptionAr: z.string().nullish(),
      imageUrl: z.string().nullish(),
    })
    .nullish(),
  productCarouselTitle: z.string().nullish(),
  productCarouselTitleAr: z.string().nullish(),
});
