/**
 * FeatureItemEditor — Inline editor for a single CesroFeatureItem.
 */

import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Textarea } from "#root/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import type { CesroFeatureItem, CesroIconName } from "../../content-schema";

const ICON_OPTIONS: { value: CesroIconName; label: string }[] = [
  { value: "variety", label: "🎨 Variety" },
  { value: "wholesale", label: "📦 Wholesale" },
  { value: "supply", label: "🚚 Supply" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "quality", label: "⭐ Quality" },
  { value: "shipping", label: "🚢 Shipping" },
  { value: "support", label: "🎧 Support" },
  { value: "shield", label: "🛡️ Shield" },
];

interface FeatureItemEditorProps {
  value: CesroFeatureItem;
  onChange: (next: CesroFeatureItem) => void;
  index: number;
}

export function FeatureItemEditor({
  value,
  onChange,
  index,
}: FeatureItemEditorProps) {
  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-[140px_1fr] gap-2'>
        <div>
          <Label className='text-xs'>Icon</Label>
          <Select
            value={value.icon}
            onValueChange={(v) =>
              onChange({ ...value, icon: v as CesroIconName })
            }>
            <SelectTrigger className='mt-1'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className='text-xs'>Title</Label>
          <Input
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder={`Feature ${index + 1} title`}
            className='mt-1'
          />
        </div>
      </div>
      <div>
        <Label className='text-xs'>Description</Label>
        <Textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder='Short description'
          rows={2}
          dir='auto'
          className='mt-1'
        />
      </div>
    </div>
  );
}
