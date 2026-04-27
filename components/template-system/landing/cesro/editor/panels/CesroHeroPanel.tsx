/**
 * CesroHeroPanel — Hero section: eyebrow, 2-line headline, supporting text,
 * primary/secondary CTAs, presence text, background images.
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
import { Upload, X } from "lucide-react";
import type { CesroHeroContent } from "../../content-schema";
import { CtaEditor } from "../CtaEditor";

interface Props {
  value: CesroHeroContent;
  onChange: (next: CesroHeroContent) => void;
  whatsappNumber: string;
}

export function CesroHeroPanel({ value, onChange, whatsappNumber }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "backgroundImage" | "mobileBackgroundImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    const setLoading =
      field === "backgroundImage" ? setIsUploading : setIsUploadingMobile;
    setLoading(true);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const mutate =
        field === "backgroundImage"
          ? trpc.homepage.uploadHeroImage.mutate
          : trpc.homepage.uploadMobileHeroImage.mutate;
      const result = await mutate({
        file: { name: file.name, type: file.type, buffer },
      });
      if (result.success && result.data) {
        onChange({ ...value, [field]: result.data.url });
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Hero Section</CardTitle>
          <div className='flex items-center gap-2'>
            <Label htmlFor='cesro-hero-enabled'>Enabled</Label>
            <Switch
              id='cesro-hero-enabled'
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
            placeholder='مرحبًا بكم في'
            dir='auto'
            disabled={!value.enabled}
          />
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <Label className='text-xs'>Headline Line 1</Label>
            <Input
              value={value.headlineLine1}
              onChange={(e) =>
                onChange({ ...value, headlineLine1: e.target.value })
              }
              placeholder='عالم من'
              dir='auto'
              disabled={!value.enabled}
            />
          </div>
          <div>
            <Label className='text-xs'>Headline Line 2 (accent)</Label>
            <Input
              value={value.headlineLine2}
              onChange={(e) =>
                onChange({ ...value, headlineLine2: e.target.value })
              }
              placeholder='الجمال'
              dir='auto'
              disabled={!value.enabled}
            />
          </div>
        </div>

        <div>
          <Label className='text-xs'>Supporting Text</Label>
          <Textarea
            value={value.supportingText}
            onChange={(e) =>
              onChange({ ...value, supportingText: e.target.value })
            }
            placeholder='نقدم لكم أرقى المنتجات...'
            dir='auto'
            rows={2}
            disabled={!value.enabled}
          />
        </div>

        <CtaEditor
          label='Primary CTA'
          value={value.primaryCta}
          onChange={(cta) => onChange({ ...value, primaryCta: cta })}
          whatsappNumber={whatsappNumber}
        />

        <CtaEditor
          label='Secondary CTA'
          value={value.secondaryCta}
          onChange={(cta) => onChange({ ...value, secondaryCta: cta })}
          whatsappNumber={whatsappNumber}
        />

        <div>
          <Label className='text-xs'>Presence Text</Label>
          <Input
            value={value.presenceText}
            onChange={(e) =>
              onChange({ ...value, presenceText: e.target.value })
            }
            placeholder='رد سريع عبر واتساب بيزنس'
            dir='auto'
            disabled={!value.enabled}
          />
        </div>

        {/* Background Image */}
        <div>
          <Label className='text-xs'>Desktop Background Image</Label>
          <div className='flex gap-2 mt-1'>
            <Input
              value={value.backgroundImage}
              onChange={(e) =>
                onChange({ ...value, backgroundImage: e.target.value })
              }
              placeholder='/uploads/homepage/cesro-hero.webp'
              disabled={!value.enabled}
            />
            <input
              type='file'
              id='cesro-hero-bg-upload'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              className='hidden'
              onChange={(e) => handleUpload(e, "backgroundImage")}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled || isUploading}
              onClick={() =>
                document.getElementById("cesro-hero-bg-upload")?.click()
              }>
              <Upload className='w-4 h-4' />
            </Button>
          </div>
          {value.backgroundImage && (
            <div className='mt-2 h-24 rounded overflow-hidden border bg-muted'>
              <img
                src={value.backgroundImage}
                alt='Hero background'
                className='w-full h-full object-cover'
              />
            </div>
          )}
        </div>

        {/* Mobile Background Image */}
        <div>
          <Label className='text-xs'>Mobile Background Image (optional)</Label>
          <div className='flex gap-2 mt-1'>
            <Input
              value={value.mobileBackgroundImage ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  mobileBackgroundImage: e.target.value || undefined,
                })
              }
              placeholder='Optional mobile-specific image'
              disabled={!value.enabled}
            />
            {value.mobileBackgroundImage && (
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() =>
                  onChange({ ...value, mobileBackgroundImage: undefined })
                }>
                <X className='w-4 h-4' />
              </Button>
            )}
            <input
              type='file'
              id='cesro-hero-mobile-upload'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              className='hidden'
              onChange={(e) => handleUpload(e, "mobileBackgroundImage")}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled || isUploadingMobile}
              onClick={() =>
                document.getElementById("cesro-hero-mobile-upload")?.click()
              }>
              <Upload className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
