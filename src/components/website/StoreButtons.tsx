type Variant = 'gold' | 'cream';

/**
 * Google Play + App Store download buttons.
 * Mobile: stacked full-width (Play on top, App Store on bottom). Desktop (sm+): side by side.
 * `gold` — on the light hero: white Play button + purple-gradient App Store button.
 * `cream` — on the magenta CTA band: white Play button + solid navy App Store button.
 */
export default function StoreButtons({
  variant = 'gold',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const appStoreClass =
    variant === 'gold'
      ? 'bg-[linear-gradient(120deg,#c840e8,#8b2fe0)] text-white hover:brightness-105'
      : 'bg-ink text-white hover:brightness-125';

  return (
    <div className={`flex flex-col items-stretch gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-start sm:gap-2 ${className}`}>
      <a
        href="#"
        className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-ink ring-1 ring-black/5 shadow-[0_16px_36px_-18px_rgba(123,47,247,0.45)] transition hover:brightness-95 sm:justify-start sm:gap-3 sm:px-6 sm:py-3"
      >
        <svg className="size-5 flex-none sm:size-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 3.5v17l9-8.5-9-8.5z" fill="#34a853" />
          <path d="M4 3.5l12.5 5.5-2.7 2.5L4 3.5z" fill="#ea4335" />
          <path d="M4 20.5l9.8-8-2.7-2.5L4 20.5z" fill="#fbbc04" />
          <path d="M13.8 9l4.4 1.9c1.1.5 1.1 1.7 0 2.2L13.8 15l-2.7-3 2.7-3z" fill="#4285f4" />
        </svg>
        <span className="leading-tight">
          <small className="block text-[0.55rem] font-medium uppercase tracking-wide text-[#6b7280] sm:text-[0.6rem]">
            Get it on
          </small>
          <strong className="block font-display text-[0.85rem] font-semibold sm:text-[1rem]">
            Google Play
          </strong>
        </span>
      </a>
      <a
        href="#"
        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 shadow-[0_12px_28px_-12px_rgba(11,15,25,0.45)] transition sm:justify-start sm:gap-3 sm:px-6 sm:py-3 ${appStoreClass}`}
      >
        <svg className="size-5 flex-none sm:size-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.37 1.43c0 1.14-.42 2.2-1.13 2.99-.85.94-2.24 1.67-3.4 1.58-.14-1.09.4-2.24 1.06-2.98.73-.83 2-1.44 3.47-1.59zM20.79 17.02c-.61 1.4-.9 2.02-1.68 3.26-1.09 1.73-2.62 3.88-4.52 3.9-1.69.02-2.12-1.1-4.41-1.09-2.29.01-2.77 1.11-4.46 1.09-1.9-.02-3.35-1.97-4.44-3.7C-.19 15.73-.5 10.04 1.38 7.02 2.71 4.87 4.82 3.62 6.8 3.62c2.02 0 3.29 1.11 4.96 1.11 1.62 0 2.61-1.11 4.94-1.11 1.77 0 3.64.96 4.98 2.62-4.37 2.4-3.66 8.65.6 10.78z" />
        </svg>
        <span className="leading-tight">
          <small className="block text-[0.55rem] font-medium uppercase tracking-wide opacity-70 sm:text-[0.6rem]">
            Download on the
          </small>
          <strong className="block font-display text-[0.85rem] font-semibold sm:text-[1rem]">
            App Store
          </strong>
        </span>
      </a>
    </div>
  );
}
