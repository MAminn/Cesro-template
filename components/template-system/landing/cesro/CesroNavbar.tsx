/**
 * Currently unused. Cesro renders the global storefront Navbar
 * (the same one Demos 1–4 use). Retained in case a per-template
 * navbar variant is needed later (would be wired via
 * layoutSettings.header.navbarStyle).
 *
 * CesroNavbar — dark, minimal RTL navbar for the Cesro template.
 */
export function CesroNavbar() {
  return (
    <nav className='fixed top-0 inset-x-0 z-[10000] bg-[var(--cesro-bg)]/80 backdrop-blur-md border-b border-white/5'>
      <div className='flex items-center justify-between px-6 md:px-16 lg:px-24 h-16'>
        {/* Logo */}
        <a
          href='/'
          className='text-white font-black text-xl uppercase tracking-wider'>
          CESRO
        </a>

        {/* Minimal nav links */}
        <div className='hidden md:flex items-center gap-8'>
          <a
            href='/shop'
            className='text-white/60 text-sm font-bold uppercase tracking-wide hover:text-[var(--cesro-accent)] transition-colors'>
            المنتجات
          </a>
          <a
            href='/cart'
            className='text-white/60 text-sm font-bold uppercase tracking-wide hover:text-[var(--cesro-accent)] transition-colors'>
            السلة
          </a>
        </div>

        {/* Mobile hamburger placeholder — cart icon */}
        <div className='flex md:hidden items-center gap-4'>
          <a
            href='/cart'
            className='text-white/60 hover:text-white transition-colors'>
            <svg
              className='w-5 h-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={1.5}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
              />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
