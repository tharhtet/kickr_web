import { useCallback, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AccentTitle,
  Avatar,
  Breadcrumb,
  DetailError,
  DetailPageShell,
  DetailSkeleton,
  IconBadge,
  PitchCover,
  SectionHeader,
  card,
  gradientBtn,
  outlineBtn,
  type Icon,
} from '@/components/website/DetailUI';
import GuestJoinModal from '@/components/website/GuestJoinModal';
import LoginModal from '@/components/website/LoginModal';
import type { ModalSummary } from '@/components/website/Modal';
import { APP_STORE_URL } from '@/components/website/StoreButtons';
import {
  IconArrowRight,
  IconCalendar,
  IconCalendarCheck,
  IconCheckCircle,
  IconHeart,
  IconLogin,
  IconMapPin,
  IconMessage,
  IconShare,
  IconTag,
  IconTarget,
  IconWrench,
} from '@/components/ui/icons';
import { isApiError } from '@/lib/api/errors';
import { capitalize, formatDate, formatPrice, formatTime } from '@/lib/format';
import { useShare } from '@/lib/useShare';
import { useSignedIn } from '@/services/auth/hooks';
import {
  useEvent,
  useEventPlayers,
  useJoinEvent,
  type EventDetail,
  type EventPlayer,
  type EventStatus,
} from '@/services/events';

/** The backend stores a bare `price` with no currency; events are priced in baht. */
const PRICE_CURRENCY = 'THB';

/** Lifecycle steps drawn in the timeline. `after_match` folds into `done`. */
type Step = 'join' | 'preparation' | 'ready_to_play' | 'playing' | 'done';

const STEPS: Record<Step, { label: string; hint: string; icon: Icon }> = {
  join: { label: 'Joined', hint: 'Players sign up', icon: IconLogin },
  preparation: {
    label: 'Preparation',
    hint: 'Teams & payment',
    icon: IconWrench,
  },
  ready_to_play: {
    label: 'Ready',
    hint: 'Line-ups set',
    icon: IconCalendarCheck,
  },
  playing: { label: 'Playing', hint: 'Live score', icon: IconTarget },
  done: { label: 'Done', hint: 'Results & awards', icon: IconCheckCircle },
};

const STATUS_LABEL: Record<EventStatus, string> = {
  join: 'Open for joining',
  preparation: 'Preparation',
  ready_to_play: 'Ready to play',
  playing: 'Playing',
  after_match: 'Results',
  done: 'Finished',
  cancelled: 'Cancelled',
};

const STATUS_SUMMARY: Record<EventStatus, string> = {
  join: 'Players signing up',
  preparation: 'Teams & payment',
  ready_to_play: 'Line-ups set',
  playing: 'Match in progress',
  after_match: 'Entering results',
  done: 'Finished',
  cancelled: 'Cancelled',
};

/** Football has a preparation stage; every other sport skips it. */
function stepsFor(sportType: string): Step[] {
  return sportType === 'football'
    ? ['join', 'preparation', 'ready_to_play', 'playing', 'done']
    : ['join', 'ready_to_play', 'playing', 'done'];
}

const pill = 'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold';
const sectionTitle = 'text-xl sm:text-2xl';
const railBadge = 'size-11';

/** "Thursday" */
function weekday(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long' });
}

/** Members shown before collapsing the rest into a "+N more" tile. */
const MEMBER_PREVIEW = 7;

