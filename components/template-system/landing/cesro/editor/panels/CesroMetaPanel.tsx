/**
 * CesroMetaPanel — SEO page title + description.
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Textarea } from "#root/components/ui/textarea";
import type { CesroMeta } from "../../content-schema";

interface Props {
  value: CesroMeta;
  onChange: (next: CesroMeta) => void;
}

export function CesroMetaPanel({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO / Meta</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='cesro-page-title'>Page Title</Label>
          <Input
            id='cesro-page-title'
            value={value.pageTitle}
            onChange={(e) => onChange({ ...value, pageTitle: e.target.value })}
            placeholder='متجر سيسرو — أفضل العطور'
            dir='auto'
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Shown in the browser tab and search results. Keep under 60
            characters.
          </p>
        </div>
        <div>
          <Label htmlFor='cesro-page-desc'>Page Description</Label>
          <Textarea
            id='cesro-page-desc'
            value={value.pageDescription}
            onChange={(e) =>
              onChange({ ...value, pageDescription: e.target.value })
            }
            placeholder='اكتشف تشكيلة واسعة من...'
            dir='auto'
            rows={3}
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Displayed in search engine snippets. Keep under 160 characters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
