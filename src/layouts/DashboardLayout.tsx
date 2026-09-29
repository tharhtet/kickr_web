import { useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLogout } from '@/services/auth';
import { getAccessToken } from '@/lib/api/authToken';
import {
  IconBall,
  IconBell,
  IconGrid,
  IconLogout,
  IconMapPin,
  IconMenu,
  IconSearch,
  IconSettings,
  IconTrophy,
  IconUsers,
  IconX,
} from '@/components/ui/icons';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/tournaments', label: 'Tournaments', icon: IconTrophy, end: false },
  { to: '/groups', label: 'Group List', icon: IconUsers, end: false },
  { to: '/sport-types', label: 'Sport Types', icon: IconBall, end: false },
  { to: '/regions', label: 'Regions', icon: IconMapPin, end: false },
  { to: '/settings', label: 'Settings', icon: IconSettings, end: false },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-pitch-600 text-white shadow-sm shadow-pitch-600/30'
      : 'text-slate-600 hover:bg-pitch-50 hover:text-pitch-700',
  ].join(' ');

function Sidebar({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <img src="/logo.png" alt="kickr" className="h-8 w-auto" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <IconX className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={navLinkClass}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

/**
 * In-app dashboard chrome — sidebar (`pitch-*` green, mirrors the kickr
 * Flutter app) + topbar, sharing the `pitch` theme across dashboard,
 * tournaments, group list and settings routes. Redirects to `/login` when
 * there's no stored access token.
 */
export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-slate-200 shadow-xl">
            <Sidebar
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <IconMenu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search anything…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-ink outline-none transition focus:border-pitch-500 focus:bg-white focus:ring-2 focus:ring-pitch-500/15"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <IconBell className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pitch-100 text-sm font-semibold text-pitch-700">
              H
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
