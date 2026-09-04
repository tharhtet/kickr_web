type Social = { label: string; href: string; path: string };

const SOCIALS: Social[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/kickr',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.42.4.68.8.9 1.4.17.4.36 1 .42 2.2.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.22.6-.48 1-.9 1.4-.4.42-.8.68-1.4.9-.4.17-1 .36-2.2.42-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.42.8-.68 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.24-2.1.4-.5.2-.9.43-1.3.83-.4.4-.64.8-.83 1.3-.16.4-.35 1-.4 2.1C2.6 11.5 2.6 11.9 2.6 15s0 3.5.07 4.7c.05 1.1.24 1.7.4 2.1.2.5.43.9.83 1.3.4.4.8.64 1.3.83.4.16 1 .35 2.1.4 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.43 1.3-.83.4-.4.64-.8.83-1.3.16-.4.35-1 .4-2.1.07-1.2.07-1.6.07-4.7Zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-.32a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z',
  },
  {
    label: 'X',
    href: 'https://x.com/kickr',
    path: 'M17.53 3H20.5l-6.49 7.42L21.75 21h-6.02l-4.71-6.16L5.6 21H2.63l6.94-7.93L2.25 3h6.17l4.26 5.63L17.53 3Zm-1.06 16.2h1.65L7.62 4.71H5.86L16.47 19.2Z',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/kickr',
    path: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z',
  },
];

export default function SiteFooter() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-40">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-8 py-4 text-[0.82rem] text-white/70">
        <p>&copy; {new Date().getFullYear()} kickr. All rights reserved.</p>

        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="grid size-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-white/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-[18px]"
                aria-hidden="true"
              >
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
