import { useEffect, type ReactNode } from "react";

interface CesroChromeProps {
  children: ReactNode;
}

/**
 * CesroChrome — wraps the Cesro landing template.
 *
 * 1. Sets `data-cesro-chrome="true"` on `<html>` (mount/unmount).
 *    Global CSS hides `#global-footer` and `#global-navbar` when set.
 * 2. Sets `dir="rtl"` and `lang="ar"` on `<html>`.
 * 3. Wraps content in a `data-template="cesro"` container for scoped CSS vars.
 *
 * SSR-safe — attributes are set only in `useEffect` (client-only).
 * The blocking script in +Head.tsx handles flicker prevention.
 */
export function CesroChrome({ children }: CesroChromeProps) {
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

  return (
    <div data-template="cesro">
      {children}
    </div>
  );
}
