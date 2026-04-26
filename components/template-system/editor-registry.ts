/**
 * Demo Editor Registry
 *
 * Bridge between the shared Homepage Content Editor shell and
 * demo-specific panel compositions. Keyed by landing template id.
 *
 * Each entry provides:
 *  - contentSchema: Zod validator for the content shape
 *  - defaultContent: Safe fallback content
 *  - EditorBody: React component rendering the panel stack
 */

import type React from "react";
import type { z } from "zod";

// ── Shared interfaces ──────────────────────────────────────

export interface DemoEditorBodyProps<TContent = unknown> {
  content: TContent;
  onChange: (next: TContent) => void;
  onFieldError: (path: string, error: string | null) => void;
}

export interface DemoEditorEntry<TContent = unknown> {
  templateId: string;
  contentSchema: z.ZodType<TContent>;
  defaultContent: TContent;
  EditorBody: React.FC<DemoEditorBodyProps<TContent>>;
}

// ── Registry ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const demoEditorRegistry: Record<string, DemoEditorEntry<any>> = {};

/**
 * Register a demo editor entry. Call at module scope so the registry
 * is populated before the editor shell renders.
 */
export function registerDemoEditor<TContent>(entry: DemoEditorEntry<TContent>) {
  demoEditorRegistry[entry.templateId] = entry;
}
