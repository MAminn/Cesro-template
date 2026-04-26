/**
 * Homepage Content Management Schema
 *
 * This file defines the content structure for the homepage that merchants can edit.
 * Layout and styling are NOT part of this schema - only editable content.
 */

/**
 * Meta information for SEO and page head
 */
export interface HomepageMetaContent {
  enabled: boolean;
  pageTitle: string;
  pageDescription: string;
}

/**
 * A single hero carousel slide
 */
export interface HeroSlideContent {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  alt?: string;
}

/**
 * Hero section content
 */
export interface HomepageHeroContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  /** Mobile-specific hero background image. Falls back to backgroundImage if empty. */
  mobileBackgroundImage?: string;
  /** Multiple hero carousel slides (takes priority over backgroundImage if non-empty) */
  heroSlides?: HeroSlideContent[];
  /** Small eyebrow text above the headline */
  eyebrow?: string;
  /** Body paragraph below subtitle */
  bodyText?: string;
  /** Secondary CTA button label */
  secondaryCtaText?: string;
  /** Secondary CTA button link or WhatsApp message */
  secondaryCtaLink?: string;
  /** Badge/presence line text (e.g. WhatsApp availability note) */
  badgeText?: string;
}

/**
 * Brand statement section content
 */
export interface HomepageBrandStatementContent {
  enabled: boolean;
  title: string;
  description: string;
  image?: string;
}

/**
 * Promotional banner content
 */
export interface HomepagePromoBannerContent {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
}

/**
 * Icon types for value propositions
 */
export enum ValuePropIconType {
  SHOPPING = "shopping",
  SHIPPING = "shipping",
  SECURITY = "security",
  SUPPORT = "support",
  QUALITY = "quality",
  RETURNS = "returns",
}

/**
 * Single value proposition item
 */
export interface ValuePropItem {
  icon: ValuePropIconType;
  title: string;
  description: string;
}

/**
 * Value propositions section content
 */
export interface HomepageValuePropsContent {
  enabled: boolean;
  items: ValuePropItem[];
}

/**
 * Categories section content
 */
export interface HomepageCategoriesContent {
  enabled: boolean;
  title: string;
  titleAr?: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Featured products section content
 */
export interface HomepageFeaturedProductsContent {
  enabled: boolean;
  title: string;
  titleAr?: string;
  subtitle: string;
  viewAllText: string;
  viewAllTextAr?: string;
  viewAllLink: string;
  /** Manually selected product IDs (when set, only these products are shown) */
  productIds?: string[];
}

/**
 * Newsletter subscription section content
 */
export interface HomepageNewsletterContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholderText: string;
  ctaText: string;
  privacyText: string;
}

/**
 * Footer CTA section content
 */
export interface HomepageFooterCtaContent {
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  /** Eyebrow text above the headline */
  eyebrow?: string;
  /** Body paragraph between headline and CTA */
  bodyText?: string;
  /** Trust tags shown below the CTA button */
  trustTags?: string[];
  /** Full-bleed background image */
  backgroundImage?: string;
}

/**
 * Discounted / On-Sale products section content
 */
export interface HomepageDiscountedProductsContent {
  enabled: boolean;
  title: string;
  titleAr?: string;
  viewAllText: string;
  viewAllTextAr?: string;
  viewAllLink: string;
  /** Manually selected product IDs (when set, only these products are shown) */
  productIds?: string[];
}

/**
 * New Arrivals products section content
 */
export interface HomepageNewArrivalsContent {
  enabled: boolean;
  title: string;
  titleAr?: string;
  viewAllText: string;
  viewAllTextAr?: string;
  viewAllLink: string;
  /** Manually selected product IDs (when set, only these products are shown) */
  productIds?: string[];
}

/**
 * Marquee announcement bar content (minimal template)
 */
export interface HomepageMarqueeContent {
  enabled: boolean;
  text: string;
  textAr?: string;
}

/**
 * Promo text line for product detail page (minimal template)
 */
export interface HomepagePromoLineContent {
  text: string;
  textAr?: string;
}

/**
 * A single contact page banner slide
 */
export interface ContactBannerSlide {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  alt?: string;
}

/**
 * Contact page banner content (minimal template)
 */
export interface HomepageContactBannerContent {
  enabled: boolean;
  slides: ContactBannerSlide[];
  heading: string;
  headingAr?: string;
  description: string;
  descriptionAr?: string;
  directionsUrl?: string;
}

/**
 * About Us section content
 */
export interface HomepageAboutUsContent {
  enabled: boolean;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  imageUrl?: string;
  /** Eyebrow text above the headline */
  eyebrow?: string;
  /** Second headline line (muted accent) */
  subtitle?: string;
  /** Additional body paragraph */
  secondaryDescription?: string;
  /** Feature highlight items (title + description pairs) */
  highlights?: Array<{ title: string; description: string }>;
}

