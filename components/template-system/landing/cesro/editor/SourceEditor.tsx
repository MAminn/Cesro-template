/**
 * SourceEditor — Shared sub-editor for CesroCollectionSource fields.
 *
 * Renders a radio "Source: Manual selection / Automatic".
 * In auto mode: source radio, optional category picker, limit.
 * In manual mode: product/category ID list (text input for now).
 */

import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import type { CesroCollectionSource } from "../../content-schema";

interface SourceEditorProps {
  value: CesroCollectionSource;
  onChange: (next: CesroCollectionSource) => void;
  kind: "category" | "product";
}

export function SourceEditor({ value, onChange, kind }: SourceEditorProps) {
  return (
    <div className='space-y-3 border rounded-lg p-3 bg-muted/30'>
      <Label className='text-sm font-semibold'>
        {kind === "category" ? "Category" : "Product"} Source
      </Label>

      <div className='flex gap-4'>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='radio'
            checked={value.mode === "auto"}
            onChange={() =>
              onChange({ ...value, mode: "auto", ids: undefined })
            }
          />
          Automatic
        </label>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input
            type='radio'
            checked={value.mode === "manual"}
            onChange={() =>
              onChange({ ...value, mode: "manual", ids: value.ids ?? [] })
            }
          />
          Manual selection
        </label>
      </div>

      {value.mode === "auto" ? (
        <div className='space-y-3'>
          <div>
            <Label className='text-xs'>Source type</Label>
            <Select
              value={value.source}
              onValueChange={(v) =>
                onChange({
                  ...value,
                  source: v as CesroCollectionSource["source"],
                  categoryId:
                    v === "category" ? (value.categoryId ?? "") : undefined,
                })
              }>
              <SelectTrigger className='mt-1'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='latest'>Latest</SelectItem>
                <SelectItem value='featured'>Featured</SelectItem>
                <SelectItem value='best-selling'>Best Selling</SelectItem>
                <SelectItem value='category'>By Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {value.source === "category" && (
            <div>
              <Label className='text-xs'>Category ID</Label>
              <Input
                value={value.categoryId ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    categoryId: e.target.value || undefined,
                  })
                }
                placeholder='Enter category UUID'
                className='mt-1'
              />
            </div>
          )}

          <div>
            <Label className='text-xs'>Limit (1–24)</Label>
            <Input
              type='number'
              min={1}
              max={24}
              value={value.limit}
              onChange={(e) =>
                onChange({
                  ...value,
                  limit: Math.min(
                    24,
                    Math.max(1, parseInt(e.target.value) || 1),
                  ),
                })
              }
              className='mt-1 w-24'
            />
          </div>
        </div>
      ) : (
        <div>
          <Label className='text-xs'>
            {kind === "category" ? "Category" : "Product"} IDs (comma-separated)
          </Label>
          <Input
            value={(value.ids ?? []).join(", ")}
            onChange={(e) =>
              onChange({
                ...value,
                ids: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder='uuid-1, uuid-2, ...'
            className='mt-1'
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Enter {kind} UUIDs separated by commas
          </p>
        </div>
      )}
    </div>
  );
}
