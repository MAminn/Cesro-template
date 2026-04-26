/**
 * HomepageEditorBody — Panel composition for Demos 1–4
 *
 * Extracted from the original HomepageContentEditor. Renders
 * the exact same panel stack (Hero, Hero Slides, Brand Statement,
 * Promo Banner, Value Props, Marquee, Categories, Discounted Products,
 * Featured Products, New Arrivals, Bottom Carousel, Contact Banner,
 * Product Carousel Title, About Us, Newsletter, Footer CTA,
 * Translation Overrides) with the same conditional logic.
 *
 * Receives content + onChange from the shared shell. Does NOT own
 * save, load, or template selection logic.
 */

import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Switch } from "#root/components/ui/switch";
import { Textarea } from "#root/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  ValuePropIconType,
  type HomepageContent,
  type ValuePropItem,
} from "#root/shared/types/homepage-content";
import {
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  Copy,
  X,
  Check,
  ExternalLink,
  Languages,
} from "lucide-react";
import { HomepageProductPicker } from "#root/components/admin/HomepageProductPicker";
import { translations as staticTranslations } from "#root/lib/i18n/translations";
import type { TranslationOverrides } from "#root/shared/types/layout-settings";
import { getStoreOwnerId } from "#root/shared/config/store";
import type { DemoEditorBodyProps } from "#root/components/template-system/editor-registry";
import { Save } from "lucide-react";

// Predefined route options for hero CTA
const PREDEFINED_ROUTES = [
  { label: "Shop - All Products", value: "/shop" },
  { label: "Cart - Shopping Cart", value: "/cart" },
  { label: "Checkout - Checkout Page", value: "/checkout" },
  { label: "Custom URL...", value: "custom" },
] as const;

// Translation key groups for the CMS editor
const TRANSLATION_GROUPS = [
  {
    label: "Navigation",
    keys: [
      { key: "nav.search", label: "Search Placeholder" },
      { key: "nav.login", label: "Login Button" },
      { key: "nav.dashboard", label: "Dashboard Link" },
      { key: "nav.logout", label: "Logout Button" },
      { key: "nav.cart", label: "Cart Icon Label" },
      { key: "nav.menu", label: "Menu Button" },
    ],
  },
  {
    label: "Product & Shop",
    keys: [
      { key: "shop_now", label: "Shop Now Button" },
      { key: "add_to_cart", label: "Add to Cart Button" },
      { key: "quick_view", label: "Quick View Button" },
      { key: "new", label: '"New" Badge' },
      { key: "sale", label: '"Sale" Badge' },
      { key: "exclusive", label: '"Exclusive" Badge' },
      { key: "best_seller", label: '"Best Seller" Badge' },
      { key: "in_stock", label: "In Stock Label" },
      { key: "out_of_stock", label: "Out of Stock Label" },
      { key: "price_includes_tax", label: "Price Includes Tax" },
      { key: "more", label: "More Button" },
      { key: "close", label: "Close Button" },
      { key: "weight", label: "Weight Label" },
      { key: "model_number", label: "Model Number Label" },
      { key: "description", label: "Description Label" },
    ],
  },
  {
    label: "Footer",
    keys: [
      { key: "footer.copyright", label: "Copyright Text" },
      { key: "footer.contact", label: "Contact Heading" },
      { key: "footer.links", label: "Links Heading" },
    ],
  },
  {
    label: "Wishlist",
    keys: [
      { key: "added_to_wishlist", label: "Added to Wishlist" },
      { key: "removed_from_wishlist", label: "Removed from Wishlist" },
    ],
  },
  {
    label: "Currency",
    keys: [{ key: "currency", label: "Currency Symbol" }],
  },
] as const;

interface HomepageEditorBodyProps extends DemoEditorBodyProps<HomepageContent> {
  selectedTemplateId: string;
}

