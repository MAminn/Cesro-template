import type { CesroHeroContent, CesroTheme } from "../content-schema";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  );
}

interface CesroHeroProps {
  content: CesroHeroContent;
  whatsappNumber: string;
  theme: CesroTheme;
}

export function CesroHero({ content, whatsappNumber }: CesroHeroProps) {
  if (!content.enabled) return null;

  const bgImage = content.backgroundImage;
  const mobileBg = content.mobileBackgroundImage;

  const primaryHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(content.primaryCta.whatsappMessage ?? "")}`;
  const secondaryHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(content.secondaryCta.whatsappMessage ?? "")}`;

  return (
    <section className='relative w-full min-h-screen flex items-end overflow-hidden'>
      {/* CESRO wordmark */}
      <span className='absolute top-6 end-6 z-20 text-white font-bold text-xl tracking-[0.15em]'>
        CESRO
      </span>

      {/* Background image — desktop */}
      {bgImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat scale-105${mobileBg ? " hidden sm:block" : ""}`}
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden='true'
        />
      )}
      {/* Background image — mobile variant */}
      {mobileBg && (
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 sm:hidden'
          style={{ backgroundImage: `url(${mobileBg})` }}
          aria-hidden='true'
        />
      )}
      {!bgImage && !mobileBg && (
        <div className='absolute inset-0 bg-navy' aria-hidden='true' />
      )}

      {/* Cinematic gradient overlays */}
      <div
        className='absolute inset-0 bg-linear-to-t from-navy via-navy/65 to-transparent'
        aria-hidden='true'
      />
      <div
        className='absolute inset-0 bg-linear-to-r from-navy/80 via-transparent to-transparent rtl:bg-linear-to-l'
        aria-hidden='true'
      />

      {/* Content — positioned bottom-start for editorial weight */}
      <div className='relative z-10 w-full px-6 md:px-16 lg:px-24 pb-16 md:pb-24 lg:pb-32 pt-40'>
        <div className='max-w-4xl'>
          {content.eyebrow && (
            <p className='text-cesro-accent font-bold text-xs sm:text-sm tracking-[0.35em] uppercase mb-5 md:mb-6'>
              {content.eyebrow}
            </p>
          )}

          <h1 className='font-heading text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold uppercase leading-[0.85] text-white mb-6 md:mb-8'>
            {content.headlineLine1}
            <br />
            <span className='text-cesro-accent'>{content.headlineLine2}</span>
          </h1>

          {content.supportingText && (
            <p className='text-white/70 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-8 md:mb-10'>
              {content.supportingText}
            </p>
          )}

          <div className='flex flex-col sm:flex-row items-start gap-4'>
            <a
              href={primaryHref}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center gap-3 font-bold tracking-wide transition-all duration-300 rounded-sm px-10 py-5 text-lg bg-whatsapp text-white hover:brightness-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)]'
              aria-label={`${content.primaryCta.label} - WhatsApp`}>
              <WhatsAppIcon size={24} />
              <span>{content.primaryCta.label}</span>
            </a>
            <a
              href={secondaryHref}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center gap-3 font-bold tracking-wide transition-all duration-300 rounded-sm px-10 py-5 text-lg border border-white/30 text-white hover:border-white/70 hover:bg-white/10'
              aria-label={`${content.secondaryCta.label} - WhatsApp`}>
              <WhatsAppIcon size={24} />
              <span>{content.secondaryCta.label}</span>
            </a>
          </div>

          {content.presenceText && (
            <p className='text-white/40 text-sm mt-8 flex items-center gap-2'>
              <span className='inline-block w-2 h-2 rounded-full bg-whatsapp animate-pulse' />
              {content.presenceText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
