import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { gradientBtn } from './DetailUI';
import Modal, { modalInput as input } from './Modal';
import { isApiError } from '@/lib/api/errors';
import { capitalize } from '@/lib/format';
import { useConfiguration } from '@/services/configuration';
import { useFootballTeams } from '@/services/footballTeams';
import {
  FOOTBALL_POSITIONS,
  PROFILE_VISIBILITY,
  useUpdateProfile,
  type FootballPosition,
  type ProfileVisibility,
  type UpdateProfileInput,
  type User,
} from '@/services/profile';

/** Backend `UpdateProfileDto` limits. */
const NAME_MIN = 2;
const USERNAME_MIN = 3;

const label = 'mb-1.5 block text-sm font-semibold text-ink';

interface FormState {
  name: string;
  username: string;
  displayName: string;
  phoneNumber: string;
  height: string;
  weight: string;
  dateOfBirth: string;
  country: string;
  city: string;
  biography: string;
  sports: string[];
  preferredSport: string[];
  footballPosition: FootballPosition[];
  favouriteTeamId: string;
  profileVisibility: ProfileVisibility;
  showStats: boolean;
  showMatchHistory: boolean;
}

function toForm(user: User): FormState {
  return {
    name: user.name,
    username: user.username ?? '',
    displayName: user.displayName ?? '',
    phoneNumber: user.phoneNumber ?? '',
    height: user.height?.toString() ?? '',
    weight: user.weight?.toString() ?? '',
    // Stored as an ISO timestamp; the date input wants YYYY-MM-DD.
    dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
    country: user.country ?? '',
    city: user.city ?? '',
    biography: user.biography ?? '',
    sports: user.sports ?? [],
    preferredSport: user.preferredSport ?? [],
    footballPosition: user.footballPosition ?? [],
    favouriteTeamId: user.favouriteTeamId ?? '',
    profileVisibility: user.privacy?.profileVisibility ?? 'public',
    showStats: user.privacy?.showStats ?? true,
    showMatchHistory: user.privacy?.showMatchHistory ?? true,
  };
}

const sameList = (a: string[], b: string[]) => [...a].sort().join() === [...b].sort().join();

/** Only the fields that changed — `PATCH /users/me` leaves the rest alone. */
function toPatch(form: FormState, initial: FormState): UpdateProfileInput {
  const patch: UpdateProfileInput = {};
  const text = [
    'name',
    'username',
    'displayName',
    'phoneNumber',
    'country',
    'city',
    'biography',
  ] as const;
  for (const key of text) {
    const value = form[key].trim();
    if (value !== initial[key]) patch[key] = value;
  }
  // An empty date fails `IsDateString`, so it can be changed but not cleared.
  if (form.dateOfBirth && form.dateOfBirth !== initial.dateOfBirth) {
    patch.dateOfBirth = form.dateOfBirth;
  }
  for (const key of ['height', 'weight'] as const) {
    if (form[key] !== '' && form[key] !== initial[key]) patch[key] = Number(form[key]);
  }
  for (const key of ['sports', 'preferredSport'] as const) {
    if (!sameList(form[key], initial[key])) patch[key] = form[key];
  }
  if (!sameList(form.footballPosition, initial.footballPosition)) {
    patch.footballPosition = form.footballPosition;
  }
  if (form.favouriteTeamId !== initial.favouriteTeamId) {
    patch.favouriteTeamId = form.favouriteTeamId || null;
  }
  if (
    form.profileVisibility !== initial.profileVisibility ||
    form.showStats !== initial.showStats ||
    form.showMatchHistory !== initial.showMatchHistory
  ) {
    patch.privacy = {
      profileVisibility: form.profileVisibility,
      showStats: form.showStats,
      showMatchHistory: form.showMatchHistory,
    };
  }
  return patch;
}

/** "south-korea" → "South korea" — `/configuration` only ships country ids. */
const placeLabel = (id: string) => capitalize(id.replace(/[-_]/g, ' '));

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Multi-select as a row of toggle chips. */
function Chips<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label: text }) => {
        const on = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(toggle(selected, value))}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              on
                ? 'bg-pitch-600 text-white'
                : 'bg-white text-ink-2 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

function Field({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <div>
      {id ? (
        <label htmlFor={id} className={label}>
          {title}
        </label>
      ) : (
        <p className={label}>{title}</p>
      )}
      {children}
    </div>
  );
}

