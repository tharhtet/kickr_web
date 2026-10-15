import { useEffect, useState, type FormEvent } from 'react';
import { IconMapPin, IconPlus, IconX } from '@/components/ui/icons';
import ListPage, { inputClass } from '@/components/ui/ListPage';
import {
  useCountries,
  useCreateCountry,
  useDeleteCountry,
  useUpdateCountry,
} from '@/services/countries/hooks';
import type { Country } from '@/services/countries/types';

/** "Bago Region" → "bago-region" */
const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function CountriesPage() {
  const { data, isPending, error } = useCountries();
  const rows = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const [actionError, setActionError] = useState<string | null>(null);
  const onError = (err: Error) => setActionError(err.message);
  const onSuccess = () => setActionError(null);
  const opts = { onError, onSuccess };

  /** `null` = closed, `'new'` = adding, otherwise the country being edited. */
  const [modal, setModal] = useState<Country | 'new' | null>(null);
  const create = useCreateCountry();
  const update = useUpdateCountry();
  const remove = useDeleteCountry();

  return (
    <>
      {actionError && (
        <div className="mx-auto mb-4 flex max-w-7xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="rounded p-0.5 hover:bg-red-100"
            aria-label="Dismiss"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      <ListPage
        title="Countries"
        itemLabel="Country"
        icon={IconMapPin}
        emptyText="No countries yet"
        rows={rows}
        loading={isPending}
        error={error?.message}
        rowKey={(r) => r.id}
        columns={[
          {
            header: 'No',
            render: (_r, i) => i + 1,
            className: 'text-slate-400',
            width: 'w-16',
          },
          {
            header: 'Name (ID)',
            render: (r) => (
              <>
                <div>
                  {r.name} <span className="font-normal text-slate-400">({r.id})</span>
                </div>
                {r.regions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.regions.map((region) => (
                      <span
                        key={region.id}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {region.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ),
            className: 'font-medium text-ink',
          },
        ]}
        onAddClick={() => setModal('new')}
        onEditClick={(row) => setModal(row)}
        onDelete={(row) => remove.mutate(row.id, opts)}
      />

      {modal && (
        <CountryModal
          country={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
          onSubmit={(input) => {
            if (modal === 'new') create.mutate(input, opts);
            else update.mutate({ id: modal.id, input }, opts);
            setModal(null);
          }}
        />
      )}
    </>
  );
}

interface RegionDraft {
  /** Local key so removing a middle field doesn't shift the others' state. */
  key: number;
  /** Existing region's id — kept on rename; new regions get a slug of `name`. */
  id?: string;
  name: string;
}

/** Add (no `country`) or edit form. A country's `id` never changes on edit. */
function CountryModal({
  country,
  onClose,
  onSubmit,
}: {
  country?: Country;
  onClose: () => void;
  onSubmit: (input: Country) => void;
}) {
  const [name, setName] = useState(country?.name ?? '');
  const [sortOrder, setSortOrder] = useState(
    country ? String(country.sortOrder) : '',
  );
  const [regions, setRegions] = useState<RegionDraft[]>(
    () => country?.regions.map((r, i) => ({ key: i, id: r.id, name: r.name })) ?? [],
  );
  const [nextKey, setNextKey] = useState(country?.regions.length ?? 0);
  const countryId = country?.id ?? slugify(name);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const addRegion = () => {
    setRegions((prev) => [...prev, { key: nextKey, name: '' }]);
    setNextKey((k) => k + 1);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const seen = new Set<string>();
    onSubmit({
      id: countryId,
      name: name.trim(),
      sortOrder: Number(sortOrder) || 0,
      regions: regions
        .map((r) => ({ id: r.id ?? slugify(r.name), name: r.name.trim() }))
        .filter((r) => r.id && !seen.has(r.id) && seen.add(r.id)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {country ? 'Edit Country' : 'Add Country'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 overflow-y-auto">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Name
            </span>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Myanmar"
              className={inputClass}
            />
            {countryId && (
              <span className="mt-1 block text-xs text-slate-400">
                ID: {countryId}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Sort Order
            </span>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="e.g. 1"
              className={inputClass}
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Regions
            </span>
            <div className="space-y-2">
              {regions.map((r, i) => (
                <div key={r.key} className="flex items-center gap-2">
                  <input
                    autoFocus={!r.id}
                    required
                    value={r.name}
                    onChange={(e) =>
                      setRegions((prev) =>
                        prev.map((p) =>
                          p.key === r.key ? { ...p, name: e.target.value } : p,
                        ),
                      )
                    }
                    placeholder={`Region ${i + 1}, e.g. Yangon`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRegions((prev) => prev.filter((p) => p.key !== r.key))
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove region"
                    title="Remove"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRegion}
                className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 hover:border-pitch-500 hover:text-pitch-600"
              >
                <IconPlus className="h-4 w-4" />
                Add Region
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
