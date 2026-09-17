import { Link } from 'react-router-dom';

const LINKS = [{ label: 'Home', href: '#top' }];

export default function LandingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="kickr" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-9">
          {/* <nav className="hidden gap-9 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink md:flex">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-gold">
                {l.label}
              </a>
            ))}
          </nav> */}

          <Link
            to="/login"
            className="rounded-xl bg-[linear-gradient(120deg,#c840e8,#8b2fe0)] px-7 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_32px_-16px_rgba(123,47,247,0.7)] transition hover:brightness-105"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