/** Google Calendar "add event" link spanning the event's duration. */
function calendarUrl(event: EventDetail) {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + (event.duration || 90) * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${event.description ?? ''}\n\n${window.location.href}`.trim(),
    location: event.location
      ? [event.location.name, event.location.address, event.location.city]
          .filter(Boolean)
          .join(', ')
      : '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function mapUrl(location: NonNullable<EventDetail['location']>) {
  if (location.url) return location.url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.lat},${location.lng}`,
  )}`;
}

function playerName(p: EventPlayer) {
  return p.userId?.name ?? p.guestName ?? 'Player';
}

// --- pieces -------------------------------------------------------------------

function Timeline({ event }: { event: EventDetail }) {
  if (event.status === 'cancelled') {
    return (
      <section className={`${card} p-5 sm:p-7`}>
        <SectionHeader title="Timeline" className={sectionTitle} />
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          This event was cancelled
          {event.cancelReason ? ` — ${event.cancelReason}` : '.'}
        </p>
      </section>
    );
  }

  const steps = stepsFor(event.sportType);
  const current = steps.indexOf(event.status === 'after_match' ? 'done' : (event.status as Step));
  return (
    <section className={`${card} p-5 sm:p-7`}>
      <SectionHeader
        title="Timeline"
        className={sectionTitle}
        aside={
          <p className="text-sm font-medium text-cream-dim">
            Step {current + 1} of {steps.length} · {STATUS_SUMMARY[event.status]}
          </p>
        }
      />

      <ol
        className="mt-6 grid"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((step, i) => {
          const { label, hint, icon: StepIcon } = STEPS[step];
          const active = i === current;
          const reached = i <= current;
          return (
            <li key={step} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-6 w-full border-t border-dashed sm:top-7 ${
                    reached ? 'border-pitch-400' : 'border-slate-300'
                  }`}
                />
              )}
              <span
                className={`relative z-[1] grid size-12 place-items-center rounded-full sm:size-14 ${
                  active
                    ? 'bg-pitch-600 text-white ring-[5px] ring-pitch-100'
                    : reached
                      ? 'bg-pitch-100 text-pitch-600'
                      : 'bg-white text-slate-400 ring-1 ring-slate-300'
                }`}
              >
                <StepIcon className="size-5" />
              </span>
              <span
                className={`mt-3 text-xs font-semibold sm:text-[0.95rem] ${
                  reached ? 'text-pitch-600' : 'text-ink-2'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {label}
              </span>
              <span className="mt-0.5 hidden text-[0.8rem] text-cream-dim sm:block">{hint}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MemberTile({ player, index }: { player: EventPlayer; index: number }) {
  const guest = player.type === 'guest';
  return (
    <li className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5">
      <Avatar
        name={playerName(player)}
        src={player.userId?.profileImage}
        index={index}
        className="size-10 text-sm"
      />
      <span className="min-w-0">
        <span className="block truncate text-[0.95rem] font-semibold text-ink">
          {playerName(player)}
        </span>
        <span className="block truncate text-xs text-cream-dim">
          {guest
            ? `Guest${player.addedByUserId ? ` of ${player.addedByUserId.name}` : ''}`
            : player.position
              ? capitalize(player.position)
              : 'Member'}
        </span>
      </span>
    </li>
  );
}

function Members({ event, onLogin }: { event: EventDetail; onLogin: () => void }) {
  const { data: players, isPending, error } = useEventPlayers(event._id);
  const [expanded, setExpanded] = useState(false);
  const shown = (expanded ? players : players?.slice(0, MEMBER_PREVIEW)) ?? [];
  const more = (players?.length ?? 0) - shown.length;

  let body: ReactNode;
  if (isPending) {
    body = (
      <ul className="mt-4 grid animate-pulse grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="h-[60px] rounded-xl bg-slate-100" />
        ))}
      </ul>
    );
  } else if (isApiError(error) && error.status === 401) {
    body = (
      <p className="mt-4 text-sm text-cream-dim">
        <button
          type="button"
          onClick={onLogin}
          className="font-semibold text-pitch-600 hover:underline"
        >
          Log in
        </button>{' '}
        to see who's playing.
      </p>
    );
  } else if (error) {
    body = <p className="mt-4 text-sm text-cream-dim">Couldn't load the player list.</p>;
  } else if (shown.length === 0) {
    body = <p className="mt-4 text-sm text-cream-dim">No one has joined yet — be the first.</p>;
  } else {
    body = (
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {shown.map((p, i) => (
          <MemberTile key={p._id} player={p} index={i} />
        ))}
        {more > 0 && (
          <li className="grid">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-xl bg-pitch-50 px-3 py-2.5 text-[0.95rem] font-bold text-pitch-600 transition hover:bg-pitch-100"
            >
              +{more} more
            </button>
          </li>
        )}
      </ul>
    );
  }

  return (
    <section className={`${card} p-5 sm:p-7`}>
      <SectionHeader
        title="Members"
        className={sectionTitle}
        aside={
          <p className="flex items-baseline gap-4 text-sm font-medium text-cream-dim">
            {event.joinedCount} / {event.maxPlayers} joined
            {(players?.length ?? 0) > MEMBER_PREVIEW && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="font-semibold text-pitch-600 hover:underline"
              >
                {expanded ? 'Show less' : 'See all'}
              </button>
            )}
          </p>
        }
      />
      {body}
    </section>
  );
}

function joinBlockedReason(event: EventDetail): string | null {
  if (event.status === 'cancelled') return 'Event cancelled';
  if (event.status !== 'join') return 'Joining closed';
  if (event.isFull) return 'Event full';
  // A challenge roster is assigned by the two groups' admins.
  if (event.type === 'challenge') return 'Roster set by the groups';
  return null;
}

function spotsLeftOf(event: EventDetail) {
  return Math.max(event.maxPlayers - event.joinedCount, 0);
}

function BookingCard({
  event,
  guestJoined,
  onGuestJoin,
}: {
  event: EventDetail;
  /** Joined as a guest from this page — the backend can't tell us via `joinedByMe`. */
  guestJoined: boolean;
  onGuestJoin: () => void;
}) {
  const signedIn = useSignedIn();
  const join = useJoinEvent(event._id);
  const spotsLeft = spotsLeftOf(event);
  const fill = event.maxPlayers > 0 ? Math.min(event.joinedCount / event.maxPlayers, 1) : 0;
  const blocked = joinBlockedReason(event);

  return (
    <section className={`${card} p-6`}>
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <IconBadge icon={IconCalendar} className={railBadge} />
        <div>
          <p className="text-[0.8rem] font-medium text-cream-dim">Date &amp; time</p>
          <p className="text-lg font-bold text-ink">{formatDate(event.date)}</p>
          <p className="text-sm text-cream-dim">
            {formatTime(event.date)}
            {event.duration ? ` · ${event.duration} min` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 border-b border-slate-100 py-5">
        <IconBadge icon={IconTag} className={railBadge} />
        <div>
          <p className="text-[0.8rem] font-medium text-cream-dim">Price</p>
          {event.price > 0 ? (
            <p className="text-ink">
              <span className="text-[1.65rem] font-bold leading-tight">
                {formatPrice(event.price, PRICE_CURRENCY)}
              </span>{' '}
              <span className="text-sm text-cream-dim">/ player</span>
            </p>
          ) : (
            <p className="text-[1.65rem] font-bold leading-tight text-ink">Free</p>
          )}
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-between text-sm font-semibold">
          <span className={spotsLeft > 0 ? 'text-emerald-700' : 'text-rose-600'}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event full'}
          </span>
          <span className="text-ink-2">
            {event.joinedCount} / {event.maxPlayers}
          </span>
        </div>
        <div
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-pitch-50"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={event.maxPlayers}
          aria-valuenow={event.joinedCount}
          aria-label="Spots filled"
        >
          <div className="h-full rounded-full bg-pitch-600" style={{ width: `${fill * 100}%` }} />
        </div>
      </div>

      {/* Signed-in users join via `/join`, guests via `/join-anonymous`; messaging happens in the app. */}
      {event.joinedByMe || guestJoined ? (
        <span className="mt-6 flex items-center justify-center rounded-xl bg-emerald-50 py-4 text-base font-bold text-emerald-700">
          You're in
        </span>
      ) : blocked ? (
        <span className="mt-6 flex items-center justify-center rounded-xl bg-slate-100 py-4 text-base font-bold text-slate-500">
          {blocked}
        </span>
      ) : signedIn ? (
        <>
          <button
            type="button"
            onClick={() => join.mutate()}
            disabled={join.isPending}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 ${gradientBtn}`}
          >
            {join.isPending ? 'Joining…' : 'Join event'} <IconArrowRight className="size-4" />
          </button>
          {join.error && (
            <p role="alert" className="mt-2 text-center text-sm text-red-600">
              {isApiError(join.error)
                ? join.error.message
                : "Couldn't join the event. Please try again."}
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={onGuestJoin}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold ${gradientBtn}`}
        >
          Join event <IconArrowRight className="size-4" />
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <a
          href={calendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[0.95rem] font-semibold ${outlineBtn}`}
        >
          <IconCalendar className="size-4" /> Calendar
        </a>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[0.95rem] font-semibold ${outlineBtn}`}
        >
          <IconMessage className="size-4" /> Message
        </a>
      </div>
    </section>
  );
}

function HostCard({ group }: { group: NonNullable<EventDetail['group']> }) {
  return (
    <section className={`${card} p-6`}>
      <p className="text-[0.8rem] font-medium text-cream-dim">Hosted by</p>
      <div className="mt-3 flex items-center gap-4">
        {group.logo ? (
          <img src={group.logo} alt="" className="size-[52px] flex-none rounded-xl object-cover" />
        ) : (
          <span className="grid size-[52px] flex-none place-items-center rounded-xl bg-slate-100 text-[0.68rem] font-bold uppercase tracking-wide text-ink-2">
            {group.name.split(/\s+/)[0]!.slice(0, 4)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">{group.name}</p>
          <Link
            to={`/group/${group._id}`}
            className="text-sm font-semibold text-pitch-600 hover:underline"
          >
            View detail ›
          </Link>
        </div>
      </div>
    </section>
  );
}

function LocationCard({ location }: { location: NonNullable<EventDetail['location']> }) {
  const subtitle = [location.address, location.city].filter(Boolean).join(', ');
  return (
    <section className={`${card} p-6`}>
      <div className="flex items-start gap-4">
        <IconBadge icon={IconMapPin} className={railBadge} />
        <div className="min-w-0">
          <p className="text-[0.8rem] font-medium text-cream-dim">Location</p>
          <p className="truncate text-base font-bold text-ink">{location.name}</p>
          {subtitle && <p className="truncate text-sm text-cream-dim">{subtitle}</p>}
        </div>
      </div>

      <a
        href={mapUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-4 block h-[170px] overflow-hidden rounded-xl bg-[#e8ede4]"
        aria-label={`View ${location.name} on Google Maps`}
      >
        <svg
          viewBox="0 0 260 170"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g stroke="#ffffff" strokeWidth="8" fill="none">
            <path d="M88 -10 L62 180" />
            <path d="M-10 92 L270 66" />
            <path d="M200 -10 L200 180" />
          </g>
          <g transform="translate(140 58)">
            <path
              d="M0 -16a12 12 0 0 1 12 12C12 6 0 18 0 18S-12 6-12-4A12 12 0 0 1 0-16Z"
              fill="#8e2de2"
            />
            <circle cy="-4" r="4" fill="#ffffff" />
          </g>
        </svg>
        <span className="absolute bottom-3 right-3 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-pitch-700 shadow-sm">
          View map ›
        </span>
      </a>
    </section>
  );
}

function CoverActions({ title }: { title: string }) {
  const { share, copied } = useShare(title);
  const chip =
    'flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-white sm:px-5 sm:py-2.5';

  return (
    <div className="absolute right-3 top-3 flex gap-2 sm:right-5 sm:top-5">
      <button type="button" onClick={share} className={chip}>
        <IconShare className="size-4" /> {copied ? 'Link copied' : 'Share'}
      </button>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className={chip}>
        <IconHeart className="size-4" /> Save
      </a>
    </div>
  );
}

function StatusPill({ status }: { status: EventStatus }) {
  const tone =
    status === 'join'
      ? { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' }
      : status === 'cancelled'
        ? { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' }
        : { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`${pill} ${tone.pill}`}>
      <span className={`size-2.5 rounded-full ${tone.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function EventView({ event }: { event: EventDetail }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const [guestJoinOpen, setGuestJoinOpen] = useState(false);
  const openGuestJoin = useCallback(() => setGuestJoinOpen(true), []);
  const closeGuestJoin = useCallback(() => setGuestJoinOpen(false), []);
  const [guestJoined, setGuestJoined] = useState(false);
  const markGuestJoined = useCallback(() => setGuestJoined(true), []);
  const switchToLogin = useCallback(() => {
    setGuestJoinOpen(false);
    setLoginOpen(true);
  }, []);
  const spotsLeft = spotsLeftOf(event);
  const summary: ModalSummary = {
    thumb: event.coverImage ? <img src={event.coverImage} alt="" /> : <PitchCover />,
    title: event.title,
    meta: [
      formatDate(event.date),
      formatTime(event.date),
      event.price > 0 ? formatPrice(event.price, PRICE_CURRENCY) : 'Free',
    ].join(' · '),
    highlight: spotsLeft > 0 ? `${spotsLeft} spots left` : undefined,
  };

  return (
    <>
      <Breadcrumb
        className="text-sm"
        items={[
          'Events',
          ...(event.location?.city ? [capitalize(event.location.city)] : []),
          event.title,
        ]}
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-x-10">
        <div>
          <div className="relative aspect-[958/529] overflow-hidden rounded-3xl bg-[#3a8a45]">
            {event.coverImage ? (
              <img src={event.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <PitchCover />
            )}
            <CoverActions title={event.title} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <StatusPill status={event.status} />
            {event.type === 'challenge' && (
              <span className={`${pill} bg-amber-50 text-amber-700`}>Challenge match</span>
            )}
            <span className={`${pill} bg-pitch-50 text-pitch-700`}>
              {capitalize(event.subType ?? event.sportType)}
            </span>
            <span className={`${pill} bg-slate-100 text-ink-2`}>
              {capitalize(event.skillLevel)} · {weekday(event.date)}
            </span>
          </div>

          <AccentTitle text={event.title} className="mt-4 text-[clamp(2.25rem,5vw,3rem)]" />
          {event.description && (
            <p className="mt-3 max-w-[64ch] whitespace-pre-line text-[1.05rem] leading-relaxed text-cream-dim">
              {event.description}
            </p>
          )}
        </div>

        {/* After the intro on mobile; right-hand rail spanning both rows on lg. */}
        <aside className="flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <BookingCard event={event} guestJoined={guestJoined} onGuestJoin={openGuestJoin} />
          {event.group && <HostCard group={event.group} />}
          {event.location && <LocationCard location={event.location} />}
        </aside>

        <div className="flex flex-col gap-6">
          <Timeline event={event} />
          <Members event={event} onLogin={openLogin} />
        </div>
      </div>

      <LoginModal
        open={loginOpen}
        onClose={closeLogin}
        title="Log in to save your spot"
        subtitle="You'll be able to join once you're logged in. Your spot isn't held until you join."
        summary={summary}
      />
      <GuestJoinModal
        open={guestJoinOpen}
        onClose={closeGuestJoin}
        eventId={event._id}
        summary={summary}
        onJoined={markGuestJoined}
        onLogin={switchToLogin}
      />
    </>
  );
}

/**
 * Event detail (`/event/:eventId`) — the landing spot for shared event links.
 * Data: `GET /events/:id` + `GET /events/:id/players`, both JWT-guarded, so a
 * logged-out visitor is prompted to log in. Actions hand off to the app.
 */
export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isPending, error } = useEvent(eventId);

  let content: ReactNode;
  if (isPending) content = <DetailSkeleton />;
  else if (error) content = <DetailError error={error} noun="event" />;
  else content = <EventView event={event} />;

  return <DetailPageShell>{content}</DetailPageShell>;
}
