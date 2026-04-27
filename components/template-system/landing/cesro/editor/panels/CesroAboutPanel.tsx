/**
 * CesroAboutPanel — About section: eyebrow, headline, body paragraphs,
 * features block, side image.
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
import type {
  CesroAboutContent,
  CesroFeaturesBlock,
} from "../../content-schema";
import { FeatureItemEditor } from "../FeatureItemEditor";

interface Props {
  value: CesroAboutContent;
  onChange: (next: CesroAboutContent) => void;
}

export function CesroAboutPanel({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        preserveAspect: true,
      });
      if (result.success && result.data) {
        onChange({ ...value, sideImage: result.data.url });
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const updateFeatures = (next: CesroFeaturesBlock) => {
    onChange({ ...value, features: next });
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>About Section</CardTitle>
          <div className='flex items-center gap-2'>
            <Label htmlFor='cesro-about-enabled'>Enabled</Label>
            <Switch
              id='cesro-about-enabled'
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
            placeholder='من نحن'
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
              dir='auto'
              disabled={!value.enabled}
            />
          </div>
          <div>
            <Label className='text-xs'>Headline Line 2</Label>
            <Input
              value={value.headlineLine2}
              onChange={(e) =>
                onChange({ ...value, headlineLine2: e.target.value })
              }
              dir='auto'
              disabled={!value.enabled}
            />
          </div>
        </div>

        {/* Body Paragraphs */}
        <div className='space-y-2'>
          <Label className='text-sm font-semibold'>
            Body Paragraphs ({value.bodyParagraphs.length}/3)
          </Label>
          {value.bodyParagraphs.map((p, i) => (
            <div key={i} className='flex gap-2'>
              <Textarea
                value={p}
                onChange={(e) => {
                  const next = [...value.bodyParagraphs];
                  next[i] = e.target.value;
                  onChange({ ...value, bodyParagraphs: next });
                }}
                rows={2}
                dir='auto'
                disabled={!value.enabled}
                className='flex-1'
              />
              {value.bodyParagraphs.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='shrink-0'
                  disabled={!value.enabled}
                  onClick={() => {
                    const next = value.bodyParagraphs.filter(
                      (_, idx) => idx !== i,
                    );
                    onChange({ ...value, bodyParagraphs: next });
                  }}>
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>
          ))}
          {value.bodyParagraphs.length < 3 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled}
              onClick={() =>
                onChange({
                  ...value,
                  bodyParagraphs: [...value.bodyParagraphs, ""],
                })
              }>
              <Plus className='w-4 h-4 mr-1' /> Add Paragraph
            </Button>
          )}
        </div>

        {/* Features Block */}
        <div className='space-y-3 border-t pt-4'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-semibold'>
              Features ({value.features.items.length}/6)
            </Label>
            <Select
              value={value.features.layout}
              onValueChange={(v) =>
                updateFeatures({
                  ...value.features,
                  layout: v as CesroFeaturesBlock["layout"],
                })
              }>
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='grid-2-col'>Grid (2 col)</SelectItem>
                <SelectItem value='list'>List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {value.features.items.map((item, i) => (
            <div key={i} className='border rounded-lg p-3 space-y-2 relative'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-xs font-medium text-muted-foreground'>
                  Feature {i + 1}
                </span>
                {value.features.items.length > 2 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    disabled={!value.enabled}
                    onClick={() =>
                      updateFeatures({
                        ...value.features,
                        items: value.features.items.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }>
                    <Trash2 className='w-3 h-3' />
                  </Button>
                )}
              </div>
              <FeatureItemEditor
                value={item}
                onChange={(next) => {
                  const items = [...value.features.items];
                  items[i] = next;
                  updateFeatures({ ...value.features, items });
                }}
                index={i}
              />
            </div>
          ))}

          {value.features.items.length < 6 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled}
              onClick={() =>
                updateFeatures({
                  ...value.features,
                  items: [
                    ...value.features.items,
                    {
                      icon: "quality",
                      title: "",
                      description: "",
                    },
                  ],
                })
              }>
              <Plus className='w-4 h-4 mr-1' /> Add Feature
            </Button>
          )}
        </div>

        {/* Side Image */}
        <div className='border-t pt-4'>
          <Label className='text-xs'>Side Image</Label>
          <div className='flex gap-2 mt-1'>
            <Input
              value={value.sideImage}
              onChange={(e) =>
                onChange({ ...value, sideImage: e.target.value })
              }
              placeholder='/uploads/about-side.webp'
              disabled={!value.enabled}
            />
            <input
              type='file'
              id='cesro-about-image-upload'
              accept='image/jpeg,image/jpg,image/png,image/webp'
              className='hidden'
              onChange={handleUploadImage}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!value.enabled || isUploading}
              onClick={() =>
                document.getElementById("cesro-about-image-upload")?.click()
              }>
              <Upload className='w-4 h-4' />
            </Button>
          </div>
          {value.sideImage && (
            <div className='mt-2 h-32 w-48 rounded overflow-hidden border bg-muted'>
              <img
                src={value.sideImage}
                alt='About side'
                className='w-full h-full object-cover'
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
