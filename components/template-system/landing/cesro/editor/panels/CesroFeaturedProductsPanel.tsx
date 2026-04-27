/**
 * CesroFeaturedProductsPanel — Featured products: enabled, eyebrow,
 * headline, supportingText, view-all link, WhatsApp-button toggle.
 *
 * The list of products rendered on the landing page is the latest
 * in-stock products from the catalog. This panel only edits the
 * section's copy and the per-card WhatsApp toggle.
 */

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
import type { CesroFeaturedProductsContent } from "../../content-schema";

interface Props {
  value: CesroFeaturedProductsContent;
  onChange: (next: CesroFeaturedProductsContent) => void;
}

export function CesroFeaturedProductsPanel({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Featured Products</CardTitle>
          <div className='flex items-center gap-2'>
            <Label htmlFor='cesro-featured-enabled'>Enabled</Label>
            <Switch
              id='cesro-featured-enabled'
              checked={value.enabled}
              onCheckedChange={(checked) =>
                onChange({ ...value, enabled: checked })
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-xs text-muted-foreground rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 p-3 leading-relaxed'>
          Featured products shown on the landing page are the latest in-stock
          products from your catalog. Manage products in the Products admin
          page.
        </p>
        <div>
          <Label className='text-xs'>Eyebrow</Label>
          <Input
            value={value.eyebrow}
            onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
            placeholder='مختارات الموسم'
            dir='auto'
            disabled={!value.enabled}
          />
        </div>
        <div>
          <Label className='text-xs'>Headline</Label>
          <Input
            value={value.headline}
            onChange={(e) => onChange({ ...value, headline: e.target.value })}
            placeholder='منتجات مميزة'
            dir='auto'
            disabled={!value.enabled}
          />
        </div>
        <div>
          <Label className='text-xs'>Supporting Text</Label>
          <Textarea
            value={value.supportingText ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                supportingText: e.target.value || undefined,
              })
            }
            placeholder='أكثر الموديلات طلبًا من تجار الجملة'
            dir='auto'
            rows={2}
            disabled={!value.enabled}
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Optional — appears below headline
          </p>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label className='text-xs'>View All Label</Label>
            <Input
              value={value.viewAllLabel ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  viewAllLabel: e.target.value || undefined,
                })
              }
              placeholder='عرض الكل'
              dir='auto'
              disabled={!value.enabled}
            />
          </div>
          <div>
            <Label className='text-xs'>View All Link</Label>
            <Input
              value={value.viewAllLink ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  viewAllLink: e.target.value || undefined,
                })
              }
              placeholder='/shop'
              disabled={!value.enabled}
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Switch
            id='cesro-featured-whatsapp'
            checked={value.showWhatsappButton}
            onCheckedChange={(checked) =>
              onChange({ ...value, showWhatsappButton: checked })
            }
            disabled={!value.enabled}
          />
          <Label htmlFor='cesro-featured-whatsapp' className='text-sm'>
            Show WhatsApp button on product cards
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
