import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconLogout, IconPencil } from '@/components/ui/icons';
import { useSignedIn, useSiteLogout } from '@/services/auth/hooks';
import { useMyProfile } from '@/services/profile';
import { Avatar } from './DetailUI';
import EditProfileModal from './EditProfileModal';

/**
 * `overlay` floats the nav over the hero on md+ (home); turn it off on pages
 * where content flows below the nav.
 */
export default function LandingNav({ overlay = true }: { overlay?: boolean }) {
  const signedIn = useSignedIn();
  return (
    <header className={`relative inset-x-0 top-0 z-50 ${overlay ? 'md:absolute' : ''}`}>
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

          {/* <Link
            to="/login"
            className="rounded-xl bg-[linear-gradient(120deg,#c840e8,#8b2fe0)] px-7 py-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_32px_-16px_rgba(123,47,247,0.7)] transition hover:brightness-105"
          >
            Log in
          </Link> */}
          {signedIn && <ProfileMenu />}
        </div>
      </div>
    </header>
  );
}

/** Signed-in user's avatar — opens a dropdown with edit profile and logout. */
function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const me = useMyProfile();
  const logout = useSiteLogout();
  const name = me.data?.displayName || me.data?.name || '';

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block rounded-full ring-2 ring-white shadow-md transition hover:ring-pitch-200"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name || '?'} src={me.data?.profileImage} className="size-11 text-sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5"
        >
          {name && (
            <div className="border-b border-slate-100 px-3 pb-2 pt-1.5">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              {me.data?.email && <p className="truncate text-xs text-cream-dim">{me.data.email}</p>}
            </div>
          )}
          {me.data && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setEditing(true);
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-ink"
            >
              <IconPencil className="h-4 w-4 shrink-0" />
              Edit profile
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <IconLogout className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      )}

      {me.data && (
        <EditProfileModal open={editing} onClose={() => setEditing(false)} user={me.data} />
      )}
    </div>
  );
}