/**
 * Complete homepage content structure
 */
export interface HomepageContent {
  meta: HomepageMetaContent;
  hero: HomepageHeroContent;
  brandStatement: HomepageBrandStatementContent;
  promoBanner: HomepagePromoBannerContent;
  categories: HomepageCategoriesContent;
  featuredProducts: HomepageFeaturedProductsContent;
  valueProps: HomepageValuePropsContent;
  newsletter: HomepageNewsletterContent;
  footerCta: HomepageFooterCtaContent;
  discountedProducts?: HomepageDiscountedProductsContent;
  newArrivals?: HomepageNewArrivalsContent;
  marquee?: HomepageMarqueeContent;
  promoLine?: HomepagePromoLineContent;
  contactBanner?: HomepageContactBannerContent;
  /** Bottom carousel slides shown above testimonials (minimal template) */
  bottomCarousel?: {
    enabled: boolean;
    slides: HeroSlideContent[];
  };
  /** About Us section */
  aboutUs?: HomepageAboutUsContent;
  /** Product page inline carousel custom title */
  productCarouselTitle?: string;
  productCarouselTitleAr?: string;
}

/**
 * Default homepage content - safe fallback values
 */
export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  meta: {
    enabled: true,
    pageTitle: "Welcome to Our Store",
    pageDescription: "Discover amazing products curated just for you",
  },
  hero: {
    enabled: true,
    title: "Welcome to Our Store",
    subtitle: "Discover amazing products curated just for you",
    ctaText: "Start Shopping",
    ctaLink: "/shop",
    backgroundImage: undefined,
    mobileBackgroundImage: undefined,
    heroSlides: [],
  },
  brandStatement: {
    enabled: true,
    title: "Worn with intention. Designed for life.",
    description:
      "Every piercing is an expression of self. Our pieces are crafted to honor that commitment—refined in form, enduring in quality, and timeless in design.",
    image: "/uploads/homepage/brand-statement.jpg",
  },
  promoBanner: {
    enabled: false,
    text: "🎉 Special Offer: Get 20% off your first order!",
    linkText: "Shop Now",
    linkUrl: "/shop",
  },
  categories: {
    enabled: true,
    title: "Shop by Category",
    subtitle: "Browse our curated selection of product categories",
    ctaText: "View All Categories",
    ctaLink: "/categories",
  },
  featuredProducts: {
    enabled: true,
    title: "Featured Products",
    subtitle: "Check out our handpicked selection of trending products",
    viewAllText: "View All Products",
    viewAllLink: "/shop",
  },
  valueProps: {
    enabled: true,
    items: [
      {
        icon: ValuePropIconType.SHOPPING,
        title: "Wide Selection",
        description: "Discover thousands of products from top brands",
      },
      {
        icon: ValuePropIconType.SHIPPING,
        title: "Fast Delivery",
        description:
          "Get your orders delivered quickly with our reliable shipping",
      },
      {
        icon: ValuePropIconType.SECURITY,
        title: "Secure Shopping",
        description: "Shop with confidence using our secure payment system",
      },
    ],
  },
  newsletter: {
    enabled: true,
    title: "Stay Updated",
    subtitle: "Subscribe to our newsletter for exclusive deals and updates",
    placeholderText: "Enter your email address",
    ctaText: "Subscribe",
    privacyText: "We respect your privacy. Unsubscribe at any time.",
  },
  footerCta: {
    enabled: true,
    title: "Ready to Start Shopping?",
    subtitle: "Join thousands of satisfied customers today",
    ctaText: "Browse Products",
    ctaLink: "/shop",
  },
  discountedProducts: {
    enabled: true,
    title: "Offers",
    viewAllText: "View All",
    viewAllLink: "/shop",
  },
  newArrivals: {
    enabled: true,
    title: "New Arrivals",
    viewAllText: "View All",
    viewAllLink: "/shop",
  },
  marquee: {
    enabled: false,
    text: "",
  },
  promoLine: {
    text: "",
    textAr: "",
  },
  bottomCarousel: {
    enabled: true,
    slides: [],
  },
  contactBanner: {
    enabled: true,
    slides: [],
    heading: "We Would Love To Hear From You",
    headingAr: "نود أن نسمع منك",
    description:
      "Have a question, feedback, or just want to say hello? Drop us a message and we'll get back to you as soon as possible.",
    descriptionAr:
      "هل لديك سؤال أو ملاحظة أو تريد فقط أن تقول مرحبا؟ أرسل لنا رسالة وسنعود إليك في أقرب وقت ممكن.",
    directionsUrl: "",
  },
  aboutUs: {
    enabled: false,
    title: "About Us",
    titleAr: "من نحن",
    description:
      "Welcome to our store. We are passionate about bringing you the finest products.",
    descriptionAr: "",
    imageUrl: "",
  },
};
