/**
 * CesroThemePanel — Colors, fonts, border radius, spacing.
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Separator } from "#root/components/ui/separator";
import type { CesroTheme } from "../../content-schema";

interface Props {
  value: CesroTheme;
  onChange: (next: CesroTheme) => void;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className='text-xs'>{label}</Label>
      <div className='flex gap-2 mt-1 items-center'>
        <input
          type='color'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-8 h-8 rounded border cursor-pointer p-0'
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='#1a1a2e'
          className='w-32 font-mono text-sm'
        />
      </div>
    </div>
  );
}

export function CesroThemePanel({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent className='space-y-5'>
        {/* Colors */}
        <div className='grid grid-cols-2 gap-4'>
          <ColorField
            label='Primary Color'
            value={value.primaryColor}
            onChange={(v) => onChange({ ...value, primaryColor: v })}
          />
          <ColorField
            label='Accent Color'
            value={value.accentColor}
            onChange={(v) => onChange({ ...value, accentColor: v })}
          />
        </div>

        <Separator />

        {/* Typography */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label className='text-xs'>Display Font</Label>
            <Input
              value={value.fontFamilyDisplay}
              onChange={(e) =>
                onChange({ ...value, fontFamilyDisplay: e.target.value })
              }
              placeholder='Playfair Display, serif'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Body Font</Label>
            <Input
              value={value.fontFamilyBody}
              onChange={(e) =>
                onChange({ ...value, fontFamilyBody: e.target.value })
              }
              placeholder='Inter, sans-serif'
              className='mt-1'
            />
          </div>
        </div>

        <Separator />

        {/* Border Radius */}
        <div>
          <Label className='text-sm font-semibold'>Border Radius</Label>
          <div className='grid grid-cols-3 gap-3 mt-2'>
            <div>
              <Label className='text-xs'>Small</Label>
              <Input
                value={value.radius.sm}
                onChange={(e) =>
                  onChange({
                    ...value,
                    radius: { ...value.radius, sm: e.target.value },
                  })
                }
                placeholder='0.5rem'
                className='mt-1 font-mono text-sm'
              />
            </div>
            <div>
              <Label className='text-xs'>Medium</Label>
              <Input
                value={value.radius.md}
                onChange={(e) =>
                  onChange({
                    ...value,
                    radius: { ...value.radius, md: e.target.value },
                  })
                }
                placeholder='0.75rem'
                className='mt-1 font-mono text-sm'
              />
            </div>
            <div>
              <Label className='text-xs'>Large</Label>
              <Input
                value={value.radius.lg}
                onChange={(e) =>
                  onChange({
                    ...value,
                    radius: { ...value.radius, lg: e.target.value },
                  })
                }
                placeholder='1rem'
                className='mt-1 font-mono text-sm'
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Spacing */}
        <div>
          <Label className='text-sm font-semibold'>Spacing</Label>
          <div className='mt-2'>
            <Label className='text-xs'>Section Y Padding</Label>
            <Input
              value={value.spacing.sectionY}
              onChange={(e) =>
                onChange({
                  ...value,
                  spacing: { ...value.spacing, sectionY: e.target.value },
                })
              }
              placeholder='5rem'
              className='mt-1 font-mono text-sm w-32'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
