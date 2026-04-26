/**
 * Demo editor registrations.
 *
 * Import this module from the editor shell (+Page.tsx) to ensure
 * all demo editors are registered before the shell renders.
 */

import { registerDemoEditor } from "./editor-registry";

// ── Demos 1–4 (HomepageContent shape) ──────────────────────

import { HomepageContentSchema } from "#root/shared/types/homepage-content-schema";
import { DEFAULT_HOMEPAGE_CONTENT } from "#root/shared/types/homepage-content";
import type { HomepageContent } from "#root/shared/types/homepage-content";
import { HomepageEditorBody } from "./landing/homepage/HomepageEditorBody";
import type { DemoEditorBodyProps } from "./editor-registry";

const HOMEPAGE_TEMPLATE_IDS = [
  "landing-modern",
  "landing-editorial",
  "landing-classic",
  "landing-minimal",
] as const;

for (const templateId of HOMEPAGE_TEMPLATE_IDS) {
  registerDemoEditor<HomepageContent>({
    templateId,
    contentSchema: HomepageContentSchema,
    defaultContent: DEFAULT_HOMEPAGE_CONTENT,
    EditorBody: (props: DemoEditorBodyProps<HomepageContent>) => (
      <HomepageEditorBody {...props} selectedTemplateId={templateId} />
    ),
  });
}

// ── Demo 5 — Cesro ─────────────────────────────────────────

import { cesroLandingContentSchema } from "./landing/cesro/validators";
import { CESRO_DEFAULT_CONTENT } from "./landing/cesro/defaults";
import type { CesroLandingContent } from "./landing/cesro/content-schema";
import { CesroEditorBody } from "./landing/cesro/editor/CesroEditorBody";

registerDemoEditor<CesroLandingContent>({
  templateId: "landing-cesro",
  contentSchema: cesroLandingContentSchema,
  defaultContent: CESRO_DEFAULT_CONTENT,
  EditorBody: CesroEditorBody,
});
