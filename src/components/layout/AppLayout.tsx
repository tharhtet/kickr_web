import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-pitch-100 text-pitch-700'
      : 'text-slate-600 hover:bg-slate-100',
  ].join(' ');

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="kickr" className="h-6 w-6" />
            <span className="text-base font-semibold text-ink">kickr</span>
          </NavLink>
          <nav className="ml-auto flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <NavLink to="/privacy" className={linkClass}>
              Privacy
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} kickr. All rights reserved.
      </footer>
    </div>
  );
}
