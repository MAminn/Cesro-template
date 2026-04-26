import { useEffect, type ReactNode } from "react";
import type { CesroLandingContent } from "./content-schema";

interface CesroChromeProps {
  children: ReactNode;
  content: CesroLandingContent;
}

/**
 * CesroChrome — wraps the Cesro landing template.
 *
 * 1. Sets `data-cesro-chrome="true"` on `<html>` (mount/unmount).
 *    Global CSS hides `#global-footer` and `#global-navbar` when set.
 * 2. Sets `dir="rtl"` and `lang="ar"` on `<html>`.
 * 3. Wraps content in a `data-template="cesro"` container with theme
 *    CSS custom properties injected from content.theme.
 *
 * SSR-safe — attributes are set only in `useEffect` (client-only).
 * The blocking script in +Head.tsx handles flicker prevention.
 */
export function CesroChrome({ children, content }: CesroChromeProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.cesroChrome = "true";
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");

    return () => {
      delete html.dataset.cesroChrome;
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "en");
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