/** Edits the signed-in user's own profile via `PATCH /users/me`. */
export default function EditProfileModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
}) {
  const [initial, setInitial] = useState(() => toForm(user));
  const [form, setForm] = useState(initial);
  const update = useUpdateProfile();
  const config = useConfiguration();
  const teams = useFootballTeams(open);
  const ids = useId();

  // Start from the latest profile each time it opens.
  useEffect(() => {
    if (open) {
      const fresh = toForm(user);
      setInitial(fresh);
      setForm(fresh);
      update.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const patch = toPatch(form, initial);
    if (Object.keys(patch).length === 0) return onClose();
    update.mutate(patch, { onSuccess: onClose });
  }

  const regions = config.data?.regions ?? {};
  // Keep the stored value selectable even if it's no longer in the list.
  const countryIds = Object.keys(regions);
  if (form.country && !countryIds.includes(form.country)) countryIds.push(form.country);
  const cities = [...(regions[form.country] ?? [])];
  if (form.city && !cities.some((c) => c.id === form.city)) {
    cities.push({ id: form.city, name: placeLabel(form.city) });
  }
  const sportOptions = (config.data?.sportTypes ?? []).map((s) => ({
    value: s.value,
    label: s.name || capitalize(s.value),
  }));

  const errorMessage = update.error
    ? isApiError(update.error)
      ? update.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <Modal open={open} onClose={onClose} title="Edit profile" wide>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${ids}-name`} title="Name">
            <input
              id={`${ids}-name`}
              required
              minLength={NAME_MIN}
              autoComplete="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={input}
            />
          </Field>
          <Field id={`${ids}-display`} title="Display name">
            <input
              id={`${ids}-display`}
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              className={input}
            />
          </Field>
          <Field id={`${ids}-username`} title="Username">
            <input
              id={`${ids}-username`}
              minLength={USERNAME_MIN}
              autoComplete="username"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              placeholder="johndoe"
              className={input}
            />
          </Field>
          <Field id={`${ids}-phone`} title="Phone number">
            <input
              id={`${ids}-phone`}
              type="tel"
              autoComplete="tel"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              placeholder="+66812345678"
              className={input}
            />
          </Field>
          <Field id={`${ids}-height`} title="Height (cm)">
            <input
              id={`${ids}-height`}
              type="number"
              min={0}
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              className={input}
            />
          </Field>
          <Field id={`${ids}-weight`} title="Weight (kg)">
            <input
              id={`${ids}-weight`}
              type="number"
              min={0}
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              className={input}
            />
          </Field>
          <Field id={`${ids}-dob`} title="Date of birth">
            <input
              id={`${ids}-dob`}
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className={input}
            />
          </Field>
          <Field id={`${ids}-team`} title="Favourite club">
            <select
              id={`${ids}-team`}
              value={form.favouriteTeamId}
              onChange={(e) => set('favouriteTeamId', e.target.value)}
              className={input}
            >
              <option value="">None</option>
              {teams.data?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
              {/* Until the list loads, keep the current pick visible. */}
              {user.favouriteTeam && !teams.data && (
                <option value={user.favouriteTeam._id}>{user.favouriteTeam.name}</option>
              )}
            </select>
          </Field>
          <Field id={`${ids}-country`} title="Country">
            <select
              id={`${ids}-country`}
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, city: '' }))}
              className={input}
            >
              <option value="">Select a country</option>
              {countryIds.map((id) => (
                <option key={id} value={id}>
                  {placeLabel(id)}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${ids}-city`} title="City">
            <select
              id={`${ids}-city`}
              value={form.city}
              disabled={!form.country}
              onChange={(e) => set('city', e.target.value)}
              className={`${input} disabled:bg-slate-50 disabled:text-slate-400`}
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field id={`${ids}-bio`} title="Bio">
          <textarea
            id={`${ids}-bio`}
            rows={3}
            value={form.biography}
            onChange={(e) => set('biography', e.target.value)}
            placeholder="Tell other players about yourself"
            className={`${input} resize-y`}
          />
        </Field>

        <Field title="Sports you play">
          <Chips
            options={sportOptions}
            selected={form.sports}
            onChange={(next) => set('sports', next)}
          />
        </Field>
        <Field title="Preferred sports">
          <Chips
            options={sportOptions}
            selected={form.preferredSport}
            onChange={(next) => set('preferredSport', next)}
          />
        </Field>
        <Field title="Football positions">
          <Chips
            options={FOOTBALL_POSITIONS.map((p) => ({ value: p, label: capitalize(p) }))}
            selected={form.footballPosition}
            onChange={(next) => set('footballPosition', next)}
          />
        </Field>

        <fieldset className="space-y-3 rounded-2xl bg-pitch-50/60 p-4 ring-1 ring-pitch-100">
          <legend className="sr-only">Privacy</legend>
          <Field id={`${ids}-visibility`} title="Who can see your profile">
            <select
              id={`${ids}-visibility`}
              value={form.profileVisibility}
              onChange={(e) => set('profileVisibility', e.target.value as ProfileVisibility)}
              className={`${input} bg-white`}
            >
              {PROFILE_VISIBILITY.map((v) => (
                <option key={v} value={v}>
                  {capitalize(v)}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.showStats}
              onChange={(e) => set('showStats', e.target.checked)}
              className="size-4 accent-pitch-600"
            />
            Show my stats
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.showMatchHistory}
              onChange={(e) => set('showMatchHistory', e.target.checked)}
              className="size-4 accent-pitch-600"
            />
            Show my match history
          </label>
        </fieldset>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-white py-3.5 text-base font-semibold text-ink ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className={`flex-1 rounded-2xl py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 ${gradientBtn}`}
          >
            {update.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
