import { useCallback, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Avatar,
  Breadcrumb,
  DetailError,
  DetailPageShell,
  DetailSkeleton,
  IconBadge,
  Pill,
  PitchCover,
  SectionHeader,
  card,
  gradientBtn,
  type Icon,
} from '@/components/website/DetailUI';
import LoginModal, { type AuthMode } from '@/components/website/LoginModal';
import Modal from '@/components/website/Modal';
import {
  IconBolt,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconImage,
  IconLock,
  IconLogout,
  IconMapPin,
  IconShare,
  IconTarget,
  IconUserPlus,
  IconUsers,
} from '@/components/ui/icons';
import { isApiError } from '@/lib/api/errors';
import { capitalize, formatPrice, formatTime } from '@/lib/format';
import { useShare } from '@/lib/useShare';
import { useSignedIn } from '@/services/auth/hooks';
import { useGroupEvents, type EventSummary } from '@/services/events';
import {
  GROUP_MEMBER_ROLES,
  useGroup,
  useGroupMembers,
  useGroupPhotos,
  useJoinGroup,
  useLeaveGroup,
  type GroupDetail,
  type GroupMember,
  type GroupPhoto,
} from '@/services/groups';

type Tab = 'events' | 'members' | 'gallery';

/** The backend stores a bare `price` with no currency; events are priced in baht. */
const PRICE_CURRENCY = 'THB';

/** Members listed by name in the sidebar before collapsing into an avatar stack. */
const SIDEBAR_MEMBERS = 2;
const STACKED_AVATARS = 3;
/** Gallery tiles in the sidebar; the last one becomes "+N" when there are more. */
const SIDEBAR_GALLERY = 6;
/** Finished matches listed under "Recent matches". */
const RECENT_MATCHES = 3;

const linkBtn = 'text-xs font-semibold text-pitch-600 hover:underline';

/** Members / events / photos 403 for anyone outside a private group. */
function isForbidden(err: unknown) {
  return isApiError(err) && err.status === 403;
}

