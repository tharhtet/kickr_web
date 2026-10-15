import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import LandingNav from './LandingNav';
import SiteFooter from './SiteFooter';
import Waves from './Waves';
import { isApiError } from '@/lib/api/errors';
import { initials } from '@/lib/format';

/**
 * Building blocks shared by the public detail screens (event, group):
 * page chrome, cards, pills, avatars, and loading / error states.
 */

export type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export const card =
  'rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_18px_40px_-28px_rgba(123,47,247,0.35)]';
export const gradientBtn =
  'bg-[linear-gradient(120deg,#c840e8,#8b2fe0)] text-white shadow-[0_16px_32px_-16px_rgba(123,47,247,0.7)] transition hover:brightness-105';
export const outlineBtn =
  'bg-white text-pitch-700 ring-1 ring-slate-200 transition hover:bg-pitch-50';

const AVATAR_TINTS = [
  'bg-pitch-100 text-pitch-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-yellow-100 text-yellow-700',
];

/** Nav + gradient surface + wave footer, with content capped to the nav width. */
export function DetailPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(120%_120%_at_15%_0%,#ffffff_0%,#f7f3fb_55%,#f2ecf9_100%)] text-ink">
      <LandingNav overlay={false} />
      <main className="relative z-[2] mx-auto w-full max-w-[1180px] flex-1 px-4 pb-12 sm:px-8">
        {children}
      </main>
      <div className="relative md:h-48">
        <Waves className="hidden h-48 md:block" />
        <SiteFooter />
      </div>
    </div>
  );
}

export function Breadcrumb({ items, className = 'text-xs' }: { items: string[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-cream-dim ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              <span
                className={last ? 'font-semibold text-ink' : undefined}
                aria-current={last ? 'page' : undefined}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Headline whose last word gets the italic purple accent, like the home hero. */
export function AccentTitle({ text, className = '' }: { text: string; className?: string }) {
  const cut = text.lastIndexOf(' ');
  const head = cut > 0 ? text.slice(0, cut) : '';
  const tail = cut > 0 ? text.slice(cut + 1) : text;
  return (
    <h1 className={`font-light leading-tight text-ink ${className}`}>
      {head && `${head} `}
      <span className="font-semibold italic text-gold">{tail}</span>
    </h1>
  );
}

export function Pill({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function IconBadge({ icon: Icon, className = 'size-9' }: { icon: Icon; className?: string }) {
  return (
    <span className={`grid flex-none place-items-center rounded-xl bg-pitch-50 text-pitch-600 ${className}`}>
      <Icon className="size-[18px]" />
    </span>
  );
}

/** Photo avatar, or initials on a pastel tint picked by `index`. */
export function Avatar({
  name,
  src,
  index = 0,
  className = 'size-9 text-xs',
}: {
  name: string;
  src?: string;
  index?: number;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt="" className={`flex-none rounded-full object-cover ${className}`} />;
  }
  return (
    <span
      className={`grid flex-none place-items-center rounded-full font-bold ${
        AVATAR_TINTS[index % AVATAR_TINTS.length]
      } ${className}`}
    >
      {initials(name)}
    </span>
  );
}

/** Card header row: title on the left, optional meta / action on the right. */
export function SectionHeader({
  title,
  aside,
  className = 'text-lg',
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className={`font-bold text-ink ${className}`}>{title}</h2>
      {aside}
    </div>
  );
}

export function DetailMessage({
  title,
  body,
  action = { to: '/', label: 'Back to home' },
}: {
  title: string;
  body: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-cream-dim">{body}</p>
      <Link
        to={action.to}
        className={`mt-6 inline-block rounded-xl px-6 py-2.5 text-sm font-bold ${gradientBtn}`}
      >
        {action.label}
      </Link>
    </div>
  );
}

/** Full-page error for a failed detail fetch. The detail routes are public. */
export function DetailError({ error, noun }: { error: unknown; noun: 'event' | 'group' }) {
  const status = isApiError(error) ? error.status : undefined;
  if (status === 404) {
    return (
      <DetailMessage
        title={`${noun === 'event' ? 'Event' : 'Group'} not found`}
        body={`This ${noun} may have been removed or the link is incorrect.`}
      />
    );
  }
  return (
    <DetailMessage
      title={`Couldn't load this ${noun}`}
      body="Please check your connection and try again."
    />
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-[minmax(0,1fr)_300px]" aria-busy="true">
      <div className="space-y-4">
        <div className="aspect-[600/280] rounded-2xl bg-slate-200" />
        <div className="h-8 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
      </div>
      <div className="h-80 rounded-2xl bg-slate-200" />
    </div>
  );
}

/** Placeholder pitch artwork for events without a cover photo. */
export function PitchCover() {
  return (
    <svg viewBox="0 0 958 529" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="958" height="529" fill="#3a8a45" />
      {Array.from({ length: 11 }, (_, i) =>
        i % 2 === 1 ? <rect key={i} x={i * 88} width="88" height="529" fill="#327d3d" /> : null,
      )}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2.5">
        <rect x="59" y="51" width="840" height="426" rx="4" />
        <line x1="479" y1="51" x2="479" y2="477" />
        <circle cx="479" cy="264" r="68" />
        <rect x="59" y="171" width="98" height="186" />
        <rect x="801" y="171" width="98" height="186" />
      </g>
    </svg>
  );
}
