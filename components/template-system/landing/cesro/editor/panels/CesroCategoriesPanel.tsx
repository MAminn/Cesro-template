/**
 * CesroCategoriesPanel — Categories section: enabled, eyebrow, headline,
 * supportingText, view-all link.
 *
 * The list of categories rendered on the landing page is sourced from
 * the catalog (toggle "Shown on landing" on each category in the
 * Categories admin). This panel only edits the section's copy.
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
import type { CesroCategoriesContent } from "../../content-schema";

interface Props {
  value: CesroCategoriesContent;
  onChange: (next: CesroCategoriesContent) => void;
}

export function CesroCategoriesPanel({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Categories Section</CardTitle>
          <div className='flex items-center gap-2'>
            <Label htmlFor='cesro-categories-enabled'>Enabled</Label>
            <Switch
              id='cesro-categories-enabled'
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
          Categories shown on the landing page are managed in the Categories
          admin page. Toggle “Shown on landing” on each category to control
          which appear here.
        </p>
        <div>
          <Label className='text-xs'>Eyebrow</Label>
          <Input
            value={value.eyebrow}
            onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
            placeholder='مجموعاتنا'
            dir='auto'
            disabled={!value.enabled}
          />
        </div>
        <div>
          <Label className='text-xs'>Headline</Label>
          <Input
            value={value.headline}
            onChange={(e) => onChange({ ...value, headline: e.target.value })}
            placeholder='تصفح الأقسام'
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
            placeholder='تشكيلة جينز متنوعة بأسعار جملة'
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
      </CardContent>
    </Card>
  );
}
