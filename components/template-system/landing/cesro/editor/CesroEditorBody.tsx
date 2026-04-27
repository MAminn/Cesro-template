/**
 * CesroEditorBody — Panel composition for Demo 5 (Cesro).
 *
 * Renders all 7 Cesro panels in order:
 *   Meta → Theme → Hero → About → Categories → FeaturedProducts → FinalCta
 *
 * Receives content + onChange from the shared shell via the
 * DemoEditorBodyProps<CesroLandingContent> contract.
 */

import type { DemoEditorBodyProps } from "#root/components/template-system/editor-registry";
import type { CesroLandingContent } from "../content-schema";

import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";

import { CesroMetaPanel } from "./panels/CesroMetaPanel";
import { CesroThemePanel } from "./panels/CesroThemePanel";
import { CesroHeroPanel } from "./panels/CesroHeroPanel";
import { CesroAboutPanel } from "./panels/CesroAboutPanel";
import { CesroCategoriesPanel } from "./panels/CesroCategoriesPanel";
import { CesroFeaturedProductsPanel } from "./panels/CesroFeaturedProductsPanel";
import { CesroFinalCtaPanel } from "./panels/CesroFinalCtaPanel";

export function CesroEditorBody({
  content,
  onChange,
}: DemoEditorBodyProps<CesroLandingContent>) {
  return (
    <div className='space-y-6'>
      {/* WhatsApp Number — top-level field */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className='text-xs'>WhatsApp Number</Label>
            <Input
              value={content.whatsappNumber}
              onChange={(e) =>
                onChange({ ...content, whatsappNumber: e.target.value })
              }
              placeholder='+966XXXXXXXXX'
              dir='ltr'
              className='font-mono'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              International format with country code. Used for all WhatsApp CTA
              buttons.
            </p>
          </div>
        </CardContent>
      </Card>

      <CesroMetaPanel
        value={content.meta}
        onChange={(meta) => onChange({ ...content, meta })}
      />

      <CesroThemePanel
        value={content.theme}
        onChange={(theme) => onChange({ ...content, theme })}
      />

      <CesroHeroPanel
        value={content.hero}
        onChange={(hero) => onChange({ ...content, hero })}
        whatsappNumber={content.whatsappNumber}
      />

      <CesroAboutPanel
        value={content.about}
        onChange={(about) => onChange({ ...content, about })}
      />

      <CesroCategoriesPanel
        value={content.categories}
        onChange={(categories) => onChange({ ...content, categories })}
      />

      <CesroFeaturedProductsPanel
        value={content.featuredProducts}
        onChange={(featuredProducts) =>
          onChange({ ...content, featuredProducts })
        }
      />

      <CesroFinalCtaPanel
        value={content.finalCta}
        onChange={(finalCta) => onChange({ ...content, finalCta })}
        whatsappNumber={content.whatsappNumber}
      />
    </div>
  );
}
