import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { IconPhone, IconX } from '@/components/ui/icons';
import { inputClass } from '@/components/ui/ListPage';
import {
  useAppConfigHistory,
  useAppConfigRevision,
  useCreateAppConfig,
  useUpdateAppConfig,
} from '@/services/appConfig/hooks';
import type {
  AppConfigInput,
  AppConfigRevision,
  Platform,
  UpdateAppConfigInput,
} from '@/services/appConfig/types';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
];

const HISTORY_PAGE = 20;

/** Same rule as the backend DTO: '1.0.1', '2.3', '10.0.0.4'. */
const APP_VERSION = /^\d+(\.\d+){0,3}$/;

/** Numeric, part by part: '1.10.0' > '1.9.2', and '1.0' equals '1.0.0'. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}

/** Starting values when no config has been saved yet. */
const EMPTY_CONFIG: AppConfigInput = (() => {
  const appUpdate = {
    latestVersion: '1.0.0',
    minimumVersion: '1.0.0',
    upgradeTitle: 'A new version is available',
    upgradeDescription: 'Please update the app to enjoy the latest features and improvements.',
    forceUpdate: false,
  };
  const majorUpdate = {
    enabled: false,
    title: 'Major Update Available',
    description:
      "We've made major improvements to the app. Please update to the latest version.",
    version: '1.0.0',
  };
  return {
    appUpdate: { ios: { ...appUpdate }, android: { ...appUpdate } },
    majorUpdate: { ios: { ...majorUpdate }, android: { ...majorUpdate } },
  };
})();

/** Only the config fields of a revision — drops revision/updatedBy/createdAt. */
const toInput = ({ appUpdate, majorUpdate }: AppConfigInput): AppConfigInput => ({
  appUpdate,
  majorUpdate,
});

/** The fields of `draft` that differ from `base`, shaped as a PATCH body. */
function diffConfig(base: AppConfigInput, draft: AppConfigInput): UpdateAppConfigInput {
  const out: UpdateAppConfigInput = {};
  for (const section of ['appUpdate', 'majorUpdate'] as const) {
    for (const { id: p } of PLATFORMS) {
      const before = base[section][p] as unknown as Record<string, unknown>;
      const after = draft[section][p] as unknown as Record<string, unknown>;
      const changed = Object.fromEntries(
        Object.entries(after).filter(([k, v]) => before[k] !== v),
      );
      if (Object.keys(changed).length) {
        out[section] = { ...out[section], [p]: changed };
      }
    }
  }
  return out;
}

/** Client-side copy of the backend's validation, so errors show before saving. */
function validate(config: AppConfigInput): string | null {
  for (const { id: p, label } of PLATFORMS) {
    const a = config.appUpdate[p];
    const m = config.majorUpdate[p];
    for (const [name, v] of [
      ['Latest version', a.latestVersion],
      ['Minimum version', a.minimumVersion],
      ['Major update version', m.version],
    ] as const) {
      if (!APP_VERSION.test(v.trim())) {
        return `${label}: ${name} must be a dotted version like 1.0.1`;
      }
    }
    if (compareVersions(a.minimumVersion, a.latestVersion) > 0) {
      return `${label}: Minimum version (${a.minimumVersion}) cannot be above latest version (${a.latestVersion})`;
    }
    for (const [name, v] of [
      ['Upgrade title', a.upgradeTitle],
      ['Upgrade description', a.upgradeDescription],
      ['Major update title', m.title],
      ['Major update description', m.description],
    ] as const) {
      if (!v.trim()) return `${label}: ${name} is required`;
    }
  }
  return null;
}