export function HomepageEditorBody({
  content,
  onChange,
  selectedTemplateId,
}: HomepageEditorBodyProps) {
  const MERCHANT_ID = getStoreOwnerId();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingMobileImage, setIsUploadingMobileImage] = useState(false);
  const [imageUrlCopied, setImageUrlCopied] = useState(false);

  // Hero CTA dropdown state
  const [heroCTAMode, setHeroCTAMode] = useState<"predefined" | "custom">(
    "predefined",
  );
  const [heroCTACustomValue, setHeroCTACustomValue] = useState("");

  // ─── i18n Translation Overrides ──────────────
  const [translationOverrides, setTranslationOverrides] =
    useState<TranslationOverrides>({ en: {}, ar: {} });
  const [originalTranslationOverrides, setOriginalTranslationOverrides] =
    useState<TranslationOverrides>({ en: {}, ar: {} });
  const [isSavingTranslations, setIsSavingTranslations] = useState(false);
  const [hasUnsavedTranslations, setHasUnsavedTranslations] = useState(false);

  // Sync hero CTA mode when content changes externally (e.g. on load)
  useEffect(() => {
    const ctaLink = content.hero.ctaLink;
    const isPredefined = PREDEFINED_ROUTES.some(
      (route) => route.value === ctaLink,
    );
    if (isPredefined) {
      setHeroCTAMode("predefined");
    } else {
      setHeroCTAMode("custom");
      setHeroCTACustomValue(ctaLink);
    }
  }, []);

  // Load translations
  useEffect(() => {
    loadTranslations();
  }, [selectedTemplateId]);

  useEffect(() => {
    setHasUnsavedTranslations(
      JSON.stringify(translationOverrides) !==
        JSON.stringify(originalTranslationOverrides),
    );
  }, [translationOverrides, originalTranslationOverrides]);

  const loadTranslations = async () => {
    try {
      const res = await trpc.layout.getSettings.query({
        merchantId: MERCHANT_ID,
        templateId: selectedTemplateId,
      });
      if (res.success && res.result?.translationOverrides) {
        setTranslationOverrides(res.result.translationOverrides);
        setOriginalTranslationOverrides(res.result.translationOverrides);
      }
    } catch (err) {
      console.error("Error loading translations:", err);
    }
  };

  const handleSaveTranslations = async () => {
    setIsSavingTranslations(true);
    try {
      const current = await trpc.layout.getSettings.query({
        merchantId: MERCHANT_ID,
        templateId: selectedTemplateId,
      });
      if (!current.success || !current.result) {
        toast.error("Failed to load layout settings");
        return;
      }
      await trpc.layout.updateSettings.mutate({
        merchantId: MERCHANT_ID,
        templateId: selectedTemplateId,
        content: { ...current.result, translationOverrides },
      });
      setOriginalTranslationOverrides(translationOverrides);
      setHasUnsavedTranslations(false);
      toast.success("Translations saved!");
    } catch (err) {
      console.error("Error saving translations:", err);
      toast.error("Error saving translations");
    } finally {
      setIsSavingTranslations(false);
    }
  };

  const updateTranslation = (
    locale: "en" | "ar",
    key: string,
    value: string,
  ) => {
    setTranslationOverrides((prev) => {
      const localeOverrides = { ...prev[locale] };
      if (value === staticTranslations[locale][key]) {
        delete localeOverrides[key];
      } else {
        localeOverrides[key] = value;
      }
      return { ...prev, [locale]: localeOverrides };
    });
  };

  const getTranslationValue = (locale: "en" | "ar", key: string): string => {
    return (
      translationOverrides[locale]?.[key] ??
      staticTranslations[locale][key] ??
      key
    );
  };

  const setContent = (
    updater: HomepageContent | ((prev: HomepageContent) => HomepageContent),
  ) => {
    if (typeof updater === "function") {
      onChange(updater(content));
    } else {
      onChange(updater);
    }
  };

  // Upload hero background image
  const handleUploadHeroImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const result = await trpc.homepage.uploadHeroImage.mutate({
        file: { name: file.name, type: file.type, buffer },
      });

      if (result.success && result.data) {
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, backgroundImage: result.data.url },
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveHeroImage = () => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, backgroundImage: undefined },
    }));
    toast.info("Background image removed");
  };

  const handleUploadMobileHeroImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingMobileImage(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const result = await trpc.homepage.uploadMobileHeroImage.mutate({
        file: { name: file.name, type: file.type, buffer },
      });

      if (result.success && result.data) {
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, mobileBackgroundImage: result.data.url },
        }));
        toast.success("Mobile hero image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Mobile upload error:", error);
      toast.error("Error uploading mobile image");
    } finally {
      setIsUploadingMobileImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveMobileHeroImage = () => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, mobileBackgroundImage: undefined },
    }));
    toast.info("Mobile background image removed");
  };

  const handleCopyImageUrl = async () => {
    if (!content.hero.backgroundImage) return;
    try {
      await navigator.clipboard.writeText(content.hero.backgroundImage);
      setImageUrlCopied(true);
      toast.success("Image URL copied!");
      setTimeout(() => setImageUrlCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy URL");
    }
  };

  const handleUploadBrandStatementImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const result = await trpc.homepage.uploadHeroImage.mutate({
        file: { name: file.name, type: file.type, buffer },
        preserveAspect: true,
      });

      if (result.success && result.data) {
        setContent((prev) => ({
          ...prev,
          brandStatement: { ...prev.brandStatement, image: result.data.url },
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveBrandStatementImage = () => {
    setContent((prev) => ({
      ...prev,
      brandStatement: { ...prev.brandStatement, image: undefined },
    }));
    toast.info("Brand statement image removed");
  };

  const handleHeroCTAChange = (value: string) => {
    if (value === "custom") {
      setHeroCTAMode("custom");
      setContent((prev) => ({
        ...prev,
        hero: { ...prev.hero, ctaLink: heroCTACustomValue || "" },
      }));
    } else {
      setHeroCTAMode("predefined");
      setContent((prev) => ({
        ...prev,
        hero: { ...prev.hero, ctaLink: value },
      }));
    }
  };

  const handleCustomCTAChange = (value: string) => {
    setHeroCTACustomValue(value);
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, ctaLink: value },
    }));
  };

  const validateCustomCTA = (value: string): boolean => {
    if (!value) return false;
    return (
      value.startsWith("/") ||
      value.startsWith("https://") ||
      value.startsWith("http://")
    );
  };

  const addValueProp = () => {
    if (content.valueProps.items.length >= 6) {
      toast.error("Maximum 6 value propositions allowed");
      return;
    }
    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: [
          ...prev.valueProps.items,
          {
            icon: ValuePropIconType.SHOPPING,
            title: "New Feature",
            description: "Description here",
          },
        ],
      },
    }));
  };

  const removeValueProp = (index: number) => {
    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: prev.valueProps.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateValueProp = (
    index: number,
    field: keyof ValuePropItem,
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: prev.valueProps.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const getHeroTitleWarning = () => {
    if (content.hero.title.length > 40)
      return "Title is longer than recommended (40 characters)";
    return null;
  };

  const getHeroSubtitleWarning = () => {
    if (content.hero.subtitle.length > 90)
      return "Subtitle is longer than recommended (90 characters)";
    return null;
  };

  const getHeroCtaTextWarning = () => {
    if (content.hero.ctaText.length > 20)
      return "Button label is longer than recommended (20 characters)";
    return null;
  };

  const getHeroImageWarning = () => {
    const url = content.hero.backgroundImage;
    if (url && !url.startsWith("/") && !url.startsWith("http"))
      return "URL should start with / or http";
    return null;
  };

  const getPromoBannerWarning = () => {
    if (content.promoBanner.enabled && !content.promoBanner.text.trim())
      return "Banner is enabled but text is empty";
    if (content.promoBanner.linkUrl && !content.promoBanner.linkText?.trim())
      return "Link URL exists but link text is empty";
    return null;
  };

  const getValuePropWarning = (item: ValuePropItem) => {
    if (!item.title.trim()) return "Title is empty";
    if (!item.description.trim()) return "Description is empty";
    return null;
  };

  const isMinimal = selectedTemplateId === "landing-minimal";

  const ArabicInput = ({
    translationKey,
    type = "input",
  }: {
    translationKey: string;
    type?: "input" | "textarea";
  }) => {
    if (!isMinimal) return null;
    const value = getTranslationValue("ar", translationKey);
    const placeholder =
      staticTranslations.ar[translationKey] || "Arabic translation";
    if (type === "textarea") {
      return (
        <div className='mt-1'>
          <Label className='text-xs text-muted-foreground flex items-center gap-1'>
            <Languages className='w-3 h-3' /> Arabic
          </Label>
          <Textarea
            dir='rtl'
            value={value}
            onChange={(e) =>
              updateTranslation("ar", translationKey, e.target.value)
            }
            placeholder={placeholder}
            rows={2}
            className='text-sm mt-0.5'
          />
        </div>
      );
    }
    return (
      <div className='mt-1'>
        <Label className='text-xs text-muted-foreground flex items-center gap-1'>
          <Languages className='w-3 h-3' /> Arabic
        </Label>
        <Input
          dir='rtl'
          value={value}
          onChange={(e) =>
            updateTranslation("ar", translationKey, e.target.value)
          }
          placeholder={placeholder}
          className='text-sm mt-0.5'
        />
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Hero Section — only for non-minimal templates */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Hero Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='hero-enabled'>Enabled</Label>
                <Switch
                  id='hero-enabled'
                  checked={content.hero.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='hero-title'>Title</Label>
              <Input
                id='hero-title'
                value={content.hero.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value },
                  }))
                }
                placeholder='Welcome to Our Store'
                disabled={!content.hero.enabled}
              />
              {getHeroTitleWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroTitleWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-subtitle'>Subtitle</Label>
              <Textarea
                id='hero-subtitle'
                value={content.hero.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle: e.target.value },
                  }))
                }
                placeholder='Discover amazing products curated just for you'
                disabled={!content.hero.enabled}
                rows={2}
              />
              {getHeroSubtitleWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroSubtitleWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-cta-text'>Primary Button Label</Label>
              <Input
                id='hero-cta-text'
                value={content.hero.ctaText}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, ctaText: e.target.value },
                  }))
                }
                placeholder='Start Shopping'
                disabled={!content.hero.enabled}
              />
              {getHeroCtaTextWarning() && (
                <p className='text-sm text-amber-600 mt-1'>
                  ⚠️ {getHeroCtaTextWarning()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='hero-cta-link'>Primary Button Link</Label>
              {heroCTAMode === "predefined" ? (
                <Select
                  value={content.hero.ctaLink}
                  onValueChange={handleHeroCTAChange}
                  disabled={!content.hero.enabled}>
                  <SelectTrigger id='hero-cta-link'>
                    <SelectValue placeholder='Select a page' />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Input
                      value={heroCTACustomValue}
                      onChange={(e) => handleCustomCTAChange(e.target.value)}
                      placeholder='/your-page or https://example.com'
                      disabled={!content.hero.enabled}
                      className={
                        heroCTACustomValue &&
                        !validateCustomCTA(heroCTACustomValue)
                          ? "border-red-500"
                          : ""
                      }
                    />
                    <Button
                      variant='outline'
                      onClick={() => {
                        setHeroCTAMode("predefined");
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, ctaLink: "/shop" },
                        }));
                      }}
                      disabled={!content.hero.enabled}>
                      Use Preset
                    </Button>
                  </div>
                  {heroCTACustomValue &&
                    !validateCustomCTA(heroCTACustomValue) && (
                      <p className='text-sm text-red-500'>
                        URL must start with / or https://
                      </p>
                    )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor='hero-bg-image'>
                Background Image URL (optional)
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='hero-bg-image'
                  value={content.hero.backgroundImage || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        backgroundImage: e.target.value || undefined,
                      },
                    }))
                  }
                  placeholder='/uploads/homepage/hero.webp or https://...'
                  disabled={!content.hero.enabled}
                />
                <div className='flex gap-2'>
                  {content.hero.backgroundImage && (
                    <>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        disabled={!content.hero.enabled}
                        onClick={handleCopyImageUrl}
                        title='Copy URL'>
                        {imageUrlCopied ? (
                          <Check className='w-4 h-4' />
                        ) : (
                          <Copy className='w-4 h-4' />
                        )}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        disabled={!content.hero.enabled}
                        onClick={handleRemoveHeroImage}
                        title='Remove image'>
                        <X className='w-4 h-4' />
                      </Button>
                    </>
                  )}
                  <input
                    type='file'
                    id='hero-image-upload'
                    accept='image/jpeg,image/jpg,image/png,image/webp'
                    onChange={handleUploadHeroImage}
                    disabled={!content.hero.enabled || isUploadingImage}
                    className='hidden'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='md'
                    disabled={!content.hero.enabled || isUploadingImage}
                    onClick={() =>
                      document.getElementById("hero-image-upload")?.click()
                    }>
                    {isUploadingImage ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className='w-4 h-4 mr-2' />
                        {content.hero.backgroundImage ? "Replace" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className='space-y-1 mt-1'>
                <p className='text-sm text-muted-foreground'>
                  Recommended size: 1920×1080 • Max size: 5MB (JPG, PNG, WebP)
                </p>
                {getHeroImageWarning() && (
                  <p className='text-sm text-amber-600'>
                    ⚠️ {getHeroImageWarning()}
                  </p>
                )}
              </div>
              {content.hero.backgroundImage && (
                <div className='mt-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Preview:
                    </Label>
                    <a
                      href={content.hero.backgroundImage}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1'>
                      <ExternalLink className='w-3 h-3' />
                      Open in new tab
                    </a>
                  </div>
                  <div className='relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted'>
                    <img
                      src={content.hero.backgroundImage}
                      alt='Hero background preview'
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="flex items-center justify-center h-full text-sm text-muted-foreground">Failed to load image. Check URL.</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Background Image */}
            <div>
              <Label htmlFor='hero-mobile-bg-image'>
                Mobile Background Image (optional)
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='hero-mobile-bg-image'
                  value={content.hero.mobileBackgroundImage || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        mobileBackgroundImage: e.target.value || undefined,
                      },
                    }))
                  }
                  placeholder='/uploads/homepage/hero-mobile.webp or https://...'
                  disabled={!content.hero.enabled}
                />
                <div className='flex gap-2'>
                  {content.hero.mobileBackgroundImage && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      disabled={!content.hero.enabled}
                      onClick={handleRemoveMobileHeroImage}
                      title='Remove mobile image'>
                      <X className='w-4 h-4' />
                    </Button>
                  )}
                  <input
                    type='file'
                    id='hero-mobile-image-upload'
                    accept='image/jpeg,image/jpg,image/png,image/webp'
                    onChange={handleUploadMobileHeroImage}
                    disabled={!content.hero.enabled || isUploadingMobileImage}
                    className='hidden'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='md'
                    disabled={!content.hero.enabled || isUploadingMobileImage}
                    onClick={() =>
                      document
                        .getElementById("hero-mobile-image-upload")
                        ?.click()
                    }>
                    {isUploadingMobileImage ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className='w-4 h-4 mr-2' />
                        {content.hero.mobileBackgroundImage
                          ? "Replace"
                          : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className='text-sm text-muted-foreground mt-1'>
                Used on mobile screens only (≤640px). Falls back to desktop hero
                image if empty.
              </p>
              {content.hero.mobileBackgroundImage && (
                <div className='mt-3'>
                  <Label className='text-sm text-muted-foreground'>
                    Preview:
                  </Label>
                  <div className='relative w-full max-w-50 h-32 rounded-lg overflow-hidden border border-border bg-muted mt-1'>
                    <img
                      src={content.hero.mobileBackgroundImage}
                      alt='Mobile hero background preview'
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="flex items-center justify-center h-full text-sm text-muted-foreground">Failed to load image.</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Carousel Slides */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>Hero Carousel Slides</CardTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!content.hero.enabled}
              onClick={() => {
                const newSlide = {
                  id: crypto.randomUUID(),
                  imageUrl: "",
                  mobileImageUrl: undefined as string | undefined,
                  linkUrl: undefined as string | undefined,
                  alt: undefined as string | undefined,
                };
                setContent((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    heroSlides: [...(prev.hero.heroSlides || []), newSlide],
                  },
                }));
              }}>
              <Plus className='w-4 h-4 mr-1' />
              Add Slide
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Add multiple images for the hero carousel. When slides are added
            here, they take priority over the single background image above. For
            templates like Minimal, this is the primary way to manage hero
            images.
          </p>

          {(content.hero.heroSlides || []).length === 0 ? (
            <div className='text-center py-8 text-sm text-muted-foreground border border-dashed border-gray-200 rounded-lg'>
              <ImageIcon className='w-8 h-8 mx-auto mb-2 text-gray-300' />
              <p>
                No carousel slides yet. Add slides to create an image carousel.
              </p>
              <p className='text-xs mt-1'>
                Falls back to the single background image above.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {(content.hero.heroSlides || []).map((slide, index) => (
                <div
                  key={slide.id}
                  className='border border-gray-200 rounded-lg p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>
                      Slide {index + 1}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50'
                      onClick={() => {
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            heroSlides: (prev.hero.heroSlides || []).filter(
                              (s) => s.id !== slide.id,
                            ),
                          },
                        }));
                      }}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>

                  {/* Desktop image */}
                  <div>
                    <Label className='text-xs'>Desktop Image</Label>
                    <div className='flex gap-2 mt-1'>
                      <Input
                        value={slide.imageUrl}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              heroSlides: (prev.hero.heroSlides || []).map(
                                (s) =>
                                  s.id === slide.id
                                    ? { ...s, imageUrl: e.target.value }
                                    : s,
                              ),
                            },
                          }));
                        }}
                        placeholder='/uploads/homepage/slide.webp'
                        className='text-sm'
                      />
                      <input
                        type='file'
                        id={`hero-slide-upload-${slide.id}`}
                        accept='image/jpeg,image/jpg,image/png,image/webp'
                        className='hidden'
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("File too large. Max 5MB.");
                            return;
                          }
                          try {
                            const buffer = new Uint8Array(
                              await file.arrayBuffer(),
                            );
                            const result =
                              await trpc.homepage.uploadHeroImage.mutate({
                                file: {
                                  name: file.name,
                                  type: file.type,
                                  buffer,
                                },
                              });
                            if (result.success && result.data) {
                              setContent((prev) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  heroSlides: (prev.hero.heroSlides || []).map(
                                    (s) =>
                                      s.id === slide.id
                                        ? { ...s, imageUrl: result.data.url }
                                        : s,
                                  ),
                                },
                              }));
                              toast.success("Slide image uploaded!");
                            }
                          } catch {
                            toast.error("Upload failed");
                          }
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          document
                            .getElementById(`hero-slide-upload-${slide.id}`)
                            ?.click()
                        }>
                        <Upload className='w-4 h-4' />
                      </Button>
                    </div>
                    {slide.imageUrl && (
                      <div className='mt-2 h-20 rounded overflow-hidden border bg-muted'>
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${index + 1}`}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile image */}
                  <div>
                    <Label className='text-xs'>Mobile Image (optional)</Label>
                    <div className='flex gap-2 mt-1'>
                      <Input
                        value={slide.mobileImageUrl || ""}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              heroSlides: (prev.hero.heroSlides || []).map(
                                (s) =>
                                  s.id === slide.id
                                    ? {
                                        ...s,
                                        mobileImageUrl:
                                          e.target.value || undefined,
                                      }
                                    : s,
                              ),
                            },
                          }));
                        }}
                        placeholder='Optional mobile-specific image'
                        className='text-sm'
                      />
                      <input
                        type='file'
                        id={`hero-slide-mobile-upload-${slide.id}`}
                        accept='image/jpeg,image/jpg,image/png,image/webp'
                        className='hidden'
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("File too large. Max 5MB.");
                            return;
                          }
                          try {
                            const buffer = new Uint8Array(
                              await file.arrayBuffer(),
                            );
                            const result =
                              await trpc.homepage.uploadMobileHeroImage.mutate({
                                file: {
                                  name: file.name,
                                  type: file.type,
                                  buffer,
                                },
                              });
                            if (result.success && result.data) {
                              setContent((prev) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  heroSlides: (prev.hero.heroSlides || []).map(
                                    (s) =>
                                      s.id === slide.id
                                        ? {
                                            ...s,
                                            mobileImageUrl: result.data.url,
                                          }
                                        : s,
                                  ),
                                },
                              }));
                              toast.success("Mobile slide image uploaded!");
                            }
                          } catch {
                            toast.error("Upload failed");
                          }
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          document
                            .getElementById(
                              `hero-slide-mobile-upload-${slide.id}`,
                            )
                            ?.click()
                        }>
                        <Upload className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <Label className='text-xs'>Link URL (optional)</Label>
                    <Input
                      value={slide.linkUrl || ""}
                      onChange={(e) => {
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            heroSlides: (prev.hero.heroSlides || []).map((s) =>
                              s.id === slide.id
                                ? {
                                    ...s,
                                    linkUrl: e.target.value || undefined,
                                  }
                                : s,
                            ),
                          },
                        }));
                      }}
                      placeholder='/shop or https://...'
                      className='text-sm mt-1'
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Statement Section — only for non-minimal templates */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Brand Statement Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='brand-statement-enabled'>Enabled</Label>
                <Switch
                  id='brand-statement-enabled'
                  checked={content.brandStatement.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      brandStatement: {
                        ...prev.brandStatement,
                        enabled: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='brand-statement-title'>Title</Label>
              <Input
                id='brand-statement-title'
                value={content.brandStatement.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder='Worn with intention. Designed for life.'
                disabled={!content.brandStatement.enabled}
              />
            </div>

            <div>
              <Label htmlFor='brand-statement-description'>Description</Label>
              <Textarea
                id='brand-statement-description'
                value={content.brandStatement.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      description: e.target.value,
                    },
                  }))
                }
                placeholder='Every piercing is an expression of self...'
                disabled={!content.brandStatement.enabled}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='brand-statement-image'>
                Image URL (optional)
              </Label>
              <Input
                id='brand-statement-image'
                value={content.brandStatement.image || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    brandStatement: {
                      ...prev.brandStatement,
                      image: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='/uploads/homepage/brand-statement.jpg'
                disabled={!content.brandStatement.enabled}
              />
              <p className='text-sm text-muted-foreground mt-1'>
                Recommended: Editorial portrait image (ear piercing close-up)
              </p>

              <div className='flex gap-2 mt-3'>
                <input
                  type='file'
                  id='brand-statement-file-input'
                  accept='image/jpeg,image/jpg,image/png,image/webp'
                  onChange={handleUploadBrandStatementImage}
                  className='hidden'
                  disabled={!content.brandStatement.enabled || isUploadingImage}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!content.brandStatement.enabled || isUploadingImage}
                  onClick={() =>
                    document
                      .getElementById("brand-statement-file-input")
                      ?.click()
                  }>
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
                {content.brandStatement.image && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleRemoveBrandStatementImage}
                    disabled={
                      !content.brandStatement.enabled || isUploadingImage
                    }>
                    Remove
                  </Button>
                )}
              </div>

              {content.brandStatement.image && (
                <div className='mt-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm text-muted-foreground'>
                      Preview:
                    </Label>
                  </div>
                  <div className='relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted'>
                    <img
                      src={content.brandStatement.image}
                      alt='Brand statement preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Banner Section — only for non-minimal templates */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Promotional Banner</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='promo-enabled'>Enabled</Label>
                <Switch
                  id='promo-enabled'
                  checked={content.promoBanner.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      promoBanner: { ...prev.promoBanner, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {getPromoBannerWarning() && (
              <div className='text-sm text-amber-600 p-3 bg-amber-50 rounded-md border border-amber-200'>
                ⚠️ {getPromoBannerWarning()}
              </div>
            )}
            <div>
              <Label htmlFor='promo-text'>Banner Text</Label>
              <Input
                id='promo-text'
                value={content.promoBanner.text}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: {
                      ...prev.promoBanner,
                      text: e.target.value,
                    },
                  }))
                }
                placeholder='🎉 Special Offer: Get 20% off!'
                disabled={!content.promoBanner.enabled}
              />
            </div>

            <div>
              <Label htmlFor='promo-url'>Link URL (optional)</Label>
              <Input
                id='promo-url'
                value={content.promoBanner.linkUrl || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: {
                      ...prev.promoBanner,
                      linkUrl: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='/sale or https://...'
                disabled={!content.promoBanner.enabled}
              />
            </div>

            <div>
              <Label htmlFor='promo-link-text'>Link Text (optional)</Label>
              <Input
                id='promo-link-text'
                value={content.promoBanner.linkText || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoBanner: {
                      ...prev.promoBanner,
                      linkText: e.target.value || undefined,
                    },
                  }))
                }
                placeholder='Shop Now'
                disabled={!content.promoBanner.enabled}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Propositions Section — only for non-minimal templates */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Value Propositions</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='valueprops-enabled'>Enabled</Label>
                <Switch
                  id='valueprops-enabled'
                  checked={content.valueProps.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      valueProps: { ...prev.valueProps, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {content.valueProps.items.map((item, index) => (
              <div key={index} className='border rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-sm'>Item {index + 1}</h4>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeValueProp(index)}
                    disabled={
                      !content.valueProps.enabled ||
                      content.valueProps.items.length <= 1
                    }>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>

                <div>
                  <Label>Icon</Label>
                  <Select
                    value={item.icon}
                    onValueChange={(value) =>
                      updateValueProp(index, "icon", value)
                    }
                    disabled={!content.valueProps.enabled}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ValuePropIconType.SHOPPING}>
                        Shopping (Bag)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SHIPPING}>
                        Shipping (Truck)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SECURITY}>
                        Security (Shield)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.SUPPORT}>
                        Support (Headphones)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.QUALITY}>
                        Quality (Award)
                      </SelectItem>
                      <SelectItem value={ValuePropIconType.RETURNS}>
                        Returns (Refresh)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateValueProp(index, "title", e.target.value)
                    }
                    placeholder='Fast Shipping'
                    disabled={!content.valueProps.enabled}
                  />
                  {getValuePropWarning(item) && (
                    <p className='text-sm text-amber-600 mt-1'>
                      ⚠️ {getValuePropWarning(item)}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      updateValueProp(index, "description", e.target.value)
                    }
                    placeholder='Get your orders delivered quickly'
                    disabled={!content.valueProps.enabled}
                    rows={2}
                  />
                </div>
              </div>
            ))}

            {content.valueProps.items.length < 6 && (
              <Button
                variant='outline'
                onClick={addValueProp}
                disabled={!content.valueProps.enabled}
                className='w-full'>
                <Plus className='w-4 h-4 mr-2' />
                Add Value Proposition ({content.valueProps.items.length}/6)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Marquee — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Scrolling Marquee</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='marquee-enabled'>Enabled</Label>
                <Switch
                  id='marquee-enabled'
                  checked={content.marquee?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      marquee: {
                        ...prev.marquee,
                        enabled: checked,
                        text: prev.marquee?.text ?? "",
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='marquee-text'>Marquee Text (English)</Label>
              <Input
                id='marquee-text'
                value={content.marquee?.text ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    marquee: {
                      enabled: prev.marquee?.enabled ?? false,
                      text: e.target.value,
                    },
                  }))
                }
                placeholder='Free shipping on orders over $50 ✦ New arrivals every week'
                disabled={!content.marquee?.enabled}
              />
            </div>
            <div>
              <Label htmlFor='marquee-text-ar'>Marquee Text (Arabic)</Label>
              <Input
                id='marquee-text-ar'
                dir='rtl'
                value={content.marquee?.textAr ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    marquee: {
                      enabled: prev.marquee?.enabled ?? false,
                      text: prev.marquee?.text ?? "",
                      textAr: e.target.value,
                    },
                  }))
                }
                placeholder='شحن مجاني للطلبات فوق 50 دولار'
                disabled={!content.marquee?.enabled}
              />
            </div>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                This text scrolls across the top of the page above the
                navigation bar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Page Promo Line — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <CardTitle>Product Page Promo Line</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='promo-line-text'>Promo Text (English)</Label>
              <Input
                id='promo-line-text'
                value={content.promoLine?.text ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoLine: {
                      ...prev.promoLine,
                      text: e.target.value,
                      textAr: prev.promoLine?.textAr ?? "",
                    },
                  }))
                }
                placeholder='Free delivery on orders over 100 SAR'
              />
            </div>
            <div>
              <Label htmlFor='promo-line-text-ar'>Promo Text (Arabic)</Label>
              <Input
                id='promo-line-text-ar'
                dir='rtl'
                value={content.promoLine?.textAr ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    promoLine: {
                      ...prev.promoLine,
                      text: prev.promoLine?.text ?? "",
                      textAr: e.target.value,
                    },
                  }))
                }
                placeholder='توصيل مجاني للطلبات فوق 100 ريال'
              />
            </div>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                This text appears on the product detail page between the stock
                status and category carousels.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Section — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Categories Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='categories-enabled'>Enabled</Label>
                <Switch
                  id='categories-enabled'
                  checked={content.categories.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      categories: { ...prev.categories, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='categories-title'>Section Title (English)</Label>
              <Input
                id='categories-title'
                value={content.categories.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    categories: { ...prev.categories, title: e.target.value },
                  }))
                }
                placeholder='Shop by Category'
                disabled={!content.categories.enabled}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.categories.titleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        titleAr: e.target.value,
                      },
                    }))
                  }
                  placeholder='تسوق حسب الفئة'
                  className='text-sm mt-0.5'
                  disabled={!content.categories.enabled}
                />
              </div>
            </div>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                <strong>Note:</strong> Categories are automatically fetched from
                your catalog. This section controls the heading and whether the
                carousel is visible.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discounted Products — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Discounted Products (Offers)</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='discounted-enabled'>Enabled</Label>
                <Switch
                  id='discounted-enabled'
                  checked={content.discountedProducts?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      discountedProducts: {
                        enabled: checked,
                        title: prev.discountedProducts?.title ?? "Offers",
                        viewAllText:
                          prev.discountedProducts?.viewAllText ?? "View All",
                        viewAllLink:
                          prev.discountedProducts?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='discounted-title'>Section Title (English)</Label>
              <Input
                id='discounted-title'
                value={content.discountedProducts?.title ?? "Offers"}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    discountedProducts: {
                      ...prev.discountedProducts!,
                      enabled: prev.discountedProducts?.enabled ?? true,
                      title: e.target.value,
                      viewAllText:
                        prev.discountedProducts?.viewAllText ?? "View All",
                      viewAllLink:
                        prev.discountedProducts?.viewAllLink ?? "/shop",
                    },
                  }))
                }
                placeholder='Offers'
                disabled={!(content.discountedProducts?.enabled ?? true)}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.discountedProducts?.titleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      discountedProducts: {
                        ...prev.discountedProducts!,
                        enabled: prev.discountedProducts?.enabled ?? true,
                        title: prev.discountedProducts?.title ?? "Offers",
                        titleAr: e.target.value,
                        viewAllText:
                          prev.discountedProducts?.viewAllText ?? "View All",
                        viewAllLink:
                          prev.discountedProducts?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                  placeholder='عروض'
                  className='text-sm mt-0.5'
                  disabled={!(content.discountedProducts?.enabled ?? true)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor='discounted-view-all'>
                View All Text (English)
              </Label>
              <Input
                id='discounted-view-all'
                value={content.discountedProducts?.viewAllText ?? "View All"}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    discountedProducts: {
                      ...prev.discountedProducts!,
                      enabled: prev.discountedProducts?.enabled ?? true,
                      title: prev.discountedProducts?.title ?? "Offers",
                      viewAllText: e.target.value,
                      viewAllLink:
                        prev.discountedProducts?.viewAllLink ?? "/shop",
                    },
                  }))
                }
                placeholder='View All'
                disabled={!(content.discountedProducts?.enabled ?? true)}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.discountedProducts?.viewAllTextAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      discountedProducts: {
                        ...prev.discountedProducts!,
                        enabled: prev.discountedProducts?.enabled ?? true,
                        title: prev.discountedProducts?.title ?? "Offers",
                        viewAllText:
                          prev.discountedProducts?.viewAllText ?? "View All",
                        viewAllTextAr: e.target.value,
                        viewAllLink:
                          prev.discountedProducts?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                  placeholder='عرض الكل'
                  className='text-sm mt-0.5'
                  disabled={!(content.discountedProducts?.enabled ?? true)}
                />
              </div>
            </div>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                <strong>Note:</strong> Products are automatically fetched — only
                items with a discount price are shown.
              </p>
            </div>
            <HomepageProductPicker
              selectedIds={content.discountedProducts?.productIds ?? []}
              onChange={(ids) =>
                setContent((prev) => ({
                  ...prev,
                  discountedProducts: {
                    ...prev.discountedProducts!,
                    enabled: prev.discountedProducts?.enabled ?? true,
                    title: prev.discountedProducts?.title ?? "Offers",
                    viewAllText:
                      prev.discountedProducts?.viewAllText ?? "View All",
                    viewAllLink:
                      prev.discountedProducts?.viewAllLink ?? "/shop",
                    productIds: ids.length > 0 ? ids : undefined,
                  },
                }))
              }
              disabled={!(content.discountedProducts?.enabled ?? true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Featured Products Section */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Featured Products Section</CardTitle>
            <div className='flex items-center gap-2'>
              <Label htmlFor='featured-enabled'>Enabled</Label>
              <Switch
                id='featured-enabled'
                checked={content.featuredProducts.enabled}
                onCheckedChange={(checked) =>
                  setContent((prev) => ({
                    ...prev,
                    featuredProducts: {
                      ...prev.featuredProducts,
                      enabled: checked,
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='featured-title'>
              Section Title{isMinimal ? " (English)" : ""}
            </Label>
            <Input
              id='featured-title'
              value={content.featuredProducts.title}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  featuredProducts: {
                    ...prev.featuredProducts,
                    title: e.target.value,
                  },
                }))
              }
              placeholder='Featured Products'
              disabled={!content.featuredProducts.enabled}
            />
            {isMinimal && (
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.featuredProducts.titleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      featuredProducts: {
                        ...prev.featuredProducts,
                        titleAr: e.target.value,
                      },
                    }))
                  }
                  placeholder='منتجات مميزة'
                  className='text-sm mt-0.5'
                  disabled={!content.featuredProducts.enabled}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor='featured-subtitle'>Section Subtitle</Label>
            <Textarea
              id='featured-subtitle'
              value={content.featuredProducts.subtitle}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  featuredProducts: {
                    ...prev.featuredProducts,
                    subtitle: e.target.value,
                  },
                }))
              }
              placeholder='Check out our handpicked selection'
              disabled={!content.featuredProducts.enabled}
              rows={2}
            />
          </div>

          {isMinimal && (
            <div>
              <Label htmlFor='featured-view-all'>View All Text (English)</Label>
              <Input
                id='featured-view-all'
                value={content.featuredProducts.viewAllText}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    featuredProducts: {
                      ...prev.featuredProducts,
                      viewAllText: e.target.value,
                    },
                  }))
                }
                placeholder='View All Products'
                disabled={!content.featuredProducts.enabled}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.featuredProducts.viewAllTextAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      featuredProducts: {
                        ...prev.featuredProducts,
                        viewAllTextAr: e.target.value,
                      },
                    }))
                  }
                  placeholder='عرض الكل'
                  className='text-sm mt-0.5'
                  disabled={!content.featuredProducts.enabled}
                />
              </div>
            </div>
          )}

          <div className='bg-muted p-3 rounded-md'>
            <p className='text-sm text-muted-foreground'>
              <strong>Note:</strong> Products are automatically fetched from
              your catalog. This section only controls the title and subtitle
              text.
            </p>
          </div>
          {isMinimal && (
            <HomepageProductPicker
              selectedIds={content.featuredProducts?.productIds ?? []}
              onChange={(ids) =>
                setContent((prev) => ({
                  ...prev,
                  featuredProducts: {
                    ...prev.featuredProducts,
                    productIds: ids.length > 0 ? ids : undefined,
                  },
                }))
              }
              disabled={!content.featuredProducts.enabled}
            />
          )}
        </CardContent>
      </Card>

      {/* New Arrivals — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>New Arrivals</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='newarrivals-enabled'>Enabled</Label>
                <Switch
                  id='newarrivals-enabled'
                  checked={content.newArrivals?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      newArrivals: {
                        enabled: checked,
                        title: prev.newArrivals?.title ?? "New Arrivals",
                        viewAllText:
                          prev.newArrivals?.viewAllText ?? "View All",
                        viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='newarrivals-title'>Section Title (English)</Label>
              <Input
                id='newarrivals-title'
                value={content.newArrivals?.title ?? "New Arrivals"}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    newArrivals: {
                      ...prev.newArrivals!,
                      enabled: prev.newArrivals?.enabled ?? true,
                      title: e.target.value,
                      viewAllText: prev.newArrivals?.viewAllText ?? "View All",
                      viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                    },
                  }))
                }
                placeholder='New Arrivals'
                disabled={!(content.newArrivals?.enabled ?? true)}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.newArrivals?.titleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      newArrivals: {
                        ...prev.newArrivals!,
                        enabled: prev.newArrivals?.enabled ?? true,
                        title: prev.newArrivals?.title ?? "New Arrivals",
                        titleAr: e.target.value,
                        viewAllText:
                          prev.newArrivals?.viewAllText ?? "View All",
                        viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                  placeholder='وصل حديثاً'
                  className='text-sm mt-0.5'
                  disabled={!(content.newArrivals?.enabled ?? true)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor='newarrivals-view-all'>
                View All Text (English)
              </Label>
              <Input
                id='newarrivals-view-all'
                value={content.newArrivals?.viewAllText ?? "View All"}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    newArrivals: {
                      ...prev.newArrivals!,
                      enabled: prev.newArrivals?.enabled ?? true,
                      title: prev.newArrivals?.title ?? "New Arrivals",
                      viewAllText: e.target.value,
                      viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                    },
                  }))
                }
                placeholder='View All'
                disabled={!(content.newArrivals?.enabled ?? true)}
              />
              <div className='mt-1'>
                <Label className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Languages className='w-3 h-3' /> Arabic
                </Label>
                <Input
                  dir='rtl'
                  value={content.newArrivals?.viewAllTextAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      newArrivals: {
                        ...prev.newArrivals!,
                        enabled: prev.newArrivals?.enabled ?? true,
                        title: prev.newArrivals?.title ?? "New Arrivals",
                        viewAllText:
                          prev.newArrivals?.viewAllText ?? "View All",
                        viewAllTextAr: e.target.value,
                        viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                      },
                    }))
                  }
                  placeholder='عرض الكل'
                  className='text-sm mt-0.5'
                  disabled={!(content.newArrivals?.enabled ?? true)}
                />
              </div>
            </div>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                <strong>Note:</strong> Products are automatically fetched — only
                recently added items are shown.
              </p>
            </div>
            <HomepageProductPicker
              selectedIds={content.newArrivals?.productIds ?? []}
              onChange={(ids) =>
                setContent((prev) => ({
                  ...prev,
                  newArrivals: {
                    ...prev.newArrivals!,
                    enabled: prev.newArrivals?.enabled ?? true,
                    title: prev.newArrivals?.title ?? "New Arrivals",
                    viewAllText: prev.newArrivals?.viewAllText ?? "View All",
                    viewAllLink: prev.newArrivals?.viewAllLink ?? "/shop",
                    productIds: ids.length > 0 ? ids : undefined,
                  },
                }))
              }
              disabled={!(content.newArrivals?.enabled ?? true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Bottom Carousel — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>
                Bottom Carousel (Above Testimonials)
              </CardTitle>
              <div className='flex items-center gap-3'>
                <Switch
                  checked={content.bottomCarousel?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      bottomCarousel: {
                        enabled: checked,
                        slides: prev.bottomCarousel?.slides ?? [],
                      },
                    }))
                  }
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!(content.bottomCarousel?.enabled ?? true)}
                  onClick={() => {
                    const newSlide = {
                      id: crypto.randomUUID(),
                      imageUrl: "",
                      mobileImageUrl: undefined as string | undefined,
                      linkUrl: undefined as string | undefined,
                      alt: undefined as string | undefined,
                    };
                    setContent((prev) => ({
                      ...prev,
                      bottomCarousel: {
                        enabled: prev.bottomCarousel?.enabled ?? true,
                        slides: [
                          ...(prev.bottomCarousel?.slides ?? []),
                          newSlide,
                        ],
                      },
                    }));
                  }}>
                  <Plus className='w-4 h-4 mr-1' />
                  Add Slide
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              A full-width image carousel displayed just above the testimonials
              section on the homepage.
            </p>
            {(content.bottomCarousel?.slides ?? []).length === 0 ? (
              <div className='text-center py-8 text-sm text-muted-foreground border border-dashed border-gray-200 rounded-lg'>
                <ImageIcon className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                <p>
                  No slides yet. Add slides to create a carousel above the
                  testimonials.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {(content.bottomCarousel?.slides ?? []).map((slide, index) => (
                  <div
                    key={slide.id}
                    className='border border-gray-200 rounded-lg p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        Slide {index + 1}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50'
                        onClick={() => {
                          setContent((prev) => ({
                            ...prev,
                            bottomCarousel: {
                              enabled: prev.bottomCarousel?.enabled ?? true,
                              slides: (
                                prev.bottomCarousel?.slides ?? []
                              ).filter((s) => s.id !== slide.id),
                            },
                          }));
                        }}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                    <div>
                      <Label className='text-xs'>Desktop Image</Label>
                      <div className='flex gap-2 mt-1'>
                        <Input
                          value={slide.imageUrl}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              bottomCarousel: {
                                enabled: prev.bottomCarousel?.enabled ?? true,
                                slides: (prev.bottomCarousel?.slides ?? []).map(
                                  (s) =>
                                    s.id === slide.id
                                      ? { ...s, imageUrl: e.target.value }
                                      : s,
                                ),
                              },
                            }));
                          }}
                          placeholder='/uploads/homepage/bottom-slide.webp'
                          className='text-sm'
                        />
                        <input
                          type='file'
                          id={`bottom-slide-upload-${slide.id}`}
                          accept='image/jpeg,image/jpg,image/png,image/webp'
                          className='hidden'
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File too large. Max 5MB.");
                              return;
                            }
                            try {
                              const buffer = new Uint8Array(
                                await file.arrayBuffer(),
                              );
                              const result =
                                await trpc.homepage.uploadHeroImage.mutate({
                                  file: {
                                    name: file.name,
                                    type: file.type,
                                    buffer,
                                  },
                                });
                              if (result.success && result.data) {
                                setContent((prev) => ({
                                  ...prev,
                                  bottomCarousel: {
                                    enabled:
                                      prev.bottomCarousel?.enabled ?? true,
                                    slides: (
                                      prev.bottomCarousel?.slides ?? []
                                    ).map((s) =>
                                      s.id === slide.id
                                        ? { ...s, imageUrl: result.data.url }
                                        : s,
                                    ),
                                  },
                                }));
                                toast.success("Slide image uploaded!");
                              }
                            } catch {
                              toast.error("Upload failed");
                            }
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document
                              .getElementById(`bottom-slide-upload-${slide.id}`)
                              ?.click()
                          }>
                          <Upload className='w-4 h-4' />
                        </Button>
                      </div>
                      {slide.imageUrl && (
                        <div className='mt-2 h-20 rounded overflow-hidden border bg-muted'>
                          <img
                            src={slide.imageUrl}
                            alt={`Slide ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className='text-xs'>Mobile Image (optional)</Label>
                      <div className='flex gap-2 mt-1'>
                        <Input
                          value={slide.mobileImageUrl || ""}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              bottomCarousel: {
                                enabled: prev.bottomCarousel?.enabled ?? true,
                                slides: (prev.bottomCarousel?.slides ?? []).map(
                                  (s) =>
                                    s.id === slide.id
                                      ? {
                                          ...s,
                                          mobileImageUrl:
                                            e.target.value || undefined,
                                        }
                                      : s,
                                ),
                              },
                            }));
                          }}
                          placeholder='Optional mobile-specific image'
                          className='text-sm'
                        />
                        <input
                          type='file'
                          id={`bottom-slide-mobile-upload-${slide.id}`}
                          accept='image/jpeg,image/jpg,image/png,image/webp'
                          className='hidden'
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File too large. Max 5MB.");
                              return;
                            }
                            try {
                              const buffer = new Uint8Array(
                                await file.arrayBuffer(),
                              );
                              const result =
                                await trpc.homepage.uploadMobileHeroImage.mutate(
                                  {
                                    file: {
                                      name: file.name,
                                      type: file.type,
                                      buffer,
                                    },
                                  },
                                );
                              if (result.success && result.data) {
                                setContent((prev) => ({
                                  ...prev,
                                  bottomCarousel: {
                                    enabled:
                                      prev.bottomCarousel?.enabled ?? true,
                                    slides: (
                                      prev.bottomCarousel?.slides ?? []
                                    ).map((s) =>
                                      s.id === slide.id
                                        ? {
                                            ...s,
                                            mobileImageUrl: result.data.url,
                                          }
                                        : s,
                                    ),
                                  },
                                }));
                                toast.success("Mobile slide image uploaded!");
                              }
                            } catch {
                              toast.error("Upload failed");
                            }
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document
                              .getElementById(
                                `bottom-slide-mobile-upload-${slide.id}`,
                              )
                              ?.click()
                          }>
                          <Upload className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className='text-xs'>Link URL (optional)</Label>
                      <Input
                        value={slide.linkUrl || ""}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            bottomCarousel: {
                              enabled: prev.bottomCarousel?.enabled ?? true,
                              slides: (prev.bottomCarousel?.slides ?? []).map(
                                (s) =>
                                  s.id === slide.id
                                    ? {
                                        ...s,
                                        linkUrl: e.target.value || undefined,
                                      }
                                    : s,
                              ),
                            },
                          }));
                        }}
                        placeholder='/shop or https://...'
                        className='text-sm mt-1'
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Page Banner — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>
                Contact Page Banner & Content
              </CardTitle>
              <div className='flex items-center gap-3'>
                <Switch
                  checked={content.contactBanner?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: checked,
                        slides: prev.contactBanner?.slides ?? [],
                        heading:
                          prev.contactBanner?.heading ??
                          DEFAULT_HOMEPAGE_CONTENT.contactBanner!.heading,
                        description:
                          prev.contactBanner?.description ??
                          DEFAULT_HOMEPAGE_CONTENT.contactBanner!.description,
                      },
                    }))
                  }
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!(content.contactBanner?.enabled ?? true)}
                  onClick={() => {
                    const newSlide = {
                      id: crypto.randomUUID(),
                      imageUrl: "",
                      mobileImageUrl: undefined as string | undefined,
                      alt: undefined as string | undefined,
                    };
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: prev.contactBanner?.enabled ?? true,
                        slides: [
                          ...(prev.contactBanner?.slides ?? []),
                          newSlide,
                        ],
                        heading:
                          prev.contactBanner?.heading ??
                          DEFAULT_HOMEPAGE_CONTENT.contactBanner!.heading,
                        description:
                          prev.contactBanner?.description ??
                          DEFAULT_HOMEPAGE_CONTENT.contactBanner!.description,
                      },
                    }));
                  }}>
                  <Plus className='w-4 h-4 mr-1' />
                  Add Slide
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Configure the banner images and text shown on the{" "}
              <strong>/contact</strong> page.
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs'>Heading (English)</Label>
                <Input
                  value={content.contactBanner?.heading ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: prev.contactBanner?.enabled ?? true,
                        slides: prev.contactBanner?.slides ?? [],
                        heading: e.target.value,
                        description: prev.contactBanner?.description ?? "",
                      },
                    }))
                  }
                  placeholder='We Would Love To Hear From You'
                  className='text-sm mt-1'
                  disabled={!(content.contactBanner?.enabled ?? true)}
                />
              </div>
              <div>
                <Label className='text-xs'>Heading (Arabic)</Label>
                <Input
                  dir='rtl'
                  value={content.contactBanner?.headingAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: prev.contactBanner?.enabled ?? true,
                        slides: prev.contactBanner?.slides ?? [],
                        heading: prev.contactBanner?.heading ?? "",
                        description: prev.contactBanner?.description ?? "",
                        headingAr: e.target.value,
                      },
                    }))
                  }
                  placeholder='نود أن نسمع منك'
                  className='text-sm mt-1'
                  disabled={!(content.contactBanner?.enabled ?? true)}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs'>Description (English)</Label>
                <Textarea
                  value={content.contactBanner?.description ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: prev.contactBanner?.enabled ?? true,
                        slides: prev.contactBanner?.slides ?? [],
                        heading: prev.contactBanner?.heading ?? "",
                        description: e.target.value,
                      },
                    }))
                  }
                  placeholder='Have a question, feedback, or just want to say hello?'
                  className='text-sm mt-1'
                  rows={3}
                  disabled={!(content.contactBanner?.enabled ?? true)}
                />
              </div>
              <div>
                <Label className='text-xs'>Description (Arabic)</Label>
                <Textarea
                  dir='rtl'
                  value={content.contactBanner?.descriptionAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      contactBanner: {
                        ...prev.contactBanner!,
                        enabled: prev.contactBanner?.enabled ?? true,
                        slides: prev.contactBanner?.slides ?? [],
                        heading: prev.contactBanner?.heading ?? "",
                        description: prev.contactBanner?.description ?? "",
                        descriptionAr: e.target.value,
                      },
                    }))
                  }
                  placeholder='هل لديك سؤال أو ملاحظة؟'
                  className='text-sm mt-1'
                  rows={3}
                  disabled={!(content.contactBanner?.enabled ?? true)}
                />
              </div>
            </div>
            <div>
              <Label className='text-xs'>Get Directions URL (optional)</Label>
              <Input
                value={content.contactBanner?.directionsUrl ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    contactBanner: {
                      ...prev.contactBanner!,
                      enabled: prev.contactBanner?.enabled ?? true,
                      slides: prev.contactBanner?.slides ?? [],
                      heading: prev.contactBanner?.heading ?? "",
                      description: prev.contactBanner?.description ?? "",
                      directionsUrl: e.target.value,
                    },
                  }))
                }
                placeholder='https://maps.google.com/...'
                className='text-sm mt-1'
                disabled={!(content.contactBanner?.enabled ?? true)}
              />
            </div>
            {(content.contactBanner?.slides ?? []).length === 0 ? (
              <div className='text-center py-8 text-sm text-muted-foreground border border-dashed border-gray-200 rounded-lg'>
                <ImageIcon className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                <p>No banner slides yet.</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {(content.contactBanner?.slides ?? []).map((slide, index) => (
                  <div
                    key={slide.id}
                    className='border border-gray-200 rounded-lg p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        Slide {index + 1}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50'
                        onClick={() => {
                          setContent((prev) => ({
                            ...prev,
                            contactBanner: {
                              ...prev.contactBanner!,
                              enabled: prev.contactBanner?.enabled ?? true,
                              slides: (prev.contactBanner?.slides ?? []).filter(
                                (s) => s.id !== slide.id,
                              ),
                              heading: prev.contactBanner?.heading ?? "",
                              description:
                                prev.contactBanner?.description ?? "",
                            },
                          }));
                        }}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                    <div>
                      <Label className='text-xs'>Desktop Image</Label>
                      <div className='flex gap-2 mt-1'>
                        <Input
                          value={slide.imageUrl}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              contactBanner: {
                                ...prev.contactBanner!,
                                enabled: prev.contactBanner?.enabled ?? true,
                                slides: (prev.contactBanner?.slides ?? []).map(
                                  (s) =>
                                    s.id === slide.id
                                      ? { ...s, imageUrl: e.target.value }
                                      : s,
                                ),
                                heading: prev.contactBanner?.heading ?? "",
                                description:
                                  prev.contactBanner?.description ?? "",
                              },
                            }));
                          }}
                          placeholder='/uploads/homepage/contact-banner.webp'
                          className='text-sm'
                        />
                        <input
                          type='file'
                          id={`contact-slide-upload-${slide.id}`}
                          accept='image/jpeg,image/jpg,image/png,image/webp'
                          className='hidden'
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File too large. Max 5MB.");
                              return;
                            }
                            try {
                              const buffer = new Uint8Array(
                                await file.arrayBuffer(),
                              );
                              const result =
                                await trpc.homepage.uploadHeroImage.mutate({
                                  file: {
                                    name: file.name,
                                    type: file.type,
                                    buffer,
                                  },
                                });
                              if (result.success && result.data) {
                                setContent((prev) => ({
                                  ...prev,
                                  contactBanner: {
                                    ...prev.contactBanner!,
                                    enabled:
                                      prev.contactBanner?.enabled ?? true,
                                    slides: (
                                      prev.contactBanner?.slides ?? []
                                    ).map((s) =>
                                      s.id === slide.id
                                        ? { ...s, imageUrl: result.data.url }
                                        : s,
                                    ),
                                    heading: prev.contactBanner?.heading ?? "",
                                    description:
                                      prev.contactBanner?.description ?? "",
                                  },
                                }));
                                toast.success("Slide image uploaded!");
                              }
                            } catch {
                              toast.error("Upload failed");
                            }
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document
                              .getElementById(
                                `contact-slide-upload-${slide.id}`,
                              )
                              ?.click()
                          }>
                          <Upload className='w-4 h-4' />
                        </Button>
                      </div>
                      {slide.imageUrl && (
                        <div className='mt-2 h-20 rounded overflow-hidden border bg-muted'>
                          <img
                            src={slide.imageUrl}
                            alt={`Contact slide ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className='text-xs'>Mobile Image (optional)</Label>
                      <div className='flex gap-2 mt-1'>
                        <Input
                          value={slide.mobileImageUrl || ""}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              contactBanner: {
                                ...prev.contactBanner!,
                                enabled: prev.contactBanner?.enabled ?? true,
                                slides: (prev.contactBanner?.slides ?? []).map(
                                  (s) =>
                                    s.id === slide.id
                                      ? {
                                          ...s,
                                          mobileImageUrl:
                                            e.target.value || undefined,
                                        }
                                      : s,
                                ),
                                heading: prev.contactBanner?.heading ?? "",
                                description:
                                  prev.contactBanner?.description ?? "",
                              },
                            }));
                          }}
                          placeholder='Optional mobile-specific image'
                          className='text-sm'
                        />
                        <input
                          type='file'
                          id={`contact-slide-mobile-upload-${slide.id}`}
                          accept='image/jpeg,image/jpg,image/png,image/webp'
                          className='hidden'
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File too large. Max 5MB.");
                              return;
                            }
                            try {
                              const buffer = new Uint8Array(
                                await file.arrayBuffer(),
                              );
                              const result =
                                await trpc.homepage.uploadMobileHeroImage.mutate(
                                  {
                                    file: {
                                      name: file.name,
                                      type: file.type,
                                      buffer,
                                    },
                                  },
                                );
                              if (result.success && result.data) {
                                setContent((prev) => ({
                                  ...prev,
                                  contactBanner: {
                                    ...prev.contactBanner!,
                                    enabled:
                                      prev.contactBanner?.enabled ?? true,
                                    slides: (
                                      prev.contactBanner?.slides ?? []
                                    ).map((s) =>
                                      s.id === slide.id
                                        ? {
                                            ...s,
                                            mobileImageUrl: result.data.url,
                                          }
                                        : s,
                                    ),
                                    heading: prev.contactBanner?.heading ?? "",
                                    description:
                                      prev.contactBanner?.description ?? "",
                                  },
                                }));
                                toast.success("Mobile slide image uploaded!");
                              }
                            } catch {
                              toast.error("Upload failed");
                            }
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document
                              .getElementById(
                                `contact-slide-mobile-upload-${slide.id}`,
                              )
                              ?.click()
                          }>
                          <Upload className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Page Carousel Title — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Product Page Carousel Title
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs'>Title (English)</Label>
                <Input
                  value={content.productCarouselTitle ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      productCarouselTitle: e.target.value,
                    }))
                  }
                  placeholder='More Products'
                />
              </div>
              <div>
                <Label className='text-xs'>Title (Arabic)</Label>
                <Input
                  dir='rtl'
                  value={content.productCarouselTitleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      productCarouselTitleAr: e.target.value,
                    }))
                  }
                  placeholder='منتجات أخرى'
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Us — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>About Us Page</CardTitle>
              <Switch
                checked={content.aboutUs?.enabled ?? false}
                onCheckedChange={(checked) =>
                  setContent((prev) => ({
                    ...prev,
                    aboutUs: {
                      ...prev.aboutUs!,
                      enabled: checked,
                      title: prev.aboutUs?.title ?? "About Us",
                      description: prev.aboutUs?.description ?? "",
                    },
                  }))
                }
              />
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs'>Title (English)</Label>
                <Input
                  value={content.aboutUs?.title ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      aboutUs: {
                        ...prev.aboutUs!,
                        enabled: prev.aboutUs?.enabled ?? false,
                        title: e.target.value,
                        description: prev.aboutUs?.description ?? "",
                      },
                    }))
                  }
                  placeholder='About Us'
                  disabled={!(content.aboutUs?.enabled ?? false)}
                />
              </div>
              <div>
                <Label className='text-xs'>Title (Arabic)</Label>
                <Input
                  dir='rtl'
                  value={content.aboutUs?.titleAr ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      aboutUs: {
                        ...prev.aboutUs!,
                        enabled: prev.aboutUs?.enabled ?? false,
                        title: prev.aboutUs?.title ?? "About Us",
                        titleAr: e.target.value,
                        description: prev.aboutUs?.description ?? "",
                      },
                    }))
                  }
                  placeholder='من نحن'
                  disabled={!(content.aboutUs?.enabled ?? false)}
                />
              </div>
            </div>
            <div>
              <Label className='text-xs'>Description (English)</Label>
              <Textarea
                value={content.aboutUs?.description ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    aboutUs: {
                      ...prev.aboutUs!,
                      enabled: prev.aboutUs?.enabled ?? false,
                      title: prev.aboutUs?.title ?? "About Us",
                      description: e.target.value,
                    },
                  }))
                }
                placeholder='Tell your story...'
                rows={6}
                disabled={!(content.aboutUs?.enabled ?? false)}
              />
            </div>
            <div>
              <Label className='text-xs'>Description (Arabic)</Label>
              <Textarea
                dir='rtl'
                value={content.aboutUs?.descriptionAr ?? ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    aboutUs: {
                      ...prev.aboutUs!,
                      enabled: prev.aboutUs?.enabled ?? false,
                      title: prev.aboutUs?.title ?? "About Us",
                      description: prev.aboutUs?.description ?? "",
                      descriptionAr: e.target.value,
                    },
                  }))
                }
                placeholder='أخبر قصتك...'
                rows={6}
                disabled={!(content.aboutUs?.enabled ?? false)}
              />
            </div>
            <div>
              <Label className='text-xs'>Image</Label>
              <div className='flex gap-2 mt-1'>
                <Input
                  value={content.aboutUs?.imageUrl ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      aboutUs: {
                        ...prev.aboutUs!,
                        enabled: prev.aboutUs?.enabled ?? false,
                        title: prev.aboutUs?.title ?? "About Us",
                        description: prev.aboutUs?.description ?? "",
                        imageUrl: e.target.value,
                      },
                    }))
                  }
                  placeholder='Image URL or upload'
                  className='text-sm'
                  disabled={!(content.aboutUs?.enabled ?? false)}
                />
                <input
                  type='file'
                  id='about-us-image-upload'
                  accept='image/jpeg,image/jpg,image/png,image/webp'
                  className='hidden'
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File too large. Max 5MB.");
                      return;
                    }
                    try {
                      const buffer = new Uint8Array(await file.arrayBuffer());
                      const result = await trpc.homepage.uploadHeroImage.mutate(
                        { file: { name: file.name, type: file.type, buffer } },
                      );
                      if (result.success && result.data) {
                        setContent((prev) => ({
                          ...prev,
                          aboutUs: {
                            ...prev.aboutUs!,
                            enabled: prev.aboutUs?.enabled ?? false,
                            title: prev.aboutUs?.title ?? "About Us",
                            description: prev.aboutUs?.description ?? "",
                            imageUrl: result.data.url,
                          },
                        }));
                        toast.success("About Us image uploaded!");
                      }
                    } catch {
                      toast.error("Upload failed");
                    }
                    e.target.value = "";
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!(content.aboutUs?.enabled ?? false)}
                  onClick={() =>
                    document.getElementById("about-us-image-upload")?.click()
                  }>
                  <Upload className='w-4 h-4' />
                </Button>
              </div>
              {content.aboutUs?.imageUrl && (
                <div className='mt-2'>
                  <img
                    src={
                      content.aboutUs.imageUrl.startsWith("http") ||
                      content.aboutUs.imageUrl.startsWith("/")
                        ? content.aboutUs.imageUrl
                        : `/uploads/${content.aboutUs.imageUrl}`
                    }
                    alt='About Us preview'
                    className='w-32 h-40 object-cover rounded border'
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation Overrides — minimal only */}
      {isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Languages className='w-5 h-5' />
                <CardTitle>Other UI Labels (English / Arabic)</CardTitle>
              </div>
              <div className='flex items-center gap-2'>
                {hasUnsavedTranslations && (
                  <span className='text-sm text-amber-600 font-medium'>
                    Unsaved
                  </span>
                )}
                <Button
                  size='sm'
                  onClick={handleSaveTranslations}
                  disabled={isSavingTranslations || !hasUnsavedTranslations}>
                  <Save className='w-4 h-4 mr-1' />
                  {isSavingTranslations ? "Saving…" : "Save Translations"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='bg-muted p-3 rounded-md'>
              <p className='text-sm text-muted-foreground'>
                Edit the English and Arabic UI labels used across the minimal
                template.
              </p>
            </div>
            {TRANSLATION_GROUPS.map((group) => (
              <div key={group.label} className='space-y-3'>
                <h4 className='font-semibold text-sm border-b pb-1'>
                  {group.label}
                </h4>
                {group.keys.map((item) => (
                  <div
                    key={item.key}
                    className='grid grid-cols-[180px_1fr_1fr] gap-3 items-center'>
                    <Label
                      className='text-xs text-muted-foreground truncate'
                      title={item.key}>
                      {item.label}
                    </Label>
                    <Input
                      value={getTranslationValue("en", item.key)}
                      onChange={(e) =>
                        updateTranslation("en", item.key, e.target.value)
                      }
                      placeholder={staticTranslations.en[item.key]}
                      className='text-sm'
                    />
                    <Input
                      dir='rtl'
                      value={getTranslationValue("ar", item.key)}
                      onChange={(e) =>
                        updateTranslation("ar", item.key, e.target.value)
                      }
                      placeholder={staticTranslations.ar[item.key]}
                      className='text-sm'
                    />
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Newsletter Section — non-minimal only */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Newsletter Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='newsletter-enabled'>Enabled</Label>
                <Switch
                  id='newsletter-enabled'
                  checked={content.newsletter.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='newsletter-title'>Title</Label>
              <Input
                id='newsletter-title'
                value={content.newsletter.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, title: e.target.value },
                  }))
                }
                placeholder='Stay Updated'
                disabled={!content.newsletter.enabled}
              />
            </div>
            <div>
              <Label htmlFor='newsletter-subtitle'>Subtitle</Label>
              <Textarea
                id='newsletter-subtitle'
                value={content.newsletter.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    newsletter: {
                      ...prev.newsletter,
                      subtitle: e.target.value,
                    },
                  }))
                }
                placeholder='Subscribe to get the latest news and offers'
                disabled={!content.newsletter.enabled}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer CTA Section — non-minimal only */}
      {!isMinimal && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Footer CTA Section</CardTitle>
              <div className='flex items-center gap-2'>
                <Label htmlFor='footercta-enabled'>Enabled</Label>
                <Switch
                  id='footercta-enabled'
                  checked={content.footerCta.enabled}
                  onCheckedChange={(checked) =>
                    setContent((prev) => ({
                      ...prev,
                      footerCta: { ...prev.footerCta, enabled: checked },
                    }))
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='footercta-title'>Title</Label>
              <Input
                id='footercta-title'
                value={content.footerCta.title}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    footerCta: { ...prev.footerCta, title: e.target.value },
                  }))
                }
                placeholder='Join Our Community'
                disabled={!content.footerCta.enabled}
              />
            </div>
            <div>
              <Label htmlFor='footercta-subtitle'>Subtitle</Label>
              <Textarea
                id='footercta-subtitle'
                value={content.footerCta.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    footerCta: { ...prev.footerCta, subtitle: e.target.value },
                  }))
                }
                placeholder='Be the first to know about new arrivals'
                disabled={!content.footerCta.enabled}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor='footercta-cta-text'>Button Label</Label>
              <Input
                id='footercta-cta-text'
                value={content.footerCta.ctaText}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    footerCta: { ...prev.footerCta, ctaText: e.target.value },
                  }))
                }
                placeholder='Shop Now'
                disabled={!content.footerCta.enabled}
              />
            </div>
            <div>
              <Label htmlFor='footercta-cta-link'>Button Link</Label>
              <Input
                id='footercta-cta-link'
                value={content.footerCta.ctaLink}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    footerCta: { ...prev.footerCta, ctaLink: e.target.value },
                  }))
                }
                placeholder='/shop'
                disabled={!content.footerCta.enabled}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
