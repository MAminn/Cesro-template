import type { PageContext } from "vike/types";
import { getHomepageContentRaw } from "#root/backend/homepage/get-homepage-content/raw";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import type { CesroLandingContent } from "#root/components/template-system/landing/cesro/content-schema";
import { cesroLandingContentSchema } from "#root/components/template-system/landing/cesro/validators";
import { CESRO_DEFAULT_CONTENT } from "#root/components/template-system/landing/cesro/defaults";
import { getStoreOwnerId } from "#root/shared/config/store";

export type Data = {
  homepageContent: HomepageContent | CesroLandingContent;
  /** The template ID this content was fetched for (so the client knows) */
  ssrTemplateId: string;
};

/**
 * SSR data loader for the homepage.
 *
 * Reads the active landing template from `ctx.templateSelection` (injected
 * during SSR by server.ts / vike-handler.ts) and fetches the matching CMS
 * content from the database.  The result is serialised into the HTML payload
 * so the client hydrates with the correct content — no flash of defaults.
 */
export const data = async (ctx: PageContext): Promise<Data> => {
  const merchantId = getStoreOwnerId();

  // Determine which landing template is active from the SSR-injected selection
  const templateSelection = ctx.templateSelection as
    | Record<string, string>
    | undefined;
  const activeTemplateId = templateSelection?.landing ?? "landing-modern";

  try {
    const rawContent = await getHomepageContentRaw(
      ctx.db,
      merchantId,
      activeTemplateId,
    );

    // For Cesro, validate against its own schema; fall back to defaults on mismatch
    if (activeTemplateId === "landing-cesro") {
      const parsed = cesroLandingContentSchema.safeParse(rawContent);
      if (parsed.success) {
        return {
          homepageContent: parsed.data,
          ssrTemplateId: activeTemplateId,
        };
      }
      console.warn(
        "[ssr] CesroLandingContent validation failed, using defaults:",
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      );
      return {
        homepageContent: CESRO_DEFAULT_CONTENT,
        ssrTemplateId: activeTemplateId,
      };
    }

    return {
      homepageContent: rawContent as HomepageContent,
      ssrTemplateId: activeTemplateId,
    };
  } catch {
    const fallback =
      activeTemplateId === "landing-cesro"
        ? CESRO_DEFAULT_CONTENT
        : DEFAULT_HOMEPAGE_CONTENT;
    return {
      homepageContent: fallback,
      ssrTemplateId: activeTemplateId,
    };
  }
};