/** Members / events / photos still need an account — 401 when logged out. */
function isUnauthorized(err: unknown) {
  return isApiError(err) && err.status === 401;
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "Bangkok, Thailand" — the API stores the country as an ISO code. */
function formatPlace(group: GroupDetail) {
  let country = group.country;
  if (country) {
    try {
      country =
        new Intl.DisplayNames(['en'], { type: 'region' }).of(country.toUpperCase()) ?? country;
    } catch {
      country = country.toUpperCase();
    }
  }
  return [group.city && capitalize(group.city), country].filter(Boolean).join(', ');
}

function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

/** Owner first, then admin, captain, … — the API returns members unordered. */
function byRole(a: GroupMember, b: GroupMember) {
  return GROUP_MEMBER_ROLES.indexOf(a.role) - GROUP_MEMBER_ROLES.indexOf(b.role);
}

/** A list that may still be loading, or be members-only. */
interface Section<T> {
  data?: T;
  isPending: boolean;
  error: unknown;
  /** Known members-only for the caller, so it was never requested. */
  restricted?: boolean;
}

/** Stands in for a list the caller can't see — skips a request that would 403. */
function restrictedSection<T>(): Section<T> {
  return { isPending: false, error: null, restricted: true };
}

function count<T extends unknown[]>(s: Section<T>): string {
  return s.data ? String(s.data.length) : '—';
}

/** Loading / members-only / failed placeholder for a section; null once data is in. */
function sectionFallback<T>(s: Section<T>, what: string): ReactNode {
  if (s.restricted || isForbidden(s.error))
    return <p className="text-sm text-cream-dim">Only members can see this group's {what}.</p>;
  if (s.isPending) return <div className="h-16 animate-pulse rounded-xl bg-slate-100" />;
  if (s.error) return <p className="text-sm text-cream-dim">Couldn't load {what}.</p>;
  return null;
}

// --- header -------------------------------------------------------------------

function joinLabel(group: GroupDetail) {
  return group.isPrivate ? 'Request to join' : 'Join group';
}

const solidBtn = 'bg-pitch-600 text-white transition hover:bg-pitch-700';
const plainBtn = 'bg-white text-ink ring-1 ring-slate-300 transition hover:bg-slate-50';

function GroupHeader({
  group,
  signedIn,
  onLogin,
}: {
  group: GroupDetail;
  signedIn: boolean;
  onLogin: () => void;
}) {
  const { share, copied } = useShare(group.name);
  const join = useJoinGroup(group._id);
  const leave = useLeaveGroup(group._id);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const closeConfirmLeave = useCallback(() => setConfirmLeave(false), []);
  const pending = group.memberStatus === 'pending';
  // The owner can't leave (the API 403s) — they transfer or delete the group.
  const canLeave =
    (group.memberStatus === 'approved' && group.userRole !== 'owner') || pending;
  const place = formatPlace(group);
  return (
    <section className={`${card} overflow-hidden`}>
      <div className="relative aspect-[3/1] bg-[#6f9a5a] sm:aspect-[4.4/1]">
        {group.wallpaper ? (
          <img src={group.wallpaper} alt="" className="h-full w-full object-cover" />
        ) : (
          <PitchCover />
        )}
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 sm:px-7 lg:flex-row lg:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
          <div className="relative -mt-14 w-fit flex-none sm:-mt-16">
            {group.logo ? (
              <img
                src={group.logo}
                alt=""
                className="size-28 rounded-full bg-white object-contain p-1 shadow-lg ring-4 ring-white sm:size-32"
              />
            ) : (
              <Avatar
                name={group.name}
                className="size-28 text-3xl shadow-lg ring-4 ring-white sm:size-32"
              />
            )}
            <span className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-full bg-pitch-600 text-white ring-2 ring-white">
              <IconTarget className="size-4" />
            </span>
          </div>

          <div className="min-w-0 pt-1 sm:pt-5">
            <h1 className="truncate text-[clamp(1.75rem,3.2vw,2.25rem)] font-bold leading-tight text-ink">
              {group.name}
            </h1>
            <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-cream-dim">
              {group.handle && <li className="font-semibold text-pitch-600">@{group.handle}</li>}
              {place && (
                <li className="flex items-center gap-1">
                  <IconMapPin className="size-4" /> {place}
                </li>
              )}
              {group.sportType && (
                <li className="flex items-center gap-1">
                  <IconTarget className="size-4" /> {capitalize(group.sportType)}
                </li>
              )}
              {group.isPrivate && (
                <li>
                  <Pill className="bg-slate-100 px-2.5 py-0.5 text-xs text-ink-2">
                    <IconLock className="size-3" /> Private group
                  </Pill>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-none flex-col items-stretch gap-1.5 sm:items-end">
          <div className="flex items-center gap-2.5">
            {group.memberStatus === 'approved' ? (
              <span className="flex flex-1 items-center justify-center rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 sm:flex-none">
                Member
              </span>
            ) : group.memberStatus === 'pending' ? (
              <span className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500 sm:flex-none">
                Request pending
              </span>
            ) : signedIn ? (
              <button
                type="button"
                onClick={() => join.mutate()}
                disabled={join.isPending}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${solidBtn}`}
              >
                <IconUserPlus className="size-4" /> {join.isPending ? 'Joining…' : joinLabel(group)}
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold sm:flex-none ${solidBtn}`}
              >
                <IconUserPlus className="size-4" /> {joinLabel(group)}
              </button>
            )}
            {canLeave && (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                aria-label={pending ? 'Cancel join request' : 'Leave group'}
                title={pending ? 'Cancel request' : 'Leave group'}
                className={`grid size-11 place-items-center rounded-xl ${plainBtn} hover:text-red-600`}
              >
                <IconLogout className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={share}
              aria-label={copied ? 'Link copied' : 'Share group'}
              title={copied ? 'Link copied' : 'Share'}
              className={`grid size-11 place-items-center rounded-xl ${plainBtn}`}
            >
              <IconShare className="size-4" />
            </button>
          </div>
          {join.error && (
            <p role="alert" className="text-xs text-red-600">
              {isApiError(join.error)
                ? join.error.message
                : "Couldn't join the group. Please try again."}
            </p>
          )}
        </div>
      </div>

      <Modal
        open={confirmLeave}
        onClose={closeConfirmLeave}
        title={pending ? 'Cancel join request?' : `Leave ${group.name}?`}
        subtitle={
          pending
            ? 'Your request to join will be withdrawn. You can send a new one later.'
            : group.isPrivate
              ? "You'll lose access to this group's members, events and photos. To come back you'll need to request to join again."
              : 'You can join again at any time.'
        }
      >
        <div className="flex flex-col gap-2">
          {leave.error && (
            <p role="alert" className="text-sm text-red-600">
              {isApiError(leave.error)
                ? leave.error.message
                : "Couldn't leave the group. Please try again."}
            </p>
          )}
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closeConfirmLeave}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold ${plainBtn}`}
            >
              {pending ? 'Keep request' : 'Stay'}
            </button>
            <button
              type="button"
              onClick={() => leave.mutate(undefined, { onSuccess: closeConfirmLeave })}
              disabled={leave.isPending}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leave.isPending
                ? pending
                  ? 'Cancelling…'
                  : 'Leaving…'
                : pending
                  ? 'Cancel request'
                  : 'Leave group'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

/** Stat tiles; one with `onClick` becomes a button (e.g. Members → member list). */
function Stats({ items }: { items: { label: string; value: string; onClick?: () => void }[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((s) => (
        <div key={s.label} className={`${card} relative px-4 py-3.5`}>
          <dd className="text-2xl font-bold text-ink">{s.value}</dd>
          <dt className="text-xs text-cream-dim">
            {s.onClick ? (
              // Stretched over the tile so the whole card is the hit area.
              <button
                type="button"
                onClick={s.onClick}
                className="after:absolute after:inset-0 after:rounded-2xl after:transition hover:text-pitch-600 hover:after:ring-2 hover:after:ring-pitch-200"
              >
                {s.label}
              </button>
            ) : (
              s.label
            )}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function Tabs({
  tab,
  onChange,
  counts,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  counts: Partial<Record<Tab, number>>;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'members', label: 'Members' },
    { id: 'gallery', label: 'Gallery' },
  ];
  return (
    <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => {
        const active = t.id === tab;
        const n = counts[t.id];
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`-mb-px flex flex-none items-center gap-2 border-b-2 px-4 py-3 text-[0.95rem] font-semibold transition ${
              active ? 'border-pitch-600 text-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {t.label}
            {n !== undefined && (
              <span
                className={`rounded-md px-1.5 text-[0.68rem] ${
                  active ? 'bg-pitch-50 text-pitch-600' : 'bg-slate-100 text-ink-2'
                }`}
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// --- main column --------------------------------------------------------------

function EventRow({ event }: { event: EventSummary }) {
  const d = new Date(event.date);
  const challenge = event.type === 'challenge';
  const open = event.status === 'join' && !event.isFull;
  return (
    <li className={`${card} flex items-center gap-3 p-3 sm:gap-4`}>
      <div className="grid w-14 flex-none place-items-center rounded-xl bg-pitch-50 py-2 text-pitch-600">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider">
          {d.toLocaleDateString('en-GB', { month: 'short' })}
        </span>
        <span className="text-2xl font-bold leading-none">{d.getDate()}</span>
      </div>

      <div className="hidden h-16 w-24 flex-none overflow-hidden rounded-xl sm:block">
        {event.coverImage ? (
          <img src={event.coverImage} alt="" className="h-full w-full object-cover" />
        ) : challenge ? (
          <div className="h-full w-full bg-[linear-gradient(135deg,#6b3fd1,#4a2fa8)]" />
        ) : (
          <PitchCover />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {challenge && (
            <Pill className="bg-amber-50 px-2 py-0.5 text-[0.65rem] text-amber-700">
              Challenge match
            </Pill>
          )}
          {open && !challenge && (
            <Pill className="bg-emerald-50 px-2 py-0.5 text-[0.65rem] text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600" /> Open
            </Pill>
          )}
          {event.isFull && (
            <Pill className="bg-rose-50 px-2 py-0.5 text-[0.65rem] text-rose-600">Full</Pill>
          )}
          <Pill className="bg-pitch-50 px-2 py-0.5 text-[0.65rem] text-pitch-700">
            {capitalize(event.subType ?? event.sportType)}
          </Pill>
        </div>
        <p className="mt-1 truncate text-sm font-bold text-ink sm:text-base">{event.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[0.7rem] text-cream-dim">
          <span className="flex items-center gap-1">
            <IconClock className="size-3" />
            {d.toLocaleDateString('en-GB', { weekday: 'short' })} · {formatTime(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <IconUsers className="size-3" /> {event.joinedCount}/{event.maxPlayers}
          </span>
          {event.price > 0 && (
            <span className="font-semibold text-ink">
              {formatPrice(event.price, PRICE_CURRENCY)}
            </span>
          )}
        </p>
      </div>

      <Link
        to={`/event/${event._id}`}
        className={`flex-none rounded-lg px-4 py-2 text-xs font-bold ${gradientBtn}`}
      >
        View
      </Link>
    </li>
  );
}

function EventList({
  title,
  section,
  empty,
}: {
  title: string;
  section: Section<EventSummary[]>;
  empty: string;
}) {
  const events = section.data;
  return (
    <section>
      <SectionHeader title={title} />
      <div className="mt-3">
        {sectionFallback(section, 'events') ??
          (events!.length === 0 ? (
            <p className={`${card} p-5 text-sm text-cream-dim`}>{empty}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {events!.map((e) => (
                <EventRow key={e._id} event={e} />
              ))}
            </ul>
          ))}
      </div>
    </section>
  );
}

function RecentMatches({ section }: { section: Section<EventSummary[]> }) {
  // Newest first — the API sorts soonest-first.
  const recent = section.data ? [...section.data].reverse().slice(0, RECENT_MATCHES) : [];
  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="Recent matches" />
      <div className="mt-3">
        {sectionFallback(section, 'matches') ??
          (recent.length === 0 ? (
            <p className="text-sm text-cream-dim">No matches played yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((e) => {
                const { scoreA, scoreB } = e.result ?? {};
                const scored = scoreA != null && scoreB != null;
                return (
                  <li key={e._id}>
                    <Link
                      to={`/event/${e._id}`}
                      className="flex items-center gap-3 py-3 hover:opacity-80"
                    >
                      <span className="grid size-7 flex-none place-items-center rounded-full bg-emerald-50 text-emerald-700">
                        <IconCheckCircle className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{e.title}</p>
                        <p className="text-[0.7rem] text-cream-dim">{formatShortDate(e.date)}</p>
                      </div>
                      {scored && (
                        <span className="flex-none text-lg font-bold text-ink">
                          {scoreA} – {scoreB}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
      </div>
    </section>
  );
}

function MemberRow({ member, index }: { member: GroupMember; index: number }) {
  const highlight = member.role !== 'member';
  const since = member.joinedAt ?? member.createdAt;
  return (
    <li className="flex items-center gap-3 py-2">
      <Avatar name={member.userId.name} src={member.userId.profileImage} index={index} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {member.userId.displayName || member.userId.name}
        </p>
        {since && <p className="text-[0.68rem] text-cream-dim">Joined {formatShortDate(since)}</p>}
      </div>
      <div className="flex flex-none gap-1">
        {member.isCashier && (
          <Pill className="bg-sky-50 px-2.5 py-0.5 text-[0.65rem] text-sky-700">Cashier</Pill>
        )}
        <Pill
          className={`px-2.5 py-0.5 text-[0.65rem] ${
            highlight ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-ink-2'
          }`}
        >
          {capitalize(member.role.replace('-', ' '))}
        </Pill>
      </div>
    </li>
  );
}

function MemberList({ section }: { section: Section<GroupMember[]> }) {
  return (
    <section className={`${card} p-5`}>
      <SectionHeader
        title="Members"
        aside={<p className="text-xs font-medium text-cream-dim">{count(section)} total</p>}
      />
      <div className="mt-2">
        {sectionFallback(section, 'members') ?? (
          <ul className="divide-y divide-slate-100">
            {section.data!.map((m, i) => (
              <MemberRow key={m._id} member={m} index={i} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Gallery({ photos, limit }: { photos: GroupPhoto[]; limit?: number }) {
  if (photos.length === 0) return <p className="text-sm text-cream-dim">No photos yet.</p>;
  const shown = limit ? photos.slice(0, limit) : photos;
  const more = photos.length - shown.length;
  return (
    <ul className={`grid gap-2 ${limit ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {shown.map((p, i) => {
        // When truncating, the last tile turns into a "+N" overlay.
        const last = more > 0 && i === shown.length - 1;
        return (
          <li key={p._id} className="relative aspect-square overflow-hidden rounded-xl bg-pitch-50">
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </a>
            {last && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center bg-pitch-600/70 text-sm font-bold text-white">
                +{more + 1}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const TAB_NOUN: Record<Tab, string> = {
  events: 'Events',
  members: 'Members',
  gallery: 'Photos',
};

const MEMBER_PERKS: { icon: Icon; label: string }[] = [
  { icon: IconCalendar, label: 'Upcoming events' },
  { icon: IconBolt, label: 'Challenges & match results' },
  { icon: IconUsers, label: 'Members & captains' },
  { icon: IconImage, label: 'Photo gallery' },
];

/** Shown in place of every tab to a logged-out visitor. */
function LockedCard({
  group,
  tab,
  onLogin,
  onSignup,
}: {
  group: GroupDetail;
  tab: Tab;
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <section className={`${card} px-6 py-10 sm:px-8`}>
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-pitch-50 text-pitch-600">
          <IconLock className="size-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-ink">{TAB_NOUN[tab]} are for members only</h2>
        <p className="mt-2 max-w-md text-sm text-cream-dim">
          Log in and request to join to see what's happening in {group.name}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={onLogin}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold ${solidBtn}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={onSignup}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${plainBtn}`}
          >
            Create an account
          </button>
        </div>
      </div>
      <ul className="mt-9 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
        {MEMBER_PERKS.map(({ icon: PerkIcon, label }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl bg-pitch-50/60 px-4 py-3.5 text-sm font-semibold text-ink"
          >
            <PerkIcon className="size-5 flex-none text-pitch-600" /> {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

// --- sidebar ------------------------------------------------------------------

function AboutCard({ group }: { group: GroupDetail }) {
  const place = formatPlace(group);
  const facts: { icon: Icon; label: string; value?: string }[] = [
    { icon: IconMapPin, label: 'Based in', value: place },
    {
      icon: IconTarget,
      label: 'Sport',
      value: group.sportType && capitalize(group.sportType),
    },
    {
      icon: IconCalendar,
      label: 'Created',
      value: group.createdAt && formatMonthYear(group.createdAt),
    },
  ];
  return (
    <section className={`${card} p-5`}>
      <h2 className="text-lg font-bold text-ink">About</h2>
      {group.description && (
        <p className="mt-2 whitespace-pre-line text-sm text-cream-dim">{group.description}</p>
      )}
      <ul className="mt-4 flex flex-col gap-3">
        {facts
          .filter((f) => f.value)
          .map((f) => (
            <li key={f.label} className="flex items-center gap-3">
              <IconBadge icon={f.icon} />
              <div>
                <p className="text-[0.68rem] text-cream-dim">{f.label}</p>
                <p className="text-[0.95rem] font-bold text-ink">{f.value}</p>
              </div>
            </li>
          ))}
      </ul>
      {group.rules && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-cream-dim">Group rules</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-2">{group.rules}</p>
        </div>
      )}
    </section>
  );
}

/** Full roster from `GET /groups/:id/members`, opened from the Members stat. */
function MembersModal({
  open,
  onClose,
  group,
  section,
}: {
  open: boolean;
  onClose: () => void;
  group: GroupDetail;
  section: Section<GroupMember[]>;
}) {
  const total = section.data?.length;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Members"
      subtitle={
        total === undefined
          ? group.name
          : `${total} ${total === 1 ? 'member' : 'members'} in ${group.name}`
      }
    >
      <div className="-mx-2 mt-4 max-h-[60vh] overflow-y-auto px-2">
        {sectionFallback(section, 'members') ?? (
          <ul className="divide-y divide-slate-100">
            {section.data!.map((m, i) => (
              <MemberRow key={m._id} member={m} index={i} />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function MembersCard({
  section,
  onSeeAll,
}: {
  section: Section<GroupMember[]>;
  onSeeAll: () => void;
}) {
  const members = section.data ?? [];
  const listed = members.slice(0, SIDEBAR_MEMBERS);
  const stacked = members.slice(SIDEBAR_MEMBERS, SIDEBAR_MEMBERS + STACKED_AVATARS);
  const more = members.length - listed.length - stacked.length;
  return (
    <section className={`${card} p-5`}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-ink">Members</h2>
        {section.data && (
          <button type="button" onClick={onSeeAll} className={linkBtn}>
            See all {members.length}
          </button>
        )}
      </div>
      <div className="mt-2">
        {sectionFallback(section, 'members') ?? (
          <>
            <ul>
              {listed.map((m, i) => (
                <MemberRow key={m._id} member={m} index={i} />
              ))}
            </ul>
            {(stacked.length > 0 || more > 0) && (
              <div className="mt-2 flex items-center">
                {stacked.map((m, i) => (
                  <Avatar
                    key={m._id}
                    name={m.userId.name}
                    src={m.userId.profileImage}
                    index={SIDEBAR_MEMBERS + i}
                    className="-ml-1.5 size-7 text-[0.6rem] ring-2 ring-white first:ml-0"
                  />
                ))}
                {more > 0 && (
                  <span className="-ml-1.5 grid size-7 place-items-center rounded-full bg-pitch-50 text-[0.6rem] font-bold text-pitch-600 ring-2 ring-white first:ml-0">
                    +{more}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function GalleryCard({
  section,
  onSeeAll,
}: {
  section: Section<GroupPhoto[]>;
  onSeeAll: () => void;
}) {
  return (
    <section className={`${card} p-5`}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-ink">Gallery</h2>
        {section.data && section.data.length > 0 && (
          <button type="button" onClick={onSeeAll} className={linkBtn}>
            See all
          </button>
        )}
      </div>
      <div className="mt-3">
        {sectionFallback(section, 'photos') ?? (
          <Gallery photos={section.data!} limit={SIDEBAR_GALLERY} />
        )}
      </div>
    </section>
  );
}

// --- page ---------------------------------------------------------------------

function GroupView({ group }: { group: GroupDetail }) {
  const [tab, setTab] = useState<Tab>('events');
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const openLogin = useCallback(() => setAuthMode('login'), []);
  const openSignup = useCallback(() => setAuthMode('signup'), []);
  const closeLogin = useCallback(() => setAuthMode(null), []);
  const [membersOpen, setMembersOpen] = useState(false);
  const openMembers = useCallback(() => setMembersOpen(true), []);
  const closeMembers = useCallback(() => setMembersOpen(false), []);
  // Members / events / photos need an account — skip them when logged out.
  const signedIn = useSignedIn();
  const listId = signedIn ? group._id : undefined;
  // `GET /groups/:id` already tells us what would 403: a private group's
  // members / events need approved membership, photos need it for any group.
  const isMember = group.memberStatus === 'approved';
  const contentsVisible = !group.isPrivate || isMember;
  const contentsId = contentsVisible ? listId : undefined;
  const rawMembers = useGroupMembers(contentsId);
  const members: Section<GroupMember[]> = contentsVisible
    ? { ...rawMembers, data: rawMembers.data && [...rawMembers.data].sort(byRole) }
    : restrictedSection();
  const rawUpcoming = useGroupEvents(contentsId);
  const rawPlayed = useGroupEvents(contentsId, {
    status: 'done',
    includeExpired: true,
  });
  const upcoming: Section<EventSummary[]> = contentsVisible ? rawUpcoming : restrictedSection();
  const played: Section<EventSummary[]> = contentsVisible ? rawPlayed : restrictedSection();
  const rawPhotos = useGroupPhotos(isMember ? listId : undefined);
  const photos: Section<GroupPhoto[]> = isMember ? rawPhotos : restrictedSection();
  // A stored token the backend no longer accepts counts as logged out.
  const locked = !signedIn || isUnauthorized(upcoming.error) || isUnauthorized(rawMembers.error);

  let main: ReactNode;
  if (locked)
    main = <LockedCard group={group} tab={tab} onLogin={openLogin} onSignup={openSignup} />;
  else
    switch (tab) {
      case 'events':
        main = (
          <>
            <EventList title="Upcoming events" section={upcoming} empty="Nothing scheduled yet." />
            <RecentMatches section={played} />
          </>
        );
        break;
      case 'members':
        main = <MemberList section={members} />;
        break;
      case 'gallery':
        main = (
          <section className={`${card} p-5`}>
            <SectionHeader title="Gallery" />
            <div className="mt-4">
              {sectionFallback(photos, 'photos') ?? <Gallery photos={photos.data!} />}
            </div>
          </section>
        );
        break;
    }

  return (
    <>
      <Breadcrumb className="text-sm" items={['Groups', group.name]} />
      <div className="mt-5">
        <GroupHeader group={group} signedIn={signedIn && !locked} onLogin={openLogin} />
      </div>
      {!locked && (
        <Stats
          items={[
            { label: 'Members', value: count(members), onClick: openMembers },
            { label: 'Upcoming events', value: count(upcoming) },
            { label: 'Matches played', value: count(played) },
            { label: 'Photos', value: count(photos) },
          ]}
        />
      )}
      <Tabs
        tab={tab}
        onChange={setTab}
        counts={
          locked
            ? {}
            : {
                events: upcoming.data?.length,
                members: members.data?.length,
                gallery: photos.data?.length,
              }
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div role="tabpanel" className="flex min-w-0 flex-col gap-5">
          {main}
        </div>
        <aside className="flex flex-col gap-5 lg:self-start">
          <AboutCard group={group} />
          {!locked && (
            <>
              <MembersCard section={members} onSeeAll={() => setTab('members')} />
              <GalleryCard section={photos} onSeeAll={() => setTab('gallery')} />
            </>
          )}
        </aside>
      </div>

      <MembersModal open={membersOpen} onClose={closeMembers} group={group} section={members} />
      <LoginModal
        open={authMode !== null}
        onClose={closeLogin}
        initialMode={authMode ?? 'login'}
        title={`Log in to join ${group.name}`}
        subtitle={
          group.isPrivate
            ? "You'll be able to send a join request once you're logged in."
            : "You'll be able to join and see members, events and photos once you're logged in."
        }
        summary={{
          thumb: group.logo ? <img src={group.logo} alt="" /> : <PitchCover />,
          title: group.name,
          meta: [formatPlace(group), group.sportType && capitalize(group.sportType)]
            .filter(Boolean)
            .join(' · '),
          highlight: group.isPrivate ? undefined : 'Open to join',
        }}
      />
    </>
  );
}

/**
 * Group detail (`/group/:groupId`) — the landing spot for shared group links.
 * Data: `GET /groups/:id`, plus `/groups/:id/members`, `/groups/:id/photos`
 * and `/events/group/:groupId`. The detail is public; the last three need a
 * login — logged-out visitors get a "members only" card in every tab — and
 * 403 for non-members of a private group (photos: for any non-member), each
 * section degrading to a note. Actions hand off to the app.
 */
export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: group, isPending, error } = useGroup(groupId);

  let content: ReactNode;
  if (isPending) content = <DetailSkeleton />;
  else if (error) content = <DetailError error={error} noun="group" />;
  else content = <GroupView group={group} />;

  return <DetailPageShell>{content}</DetailPageShell>;
}
