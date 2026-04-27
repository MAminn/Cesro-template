import type { CesroAboutContent, CesroIconName } from "../content-schema";
import {
  Layers,
  DollarSign,
  Truck,
  MessageCircle,
  Shield,
  Package,
  Headphones,
  Star,
} from "lucide-react";

const ICON_MAP: Record<CesroIconName, React.FC<{ className?: string }>> = {
  variety: Layers,
  wholesale: DollarSign,
  supply: Truck,
  whatsapp: MessageCircle,
  quality: Star,
  shipping: Package,
  support: Headphones,
  shield: Shield,
};

interface CesroAboutProps {
  content: CesroAboutContent;
}

export function CesroAbout({ content }: CesroAboutProps) {
  if (!content.enabled) return null;

  const isGrid = content.features.layout === "grid-2-col";

  return (
    <section className='relative w-full bg-(--cesro-bg) overflow-hidden'>
      {/* Two-column editorial grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen'>
        {/* Image column — full-bleed */}
        <div className='relative h-[70vh] lg:h-full lg:min-h-screen overflow-hidden'>
          {content.sideImage ? (
            <img
              src={
                content.sideImage.startsWith("http")
                  ? content.sideImage
                  : content.sideImage.startsWith("/")
                    ? content.sideImage
                    : `/uploads/${content.sideImage}`
              }
              alt={content.headlineLine1}
              className='absolute inset-0 w-full h-full object-cover scale-105'
              loading='lazy'
            />
          ) : (
            <div className='absolute inset-0 bg-white/5' />
          )}
          {/* Gradient toward text side */}
          <div
            className='absolute inset-0 bg-linear-to-l rtl:bg-linear-to-r from-(--cesro-bg)/80 via-transparent to-transparent hidden lg:block'
            aria-hidden='true'
          />
          <div
            className='absolute inset-0 bg-linear-to-t from-(--cesro-bg) via-transparent to-transparent lg:hidden'
            aria-hidden='true'
          />
          {/* Editorial column divider */}
          <div
            className='absolute top-0 inset-e-0 h-full w-1 bg-(--cesro-accent) hidden lg:block'
            aria-hidden='true'
          />
        </div>

        {/* Text column */}
        <div className='flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 lg:py-32'>
          {content.eyebrow && (
            <p className='text-(--cesro-accent) font-bold text-xs sm:text-sm tracking-[0.35em] uppercase mb-4'>
              {content.eyebrow}
            </p>
          )}

          <h2 className='font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.85] text-white mb-8 md:mb-10'>
            {content.headlineLine1}
            {content.headlineLine2 && (
              <>
                <br />
                <span className='text-white/40'>{content.headlineLine2}</span>
              </>
            )}
          </h2>

          <div className='max-w-lg'>
            {content.bodyParagraphs.map((para, idx) => (
              <p
                key={idx}
                className='text-white/70 text-base sm:text-lg leading-relaxed mb-5'>
                {para}
              </p>
            ))}
          </div>

          {/* Feature highlights */}
          {content.features.items.length > 0 && (
            <div
              className={`mt-8 max-w-lg ${
                isGrid
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8"
                  : "flex flex-col gap-6"
              }`}>
              {content.features.items.map((item, idx) => {
                const Icon = ICON_MAP[item.icon] ?? Layers;
                return (
                  <div
                    key={idx}
                    className='border-s-2 border-(--cesro-accent) ps-4'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Icon className='w-4 h-4 text-(--cesro-accent)' />
                      <h3 className='text-white font-bold text-base sm:text-lg uppercase'>
                        {item.title}
                      </h3>
                    </div>
                    <p className='text-white/40 text-sm leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
