import { useQueryClient } from '@tanstack/react-query';
import { IconBall } from '@/components/ui/icons';
import ListPage from '@/components/ui/ListPage';
import { sportTypesKeys, useSportTypes } from '@/services/sportTypes/hooks';
import type { SportType } from '@/services/sportTypes/types';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Futsal, stadium" → ['futsal', 'stadium'] */
const parseSubTypes = (s: string) => [
  ...new Set(
    s
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  ),
];

export default function SportTypesPage() {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useSportTypes();
  const rows = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const position = new Map(rows.map((r, i) => [r._id, i + 1]));

  // Local-only until create/update/delete endpoints are wired up — mutates the cached list.
  const updateCache = (fn: (prev: SportType[]) => SportType[]) =>
    queryClient.setQueryData<SportType[]>(sportTypesKeys.all, (prev = []) =>
      fn(prev),
    );

  return (
    <ListPage
      title="Sport Types"
      itemLabel="Sport Type"
      icon={IconBall}
      emptyText="No sport types yet"
      rows={rows}
      loading={isPending}
      error={error?.message}
      rowKey={(r) => r._id}
      columns={[
        {
          header: 'No.',
          render: (r) => position.get(r._id),
          className: 'text-slate-400',
          width: 'w-16',
        },
        {
          header: 'Name',
          render: (r) => capitalize(r.value),
          className: 'font-medium text-ink',
        },
        {
          header: 'Sub Types',
          render: (r) =>
            r.subTypes.length === 0 ? (
              <span className="text-slate-300">—</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {r.subTypes.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {capitalize(s)}
                  </span>
                ))}
              </div>
            ),
        },
      ]}
      fields={[
        {
          name: 'value',
          label: 'Name',
          required: true,
          placeholder: 'e.g. football',
        },
        {
          name: 'subTypes',
          label: 'Sub Types',
          placeholder: 'Comma-separated, e.g. futsal, stadium',
        },
      ]}
      toValues={(r) => ({ value: r.value, subTypes: r.subTypes.join(', ') })}
      onAdd={(v) =>
        updateCache((prev) => [
          ...prev,
          {
            _id: `local-${Date.now()}`,
            value: v.value.toLowerCase(),
            subTypes: parseSubTypes(v.subTypes),
            sortOrder: Math.max(0, ...prev.map((p) => p.sortOrder)) + 1,
          },
        ])
      }
      onEdit={(row, v) =>
        updateCache((prev) =>
          prev.map((p) =>
            p._id === row._id
              ? {
                  ...p,
                  value: v.value.toLowerCase(),
                  subTypes: parseSubTypes(v.subTypes),
                }
              : p,
          ),
        )
      }
      onDelete={(row) =>
        updateCache((prev) => prev.filter((p) => p._id !== row._id))
      }
    />
  );
}
