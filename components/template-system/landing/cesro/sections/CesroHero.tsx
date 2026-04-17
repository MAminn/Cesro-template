import type { HomepageHeroContent } from "#root/shared/types/homepage-content";
import { CesroWhatsAppButton } from "./CesroWhatsAppButton";

interface CesroHeroProps {
  content: HomepageHeroContent;
  whatsappNumber: string;
}

export function CesroHero({ content, whatsappNumber }: CesroHeroProps) {
  if (!content.enabled) return null;

  const bgImage = content.backgroundImage;

  return (
    <section className="relative w-full min-h-screen flex items-end overflow-hidden">
      {/* Background image */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden="true"
        />
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-(--cesro-bg)" aria-hidden="true" />
      )}

      {/* Cinematic gradient overlays */}
      <div
        className="absolute inset-0 bg-linear-to-t from-(--cesro-bg) via-(--cesro-bg)/65 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-linear-to-l from-(--cesro-bg)/80 via-transparent to-transparent rtl:bg-linear-to-r"
        aria-hidden="true"
      />

      {/* Content — positioned bottom-start for editorial weight */}
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 pb-16 md:pb-24 lg:pb-32 pt-40">
        <div className="max-w-4xl">
          {content.eyebrow && (
            <p className="text-(--cesro-accent) font-bold text-xs sm:text-sm tracking-[0.35em] uppercase mb-5 md:mb-6">
              {content.eyebrow}
            </p>
          )}

          <h1 className="font-black text-5xl sm:text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] text-white mb-6 md:mb-8">
            {content.title}
            <br />
            <span className="text-(--cesro-accent)">{content.subtitle}</span>
          </h1>

          {content.bodyText && (
            <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-8 md:mb-10">
              {content.bodyText}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <CesroWhatsAppButton
              label={content.ctaText}
              whatsappNumber={whatsappNumber}
              variant="primary"
              size="lg"
            />
            {content.secondaryCtaText && (
              <CesroWhatsAppButton
                label={content.secondaryCtaText}
                whatsappNumber={whatsappNumber}
                message={content.secondaryCtaLink ?? ""}
                variant="outline"
                size="lg"
              />
            )}
          </div>

          {content.badgeText && (
            <p className="text-white/40 text-sm mt-8 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-(--cesro-whatsapp) animate-pulse" />
              {content.badgeText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
