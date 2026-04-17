/**
 * CesroFooter — minimal dark footer for the Cesro template.
 * Replaces the global footer (hidden by CesroChrome).
 */
export function CesroFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#060F1F] text-white/40 py-12">
      <div className="px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-white/60 uppercase tracking-wider">
            CESRO
          </p>
          <p className="text-xs">
            © {year} CESRO. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
