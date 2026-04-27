import { useEffect, type ReactNode } from "react";
import type { CesroLandingContent } from "./content-schema";

interface CesroChromeProps {
  children: ReactNode;
  content: CesroLandingContent;
}

/**
 * CesroChrome — pure theme/RTL wrapper for the Cesro landing template.
 *
 * 1. Sets `dir="rtl"` and `lang="ar"` on `<html>` (mount/unmount).
 * 2. Wraps content in a `data-template="cesro"` container with theme
 *    CSS custom properties injected from content.theme.
 *
 * Cesro uses the SAME global Navbar/Footer as Demos 1–4 (rendered by
 * LayoutDefault). This wrapper no longer hides the global chrome.
 *
 * SSR-safe — attributes are set only in `useEffect` (client-only).
 * The blocking script in +Head.tsx handles dir/lang flicker prevention.
 */
export function CesroChrome({ children, content }: CesroChromeProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");

    return () => {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "en");
    };
  }, []);

  // Mark the active template on <html> so global stylesheet rules
  // (e.g. footer styling) can scope themselves to Cesro without
  // needing a Cesro-specific Footer component.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.dataset.activeTemplate;
    html.dataset.activeTemplate = "cesro";
    return () => {
      if (previous === undefined) {
        delete html.dataset.activeTemplate;
      } else {
        html.dataset.activeTemplate = previous;
      }
    };
  }, []);

  const { theme } = content;

  return (
    <div
      data-template='cesro'
      style={
        {
          "--cesro-primary": theme.primaryColor,
          "--cesro-accent": theme.accentColor ?? theme.primaryColor,
          "--cesro-font-display": theme.fontFamilyDisplay,
          "--cesro-font-body": theme.fontFamilyBody,
          "--cesro-radius-sm": theme.radius.sm,
          "--cesro-radius-md": theme.radius.md,
          "--cesro-radius-lg": theme.radius.lg,
          "--cesro-section-y": theme.spacing.sectionY,
        } as React.CSSProperties
      }>
      {children}
    </div>
  );
}