/** Trims every string field before it's sent. */
function trimConfig(config: AppConfigInput): AppConfigInput {
  const trim = <T extends object>(o: T): T =>
    Object.fromEntries(
      Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ) as T;
  return {
    appUpdate: { ios: trim(config.appUpdate.ios), android: trim(config.appUpdate.android) },
    majorUpdate: {
      ios: trim(config.majorUpdate.ios),
      android: trim(config.majorUpdate.android),
    },
  };
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AppConfigPage() {
  const [limit, setLimit] = useState(HISTORY_PAGE);
  const { data: history, isPending, error, isFetching } = useAppConfigHistory(limit);
  const live = history?.[0];

  /** A past revision loaded into the form; `n` remounts the form each load. */
  const [seed, setSeed] = useState<{ config: AppConfigInput; from: number; n: number } | null>(
    null,
  );
  const [viewing, setViewing] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(
    null,
  );

  const create = useCreateAppConfig();
  const update = useUpdateAppConfig();
  const saving = create.isPending || update.isPending;

  const handleSave = (draft: AppConfigInput) => {
    const opts = {
      onSuccess: (row: AppConfigRevision) => {
        setSeed(null);
        setNotice({ kind: 'success', text: `Saved as revision ${row.revision}` });
      },
      onError: (err: Error) => setNotice({ kind: 'error', text: err.message }),
    };
    if (!live) {
      create.mutate(draft, opts);
      return;
    }
    const patch = diffConfig(toInput(live), draft);
    if (!patch.appUpdate && !patch.majorUpdate) {
      setNotice({ kind: 'error', text: 'Nothing changed' });
      return;
    }
    update.mutate(patch, opts);
  };

  const hasMore = (history?.length ?? 0) >= limit;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-ink">App Config</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update prompts the mobile apps read at startup. Every save becomes a new
            revision.
          </p>
        </div>
        {live && (
          <span className="rounded-full bg-pitch-50 px-3 py-1 text-xs font-medium text-pitch-700">
            Live: revision {live.revision} · {formatDateTime(live.createdAt)}
          </span>
        )}
      </div>

      {notice && (
        <div
          className={[
            'mt-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
            notice.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          ].join(' ')}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded p-0.5 hover:bg-black/5"
            aria-label="Dismiss"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {isPending ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500">
              Loading…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
              {error.message}
            </div>
          ) : (
            <>
              {seed && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <span>
                    Editing a copy of revision {seed.from}. Saving makes it a new revision.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeed(null)}
                    className="font-medium underline hover:no-underline"
                  >
                    Back to live
                  </button>
                </div>
              )}
              {!live && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  No app config has been saved yet. Fill in the form and save to create
                  revision 1.
                </div>
              )}
              <AppConfigForm
                key={`${live?.revision ?? 'new'}-${seed?.n ?? 0}`}
                initial={seed?.config ?? (live ? toInput(live) : EMPTY_CONFIG)}
                base={live ? toInput(live) : null}
                saving={saving}
                onSave={(draft) => {
                  const invalid = validate(draft);
                  if (invalid) setNotice({ kind: 'error', text: invalid });
                  else handleSave(trimConfig(draft));
                }}
              />
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">History</h2>
          </div>
          {history && history.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No revisions yet</p>
          )}
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {history?.map((row, i) => (
              <li key={row.revision}>
                <button
                  type="button"
                  onClick={() => setViewing(row.revision)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">
                      Revision {row.revision}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateTime(row.createdAt)}
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Live
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                disabled={isFetching}
                onClick={() => setLimit((l) => Math.min(l + HISTORY_PAGE, 100))}
                className="w-full rounded-xl px-3 py-2 text-sm font-medium text-pitch-700 hover:bg-pitch-50 disabled:opacity-50"
              >
                {isFetching ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </aside>
      </div>

      {viewing !== null && (
        <RevisionModal
          revision={viewing}
          isLive={viewing === live?.revision}
          onClose={() => setViewing(null)}
          onLoad={(row) => {
            setSeed((s) => ({ config: toInput(row), from: row.revision, n: (s?.n ?? 0) + 1 }));
            setViewing(null);
            setNotice(null);
          }}
        />
      )}
    </div>
  );
}

function AppConfigForm({
  initial,
  base,
  saving,
  onSave,
}: {
  initial: AppConfigInput;
  /** The live config, to tell whether anything changed; null before the first save. */
  base: AppConfigInput | null;
  saving: boolean;
  onSave: (draft: AppConfigInput) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [platform, setPlatform] = useState<Platform>('ios');
  const dirty = !base || JSON.stringify(diffConfig(base, draft)) !== '{}';

  const app = draft.appUpdate[platform];
  const major = draft.majorUpdate[platform];
  const setApp = (patch: Partial<typeof app>) =>
    setDraft((d) => ({
      ...d,
      appUpdate: { ...d.appUpdate, [platform]: { ...d.appUpdate[platform], ...patch } },
    }));
  const setMajor = (patch: Partial<typeof major>) =>
    setDraft((d) => ({
      ...d,
      majorUpdate: { ...d.majorUpdate, [platform]: { ...d.majorUpdate[platform], ...patch } },
    }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {PLATFORMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPlatform(id)}
            className={[
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              platform === id
                ? 'bg-pitch-600 text-white shadow-sm shadow-pitch-600/30'
                : 'text-slate-600 hover:text-pitch-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <Section
        title="App Update"
        description="The “a newer version is available” prompt."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latest version" hint="e.g. 1.0.1">
            <input
              required
              value={app.latestVersion}
              onChange={(e) => setApp({ latestVersion: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Minimum version" hint="Builds below this must update">
            <input
              required
              value={app.minimumVersion}
              onChange={(e) => setApp({ minimumVersion: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Title">
          <input
            required
            maxLength={200}
            value={app.upgradeTitle}
            onChange={(e) => setApp({ upgradeTitle: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            rows={3}
            maxLength={2000}
            value={app.upgradeDescription}
            onChange={(e) => setApp({ upgradeDescription: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Toggle
          label="Force update"
          description="Users can't dismiss the prompt."
          checked={app.forceUpdate}
          onChange={(forceUpdate) => setApp({ forceUpdate })}
        />
      </Section>

      <Section title="Major Update" description="The “major update” announcement.">
        <Toggle
          label="Enabled"
          description="Show the announcement in the app."
          checked={major.enabled}
          onChange={(enabled) => setMajor({ enabled })}
        />
        <Field label="Version" hint="e.g. 2.0.0">
          <input
            required
            value={major.version}
            onChange={(e) => setMajor({ version: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Title">
          <input
            required
            maxLength={200}
            value={major.title}
            onChange={(e) => setMajor({ title: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            rows={3}
            maxLength={2000}
            value={major.description}
            onChange={(e) => setMajor({ description: e.target.value })}
            className={inputClass}
          />
        </Field>
      </Section>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={saving || JSON.stringify(draft) === JSON.stringify(initial)}
          onClick={() => setDraft(initial)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={saving || !dirty}
          className="rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

/** Read-only view of one revision, with a button to copy it into the form. */
function RevisionModal({
  revision,
  isLive,
  onClose,
  onLoad,
}: {
  revision: number;
  isLive: boolean;
  onClose: () => void;
  onLoad: (row: AppConfigRevision) => void;
}) {
  const { data, isPending, error } = useAppConfigRevision(revision);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Revision {revision}</h2>
            {data && (
              <p className="text-xs text-slate-500">
                Saved {formatDateTime(data.createdAt)}
                {data.updatedBy && <> · by {data.updatedBy}</>}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 overflow-y-auto">
          {isPending ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-600">{error.message}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {PLATFORMS.map(({ id, label }) => {
                const a = data.appUpdate[id];
                const m = data.majorUpdate[id];
                return (
                  <div key={id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <IconPhone className="h-4 w-4 text-pitch-500" />
                      {label}
                    </div>
                    <dl className="mt-3 space-y-2 text-sm">
                      <Row label="Latest version" value={a.latestVersion} />
                      <Row label="Minimum version" value={a.minimumVersion} />
                      <Row label="Force update" value={a.forceUpdate ? 'Yes' : 'No'} />
                      <Row label="Upgrade title" value={a.upgradeTitle} />
                      <Row label="Upgrade description" value={a.upgradeDescription} />
                      <div className="border-t border-slate-100 pt-2" />
                      <Row label="Major update" value={m.enabled ? 'Enabled' : 'Disabled'} />
                      <Row label="Version" value={m.version} />
                      <Row label="Title" value={m.title} />
                      <Row label="Description" value={m.description} />
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          {data && !isLive && (
            <button
              type="button"
              onClick={() => onLoad(data)}
              className="rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700"
            >
              Load into form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-slate-600">{label}</span>
        <span className="block text-xs text-slate-400">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-pitch-600 peer-focus-visible:ring-2 peer-focus-visible:ring-pitch-500/30" />
        <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="break-words text-ink">{value}</dd>
    </div>
  );
}
