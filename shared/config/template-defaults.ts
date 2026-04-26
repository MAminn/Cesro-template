/**
 * Template-specific homepage content defaults.
 *
 * Maps template IDs to their default content so that the backend
 * content-fetching pipeline returns the right baseline when no CMS
 * row exists yet.
 *
 * Cesro uses its own CesroLandingContent shape; other templates use
 * HomepageContent.
 */

import type { HomepageContent } from "#root/shared/types/homepage-content";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import { CESRO_DEFAULT_CONTENT } from "#root/components/template-system/landing/cesro/defaults";
import type { CesroLandingContent } from "#root/components/template-system/landing/cesro/content-schema";

/** Templates whose content shape differs from HomepageContent */
const CESRO_TEMPLATE_IDS = new Set(["landing-cesro"]);

const TEMPLATE_DEFAULTS: Record<string, HomepageContent | CesroLandingContent> =
  {
    "landing-cesro": CESRO_DEFAULT_CONTENT,
  };

/**
 * Returns the correct default content for a given template ID.
 * Falls back to `DEFAULT_HOMEPAGE_CONTENT` for templates without custom defaults.
 */
export function getTemplateDefaults(
  templateId: string,
): HomepageContent | CesroLandingContent {
  return TEMPLATE_DEFAULTS[templateId] ?? DEFAULT_HOMEPAGE_CONTENT;
}

/**
 * Returns true when the template has its own defaults (i.e. the legacy
 * "default" DB row should NOT be used as a fallback).
 */
export function hasCustomDefaults(templateId: string): boolean {
  return templateId in TEMPLATE_DEFAULTS;
}

/**
 * Returns true when the template uses a non-HomepageContent shape
 * and should NOT be run through mergeWithDefaults().
 */
export function isCesroTemplate(templateId: string): boolean {
  return CESRO_TEMPLATE_IDS.has(templateId);
}
