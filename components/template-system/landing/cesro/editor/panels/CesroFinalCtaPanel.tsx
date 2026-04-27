/**
 * CesroFinalCtaPanel — Final CTA section: eyebrow, stacked headline lines,
 * accent line selector, supporting text, CTA, trust items, background image.
 */

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "#root/shared/trpc/client";
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
import { Button } from "#root/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Plus, Trash2, Upload } from "lucide-react";
import type { CesroFinalCtaContent } from "../../content-schema";
import { CtaEditor } from "../CtaEditor";

interface Props {
  value: CesroFinalCtaContent;
  onChange: (next: CesroFinalCtaContent) => void;
  whatsappNumber: string;
}

export function CesroFinalCtaPanel({ value, onChange, whatsappNumber }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    setIsUploading(true);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const result = await trpc.homepage.uploadHeroImage.mutate({
        file: { name: file.name, type: file.type, buffer },
      });
      if (result.success && result.data) {
        onChange({ ...value, backgroundImage: result.data.url });
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Final CTA Section</CardTitle>
          <div className='flex items-center gap-2'>
            <Label htmlFor='cesro-finalcta-enabled'>Enabled</Label>
            <Switch
              id='cesro-finalcta-enabled'
              checked={value.enabled}
              onCheckedChange={(checked) =>
                onChange({ ...value, enabled: checked })
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label className='text-xs'>Eyebrow</Label>
          <Input
            value={value.eyebrow}
            onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
            dir='auto'
            disabled={!value.enabled}
          />
        </div>

        {/* Headline Lines */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-semibold'>
              Headline Lines ({value.headlineLines.length}/4)
            </Label>
            <Select
              value={String(value.accentLineIndex)}
              onValueChange={(v) =>
                onChange({ ...value, accentLineIndex: parseInt(v) })
              }>
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Accent line' />
              </SelectTrigger>
              <SelectContent>
                {value.headlineLines.map((_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    Line {i + 1} is accent
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {value.headlineLines.map((line, i) => (
            <div key={i} className='flex gap-2 items-center'>
              <Input
                value={line}
                onChange={(e) => {
                  const next = [...value.headlineLines];
                  next[i] = e.target.value;
                  onChange({ ...value, headlineLines: next });
                }}
                dir='auto'
                disabled={!value.enabled}
                className={
                  i === value.accentLineIndex
                    ? "border-amber-400 bg-amber-50/50"
                    : ""
                }
              />
              {value.headlineLines.length > 2 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='shrink-0 h-8 w-8'
                  disabled={!value.enabled}
                  onClick={() => {
                    const next = value.headlineLines.filter(
                      (_, idx) => idx !== i,
                    );
                    const nextAccent = Math.min(
                      value.accentLineIndex,
                      next.length - 1,
                    );
                    onChange({
                      ...value,
                      headlineLines: next,
                      accentLineIndex: nextAccent,
                    });
                  }}>
                  <Trash2 className='w-3 h-3' />
                </Button>
              )}
            </div>
          ))}

          {value.headlineLines.length < 4 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled}
              onClick={() =>
                onChange({
                  ...value,
                  headlineLines: [...value.headlineLines, ""],
                })
              }>
              <Plus className='w-4 h-4 mr-1' /> Add Line
            </Button>
          )}
        </div>

        <div>
          <Label className='text-xs'>Supporting Text</Label>
          <Textarea
            value={value.supportingText}
            onChange={(e) =>
              onChange({ ...value, supportingText: e.target.value })
            }
            dir='auto'
            rows={2}
            disabled={!value.enabled}
          />
        </div>

        <CtaEditor
          label='CTA Button'
          value={value.cta}
          onChange={(cta) => onChange({ ...value, cta })}
          whatsappNumber={whatsappNumber}
        />

        {/* Trust Items */}
        <div className='space-y-2'>
          <Label className='text-sm font-semibold'>
            Trust Items ({value.trustItems.length}/4)
          </Label>
          {value.trustItems.map((item, i) => (
            <div key={i} className='flex gap-2 items-center'>
              <Input
                value={item.label}
                onChange={(e) => {
                  const next = [...value.trustItems];
                  next[i] = { ...item, label: e.target.value };
                  onChange({ ...value, trustItems: next });
                }}
                dir='auto'
                disabled={!value.enabled}
                className='flex-1'
              />
              <div className='flex items-center gap-1'>
                <Switch
                  checked={item.showDot}
                  onCheckedChange={(checked) => {
                    const next = [...value.trustItems];
                    next[i] = { ...item, showDot: checked };
                    onChange({ ...value, trustItems: next });
                  }}
                  disabled={!value.enabled}
                />
                <Label className='text-xs whitespace-nowrap'>Dot</Label>
              </div>
              {value.trustItems.length > 2 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='shrink-0 h-8 w-8'
                  disabled={!value.enabled}
                  onClick={() => {
                    const next = value.trustItems.filter((_, idx) => idx !== i);
                    onChange({ ...value, trustItems: next });
                  }}>
                  <Trash2 className='w-3 h-3' />
                </Button>
              )}
            </div>
          ))}
          {value.trustItems.length < 4 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled}
              onClick={() =>
                onChange({
                  ...value,
                  trustItems: [
                    ...value.trustItems,
                    { label: "", showDot: false },
                  ],
                })
              }>
              <Plus className='w-4 h-4 mr-1' /> Add Trust Item
            </Button>
          )}
        </div>

        {/* Background Image */}
        <div className='border-t pt-4'>
          <Label className='text-xs'>Background Image</Label>
          <div className='flex gap-2 mt-1'>
            <Input
              value={value.backgroundImage}
              onChange={(e) =>
                onChange({ ...value, backgroundImage: e.target.value })
              }
              placeholder='/uploads/cesro-final-cta.webp'
              disabled={!value.enabled}
            />
            <input
              type='file'
              id='cesro-finalcta-bg-upload'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              className='hidden'
              onChange={handleUploadBg}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled || isUploading}
              onClick={() =>
                document.getElementById("cesro-finalcta-bg-upload")?.click()
              }>
              <Upload className='w-4 h-4' />
            </Button>
          </div>
          {value.backgroundImage && (
            <div className='mt-2 h-24 rounded overflow-hidden border bg-muted'>
              <img
                src={value.backgroundImage}
                alt='Final CTA background'
                className='w-full h-full object-cover'
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
