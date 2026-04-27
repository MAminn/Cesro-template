import type { CesroFinalCtaContent } from "../content-schema";
import { CesroWhatsAppButton } from "../CesroWhatsAppButton";

interface CesroFinalCTAProps {
  content: CesroFinalCtaContent;
  whatsappNumber: string;
}

export function CesroFinalCTA({ content, whatsappNumber }: CesroFinalCTAProps) {
  if (!content.enabled) return null;

  return (
    <section className='relative w-full min-h-[80vh] flex items-center overflow-hidden'>
      {/* Background image */}
      {content.backgroundImage && (
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat scale-105'
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
          aria-hidden='true'
        />
      )}
      {!content.backgroundImage && (
        <div className='absolute inset-0 bg-(--cesro-bg)' aria-hidden='true' />
      )}

      {/* Layered overlays */}
      <div
        className='absolute inset-0 bg-linear-to-b from-(--cesro-bg) via-(--cesro-bg)/65 to-transparent'
        aria-hidden='true'
      />
      <div
        className='absolute inset-0 bg-linear-to-l from-(--cesro-bg)/80 via-transparent to-transparent rtl:bg-linear-to-r'
        aria-hidden='true'
      />

      {/* Content */}
      <div className='relative z-10 w-full px-6 md:px-16 lg:px-24 py-20 md:py-28'>
        <div className='max-w-3xl'>
          {content.eyebrow && (
            <p className='text-(--cesro-accent) font-bold text-xs sm:text-sm tracking-[0.35em] uppercase mb-5'>
              {content.eyebrow}
            </p>
          )}

          <h2 className='font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] text-white mb-6 md:mb-8'>
            {content.headlineLines.map((line, idx) => (
              <span key={idx}>
                {idx > 0 && <br />}
                {idx === content.accentLineIndex ? (
                  <span className='text-(--cesro-accent)'>{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h2>

          {content.supportingText && (
            <p className='text-white/70 text-base sm:text-lg md:text-xl leading-relaxed mb-10 md:mb-12 max-w-xl'>
              {content.supportingText}
            </p>
          )}

          <CesroWhatsAppButton
            label={content.cta.label}
            whatsappNumber={whatsappNumber}
            message={content.cta.whatsappMessage}
            variant='primary'
            size='lg'
            className='shadow-[0_0_50px_rgba(37,211,102,0.35)]'
          />

          {/* Trust items */}
          {content.trustItems.length > 0 && (
            <div className='mt-10 flex items-center gap-6 text-white/35 text-sm flex-wrap'>
              {content.trustItems.map((item, idx) => (
                <span key={idx} className='flex items-center gap-2'>
                  {item.showDot && (
                    <span className='inline-block w-2 h-2 rounded-full bg-(--cesro-accent)' />
                  )}
                  {item.label}
                  {idx < content.trustItems.length - 1 && (
                    <span
                      className='w-px h-4 bg-white/15 ms-4'
                      aria-hidden='true'
                    />
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
