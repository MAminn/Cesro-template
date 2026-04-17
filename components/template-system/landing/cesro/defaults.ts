/**
 * Cesro Landing Template — Default Editable Content
 *
 * Arabic copy harvested from cesro/src/i18n/ar.ts (standalone prototype).
 * All strings live here; components receive them as props via HomepageContent.
 */

import type { HomepageContent } from "#root/shared/types/homepage-content";
import { ValuePropIconType } from "#root/shared/types/homepage-content";

export const CESRO_DEFAULT_CONTENT: HomepageContent = {
  meta: {
    enabled: true,
    pageTitle: "CESRO — جينز بالجملة في مصر",
    pageDescription:
      "مورّد جينز بالجملة في مصر — تشكيلة موديلات متنوعة بأسعار جملة تنافسية. تواصل معانا على واتساب.",
  },
  hero: {
    enabled: true,
    eyebrow: "مورّد جينز بالجملة في مصر",
    title: "جينز بالجملة",
    subtitle: "لكل مصر",
    bodyText:
      "نوفّر لمحلات الملابس والتجّار تشكيلة جينز متنوعة بأسعار جملة تنافسية. تواصل معانا على واتساب — الرد فوري.",
    ctaText: "تواصل واتساب",
    ctaLink: "#whatsapp",
    secondaryCtaText: "اطلب عرض أسعار",
    secondaryCtaLink: "مرحبًا، أريد طلب عرض أسعار للجينز بالجملة",
    badgeText: "رد سريع عبر واتساب بيزنس",
    backgroundImage: undefined,
    mobileBackgroundImage: undefined,
    heroSlides: [],
  },
  brandStatement: {
    enabled: false,
    title: "",
    description: "",
  },
  promoBanner: {
    enabled: false,
    text: "",
  },
  categories: {
    enabled: true,
    title: "تسوّق حسب الفئة",
    titleAr: "تسوّق حسب الفئة",
    subtitle: "",
    ctaText: "عرض الكل",
    ctaLink: "/shop",
  },
  featuredProducts: {
    enabled: true,
    title: "منتجات مميزة",
    titleAr: "منتجات مميزة",
    subtitle: "",
    viewAllText: "عرض الكل",
    viewAllTextAr: "عرض الكل",
    viewAllLink: "/shop",
  },
  valueProps: {
    enabled: false,
    items: [
      {
        icon: ValuePropIconType.QUALITY,
        title: "تشكيلة موديلات",
        description: "موديلات متنوعة تناسب كل الأذواق والأسواق",
      },
      {
        icon: ValuePropIconType.SHOPPING,
        title: "أسعار جملة",
        description: "أسعار تنافسية للتجّار وأصحاب المحلات",
      },
      {
        icon: ValuePropIconType.SHIPPING,
        title: "توريد منتظم",
        description: "بضاعة جاهزة وتوريد مستمر على مدار السنة",
      },
      {
        icon: ValuePropIconType.SUPPORT,
        title: "خدمة واتساب سريعة",
        description: "تواصل مباشر ورد فوري على كل استفساراتك",
      },
    ],
  },
  newsletter: {
    enabled: false,
    title: "",
    subtitle: "",
    placeholderText: "",
    ctaText: "",
    privacyText: "",
  },
  footerCta: {
    enabled: true,
    eyebrow: "ابدأ دلوقتي",
    title: "جاهز تطلب؟",
    subtitle: "كلّمنا على واتساب",
    bodyText:
      "استفسارات، أسعار، كميات، موديلات متاحة — كل حاجة بنرد عليها فورًا على واتساب.",
    ctaText: "تواصل على واتساب",
    ctaLink: "مرحبًا، أريد الاستفسار عن الجينز بالجملة",
    trustTags: ["رد فوري", "واتساب بيزنس", "بدون التزام"],
    backgroundImage: undefined,
  },
  aboutUs: {
    enabled: true,
    eyebrow: "من نحن",
    title: "مكتب جملة جينز",
    titleAr: "مكتب جملة جينز",
    subtitle: "في قلب مصر",
    description:
      "نحن مكتب متخصص في توريد الجينز بالجملة لمحلات الملابس والتجّار في مصر. نوفّر بضاعة جاهزة بموديلات متنوعة وأسعار تنافسية تناسب السوق المصري.",
    descriptionAr:
      "نحن مكتب متخصص في توريد الجينز بالجملة لمحلات الملابس والتجّار في مصر. نوفّر بضاعة جاهزة بموديلات متنوعة وأسعار تنافسية تناسب السوق المصري.",
    secondaryDescription:
      "شغلنا مبني على الثقة والاستمرارية — نشتغل مع محلات وتجّار في كل المحافظات ونوفّر خدمة سريعة ومباشرة عبر واتساب.",
    imageUrl: "",
    highlights: [
      {
        title: "تشكيلة موديلات",
        description: "موديلات متنوعة تناسب كل الأذواق والأسواق",
      },
      {
        title: "أسعار جملة",
        description: "أسعار تنافسية للتجّار وأصحاب المحلات",
      },
      {
        title: "توريد منتظم",
        description: "بضاعة جاهزة وتوريد مستمر على مدار السنة",
      },
      {
        title: "خدمة واتساب سريعة",
        description: "تواصل مباشر ورد فوري على كل استفساراتك",
      },
    ],
  },
  discountedProducts: {
    enabled: false,
    title: "",
    viewAllText: "",
    viewAllLink: "/shop",
  },
  newArrivals: {
    enabled: false,
    title: "",
    viewAllText: "",
    viewAllLink: "/shop",
  },
};
