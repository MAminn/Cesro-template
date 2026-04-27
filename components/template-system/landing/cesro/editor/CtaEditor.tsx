/**
 * CtaEditor — Shared sub-editor for CesroCTA fields.
 *
 * Renders a radio "CTA type: WhatsApp message / Direct link",
 * then either a textarea (whatsappMessage) or a text input (link).
 * Also always renders the label text input.
 */

import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Textarea } from "#root/components/ui/textarea";
import type { CesroCTA } from "../../content-schema";

interface CtaEditorProps {
  label: string;
  value: CesroCTA;
  onChange: (next: CesroCTA) => void;
  whatsappNumber?: string;
}

export function CtaEditor({
  label: sectionLabel,
  value,
  onChange,
  whatsappNumber,
}: CtaEditorProps) {
  const mode: "whatsapp" | "link" =
    value.whatsappMessage !== undefined ? "whatsapp" : "link";

  const setMode = (next: "whatsapp" | "link") => {
    if (next === "whatsapp") {
      onChange({
        label: value.label,
        whatsappMessage: value.whatsappMessage ?? "",
      });
    } else {
      onChange({ label: value.label, link: value.link ?? "" });
    }
  };

  return (
    <div className='space-y-3 border rounded-lg p-3 bg-muted/30'>
      <Label className='text-sm font-semibold'>{sectionLabel}</Label>

      <div>
        <Label className='text-xs'>Button Label</Label>
        <Input
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder='Button text'
          className='mt-1'
        />
      </div>

      <div className='flex gap-4'>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='radio'
            name={`cta-mode-${sectionLabel}`}
            checked={mode === "whatsapp"}
            onChange={() => setMode("whatsapp")}
          />
          WhatsApp message
        </label>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='radio'
            name={`cta-mode-${sectionLabel}`}
            checked={mode === "link"}
            onChange={() => setMode("link")}
          />
          Direct link
        </label>
      </div>

      {mode === "whatsapp" ? (
        <div>
          <Label className='text-xs'>Pre-filled WhatsApp Message</Label>
          <Textarea
            value={value.whatsappMessage ?? ""}
            onChange={(e) =>
              onChange({ label: value.label, whatsappMessage: e.target.value })
            }
            placeholder='مرحبًا، أريد الاستفسار عن...'
            rows={2}
            dir='auto'
            className='mt-1'
          />
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(value.whatsappMessage ?? "")}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-blue-600 hover:underline mt-1 inline-block'>
              Test WhatsApp link →
            </a>
          )}
        </div>
      ) : (
        <div>
          <Label className='text-xs'>Link URL</Label>
          <Input
            value={value.link ?? ""}
            onChange={(e) =>
              onChange({ label: value.label, link: e.target.value })
            }
            placeholder='/shop or https://...'
            className='mt-1'
          />
        </div>
      )}
    </div>
  );
}
