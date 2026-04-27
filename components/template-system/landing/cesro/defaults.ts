/**
 * Cesro Landing Template — Default Editable Content
 *
 * Arabic copy harvested from cesro/src/i18n/ar.ts (standalone prototype).
 * All strings live here; components receive them as props via CesroLandingContent.
 */

import type { CesroLandingContent } from "./content-schema";

// Placeholder image paths — bundled under the cesro assets folder.
// These are Unsplash-licensed images served as static assets via Vite.
const heroBg = "/assets/cesro/hero-bg.jpg";
const aboutSide = "/assets/cesro/about-side.jpg";
const finalCtaBg = "/assets/cesro/final-cta-bg.jpg";

// ── Canonical defaults: CesroLandingContent ─────────────────
// Arabic copy verbatim from cesro/src/i18n/ar.ts unless noted.

export const CESRO_DEFAULT_CONTENT: CesroLandingContent = {
  /** Placeholder — deployers must set their real number */
  whatsappNumber: "+201000000000",

  meta: {
    pageTitle: "CESRO — جينز بالجملة في مصر",
    pageDescription:
      "مورّد جينز بالجملة في مصر — تشكيلة موديلات متنوعة بأسعار جملة تنافسية. تواصل معانا على واتساب.",
  },

  hero: {
    enabled: true,
    eyebrow: "مورّد جينز بالجملة في مصر",
    headlineLine1: "جينز بالجملة",
    headlineLine2: "لكل مصر",
    supportingText:
      "نوفّر لمحلات الملابس والتجّار تشكيلة جينز متنوعة بأسعار جملة تنافسية. تواصل معانا على واتساب — الرد فوري.",
    primaryCta: {
      label: "تواصل واتساب",
      whatsappMessage: "مرحبًا، أريد الاستفسار عن أسعار الجملة للجينز",
    },
    secondaryCta: {
      label: "اطلب عرض أسعار",
      whatsappMessage: "مرحبًا، أريد طلب عرض أسعار للجينز بالجملة",
    },
    presenceText: "رد سريع عبر واتساب بيزنس",
    backgroundImage: heroBg,
    mobileBackgroundImage: undefined,
  },

  categories: {
    enabled: false,
    // Invented, not from client-approved i18n. Review before enabling in production.
    eyebrow: "مجموعاتنا",
    headline: "تسوّق حسب الفئة",
    supportingText: "تشكيلة جينز متنوعة بأسعار جملة",
    viewAllLabel: "عرض الكل",
    viewAllLink: "/shop",
  },

  featuredProducts: {
    enabled: false,
    // Invented, not from client-approved i18n. Review before enabling in production.
    eyebrow: "مختارات الموسم",
    headline: "منتجات مميزة",
    supportingText: "أكثر الموديلات طلبًا من تجار الجملة",
    viewAllLabel: "عرض الكل",
    viewAllLink: "/shop",
    showWhatsappButton: true,
  },

  about: {
    enabled: true,
    eyebrow: "من نحن",
    headlineLine1: "مكتب جملة جينز",
    headlineLine2: "في قلب مصر",
    bodyParagraphs: [
      "نحن مكتب متخصص في توريد الجينز بالجملة لمحلات الملابس والتجّار في مصر. نوفّر بضاعة جاهزة بموديلات متنوعة وأسعار تنافسية تناسب السوق المصري.",
      "شغلنا مبني على الثقة والاستمرارية — نشتغل مع محلات وتجّار في كل المحافظات ونوفّر خدمة سريعة ومباشرة عبر واتساب.",
    ],
    features: {
      layout: "grid-2-col",
      items: [
        {
          icon: "variety",
          title: "تشكيلة موديلات",
          description: "موديلات متنوعة تناسب كل الأذواق والأسواق",
        },
        {
          icon: "wholesale",
          title: "أسعار جملة",
          description: "أسعار تنافسية للتجّار وأصحاب المحلات",
        },
        {
          icon: "supply",
          title: "توريد منتظم",
          description: "بضاعة جاهزة وتوريد مستمر على مدار السنة",
        },
        {
          icon: "whatsapp",
          title: "خدمة واتساب سريعة",
          description: "تواصل مباشر ورد فوري على كل استفساراتك",
        },
      ],
    },
    sideImage: aboutSide,
  },

  finalCta: {
    enabled: true,
    eyebrow: "ابدأ دلوقتي",
    headlineLines: ["جاهز تطلب؟", "كلّمنا على واتساب"],
    accentLineIndex: 1,
    supportingText:
      "استفسارات، أسعار، كميات، موديلات متاحة — كل حاجة بنرد عليها فورًا على واتساب.",
    cta: {
      label: "تواصل على واتساب",
      whatsappMessage: "مرحبًا، أريد الاستفسار عن الجينز بالجملة",
    },
    trustItems: [
      { label: "رد فوري", showDot: true },
      { label: "واتساب بيزنس", showDot: false },
      { label: "بدون التزام", showDot: false },
    ],
    backgroundImage: finalCtaBg,
  },

  theme: {
    primaryColor: "#F97316",
    accentColor: "#25D366",
    fontFamilyDisplay: "Cairo",
    fontFamilyBody: "Cairo",
    radius: { sm: "4px", md: "8px", lg: "16px" },
    spacing: { sectionY: "6rem" },
  },
};

// ── Legacy shape (HomepageContent) ─────────────────────────
// Used by LandingTemplateCesro.tsx and its sections until Phase 3.
// DO NOT remove until renderers are migrated.
// ── Dev-time schema validation ─────────────────────────────
// Runs client-side only (Vite injects DEV=true). Server-side tsx runner
// doesn't have import.meta.env so we guard with a try/catch.
try {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (import.meta.env.DEV) {
    import("./validators").then(({ cesroLandingContentSchema }) => {
      const result = cesroLandingContentSchema.safeParse(CESRO_DEFAULT_CONTENT);
      if (result.success) {
        console.log("Cesro defaults valid");
      } else {
        console.error("Cesro defaults INVALID:", result.error.format());
        throw new Error("CESRO_DEFAULT_CONTENT fails schema validation");
      }
    });
  }
} catch {
  // Server-side (tsx): import.meta.env may not exist — skip validation
}
