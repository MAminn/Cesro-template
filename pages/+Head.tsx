import defaultFaviconUrl from "../assets/favicon.svg";
import { useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
import type { LayoutSettings } from "#root/shared/types/layout-settings";

// Define types for Google Analytics
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

// ─── Pixel script generators (SSR injection) ───────────────────────────────

function getMetaPixelScript(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
}

function getGA4Script(measurementId: string): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}');`;
}

function getGA4ScriptSrc(measurementId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
}

function getTikTokPixelScript(pixelId: string): string {
  return `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${pixelId}');ttq.page()}(window,document,'ttq');`;
}

function getSnapchatPixelScript(pixelId: string): string {
  return `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${pixelId}');snaptr('track','PAGE_VIEW');`;
}

function getPinterestTagScript(tagId: string): string {
  return `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[];n.version="3.0";var t=document.createElement("script");t.async=!0;t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${tagId}');pintrk('page');`;
}

export default function HeadDefault() {
  const pageContext = usePageContext();
  const pixelConfigs = pageContext.pixelConfigs ?? [];
  const layoutSettings = pageContext.layoutSettingsData as LayoutSettings | undefined;

  // Dynamic favicon from layout settings
  const faviconUrl = layoutSettings?.faviconUrl || defaultFaviconUrl;
  const faviconType = layoutSettings?.faviconUrl
    ? (layoutSettings.faviconUrl.endsWith(".svg") ? "image/svg+xml"
      : layoutSettings.faviconUrl.endsWith(".png") ? "image/png"
      : layoutSettings.faviconUrl.endsWith(".ico") ? "image/x-icon"
      : "image/png")
    : "image/svg+xml";

  // Dynamic document title from layout settings (client-side only)
  useEffect(() => {
    if (layoutSettings?.siteTitle) {
      document.title = layoutSettings.siteTitle;
    }
  }, [layoutSettings?.siteTitle]);

  // Font loading script to replace the onLoad attribute
  useEffect(() => {
    const fontLink = document.querySelector("link[data-font-preload]");
    if (fontLink) {
      fontLink.setAttribute("rel", "stylesheet");
    }
  }, []);

  // Separate pixel configs by platform
  const metaPixels = pixelConfigs.filter((c) => c.platform === "meta");
  const ga4Pixels = pixelConfigs.filter((c) => c.platform === "google_ga4");
  const tiktokPixels = pixelConfigs.filter((c) => c.platform === "tiktok");
  const snapchatPixels = pixelConfigs.filter((c) => c.platform === "snapchat");
  const pinterestPixels = pixelConfigs.filter((c) => c.platform === "pinterest");

  return (
    <>
      {/* Basic favicon */}
      <link rel='icon' href={faviconUrl} type={faviconType} />

      {/* Blocking locale/dir sync — runs before first paint to prevent LTR→RTL flicker */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var l=localStorage.getItem("minimal-template-locale");if(l==="ar"){document.documentElement.setAttribute("dir","rtl");document.documentElement.setAttribute("lang","ar")}if(l&&document.cookie.indexOf("minimal-locale=")===-1){document.cookie="minimal-locale="+l+";path=/;max-age=31536000;SameSite=Lax"}var sel=localStorage.getItem("template-selection-cache");if(sel){var p=JSON.parse(sel);if(p&&p.landing==="landing-cesro"){document.documentElement.setAttribute("dir","rtl");document.documentElement.setAttribute("lang","ar");document.documentElement.setAttribute("data-template","cesro");document.documentElement.setAttribute("data-cesro-chrome","true")}}}catch(e){}})();`,
        }}
      />

      {/* Preconnect to critical domains */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />

      {/* Pixel preconnect hints */}
      {metaPixels.length > 0 && (
        <link rel='preconnect' href='https://connect.facebook.net' />
      )}
      {ga4Pixels.length > 0 && (
        <link rel='preconnect' href='https://www.googletagmanager.com' />
      )}
      {tiktokPixels.length > 0 && (
        <link rel='preconnect' href='https://analytics.tiktok.com' />
      )}
      {snapchatPixels.length > 0 && (
        <link rel='preconnect' href='https://sc-static.net' />
      )}
      {pinterestPixels.length > 0 && (
        <link rel='preconnect' href='https://s.pinimg.com' />
      )}

      {/* SSR-injected pixel base scripts */}
      {metaPixels.map((c) => (
        <script
          key={`meta-pixel-${c.id}`}
          data-pixel-platform='meta'
          data-pixel-id={c.pixelId}
          dangerouslySetInnerHTML={{ __html: getMetaPixelScript(c.pixelId) }}
        />
      ))}
      {ga4Pixels.map((c) => (
        <script
          key={`ga4-loader-${c.id}`}
          async
          src={getGA4ScriptSrc(c.pixelId)}
          data-pixel-platform='google_ga4'
          data-pixel-id={c.pixelId}
        />
      ))}
      {ga4Pixels.map((c) => (
        <script
          key={`ga4-init-${c.id}`}
          data-pixel-platform='google_ga4'
          dangerouslySetInnerHTML={{ __html: getGA4Script(c.pixelId) }}
        />
      ))}
      {tiktokPixels.map((c) => (
        <script
          key={`tiktok-pixel-${c.id}`}
          data-pixel-platform='tiktok'
          data-pixel-id={c.pixelId}
          dangerouslySetInnerHTML={{ __html: getTikTokPixelScript(c.pixelId) }}
        />
      ))}
      {snapchatPixels.map((c) => (
        <script
          key={`snapchat-pixel-${c.id}`}
          data-pixel-platform='snapchat'
          data-pixel-id={c.pixelId}
          dangerouslySetInnerHTML={{ __html: getSnapchatPixelScript(c.pixelId) }}
        />
      ))}
      {pinterestPixels.map((c) => (
        <script
          key={`pinterest-tag-${c.id}`}
          data-pixel-platform='pinterest'
          data-pixel-id={c.pixelId}
          dangerouslySetInnerHTML={{ __html: getPinterestTagScript(c.pixelId) }}
        />
      ))}

      {/* Preload critical assets - only preload landing.webp */}
      <link
        rel='preload'
        href='/assets/landing.webp'
        as='image'
        type='image/webp'
        fetchPriority='high'
      />

      {/* Font display optimization with React-friendly approach */}
      <link
        data-font-preload
        rel='preload'
        href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
        as='style'
      />

      {/* Meta tags for performance */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, viewport-fit=cover'
      />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />

      {/* Core Web Vitals hints */}
      <meta name='theme-color' content='#ffffff' />
      <meta name='color-scheme' content='light' />

      {/* Critical CSS as separate style tags */}
      <style>{`
        /* Critical CSS for Largest Contentful Paint */
        body { margin: 0; font-family: 'Poppins', sans-serif; }
        .hero-section { position: relative; height: 90vh; overflow: hidden; }
        .hero-content { position: relative; z-index: 9; }
        .hero-bg { 
          position: absolute; 
          inset: 0; 
          background-position: center;
          background-size: cover; 
        }
      `}</style>

      <style>{`
        /* Prevent layout shifts */
        img { display: block; max-width: 100%; }
        
        /* Responsive containers for mobile first approach */
        .container { 
          width: 100%; 
          padding-right: 1rem; 
          padding-left: 1rem; 
          margin-right: auto; 
          margin-left: auto; 
        }
        @media (min-width: 640px) { 
          .container { max-width: 640px; } 
        }
        @media (min-width: 768px) { 
          .container { max-width: 768px; } 
        }
        @media (min-width: 1024px) { 
          .container { max-width: 1024px; }
        }
        @media (min-width: 1280px) { 
          .container { max-width: 1280px; }
        }
      `}</style>

      <style>{`
        /* Use @font-display:swap for better performance */
        @font-face {
          font-family: 'Poppins';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2) format('woff2');
        }
      `}</style>
    </>
  );
}
