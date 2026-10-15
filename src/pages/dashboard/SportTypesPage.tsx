import { useState } from 'react';
import { IconBall, IconPlus, IconX } from '@/components/ui/icons';
import ListPage, { AddModal } from '@/components/ui/ListPage';
import {
  useAddSubType,
  useCreateSportType,
  useDeleteSportType,
  useRemoveSubType,
  useRenameSubType,
  useReorderSubTypes,
  useSportTypes,
  useUpdateSportType,
} from '@/services/sportTypes/hooks';
import type { SportType } from '@/services/sportTypes/types';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const displayName = (sport: SportType) => sport.name || capitalize(sport.value);

/** "Futsal, stadium" → ['futsal', 'stadium'] */
const parseSubTypes = (s: string) => [
  ...new Set(
    s
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  ),
];

/** '' → undefined (backend appends / leaves unchanged), otherwise an int. */
const parseSortOrder = (s: string) => {
  if (!s) return undefined;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
};

/** Moves `from` to sit where `to` currently is. */
const move = (list: string[], from: string, to: string) => {
  const next = list.filter((s) => s !== from);
  next.splice(list.indexOf(to), 0, from);
  return next;
};

const YES_NO = ['Yes', 'No'] as const;

type SubTypeModal =
  | { mode: 'add'; sport: SportType }
  | { mode: 'rename'; sport: SportType; subType: string };

const titleField = {
  name: 'title',
  label: 'Name',
  placeholder: 'Display name, e.g. Football',
};
const sortOrderField = {
  name: 'sortOrder',
  label: 'Sort Order',
  placeholder: 'Leave empty to add at the end',
};
const matchField = {
  name: 'matchProvided',
  label: 'Played as a match',
  type: 'select' as const,
  options: YES_NO,
};

export default function SportTypesPage() {
  const { data, isPending, error } = useSportTypes();
  const rows = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const position = new Map(rows.map((r, i) => [r.value, i + 1]));

  const [actionError, setActionError] = useState<string | null>(null);
  const onError = (err: Error) => setActionError(err.message);
  const onSuccess = () => setActionError(null);
  const opts = { onError, onSuccess };

  const create = useCreateSportType();
  const update = useUpdateSportType();
  const remove = useDeleteSportType();
  const addSubType = useAddSubType();
  const renameSubType = useRenameSubType();
  const removeSubType = useRemoveSubType();
  const reorderSubTypes = useReorderSubTypes();

  /** Sub type being dragged, scoped to its sport so chips can't cross rows. */
  const [dragging, setDragging] = useState<{ sport: string; subType: string } | null>(null);

  const handleDrop = (sport: SportType, target: string) => {
    if (!dragging || dragging.sport !== sport.value || dragging.subType === target)
      return;
    reorderSubTypes.mutate(
      { value: sport.value, subTypes: move(sport.subTypes, dragging.subType, target) },
      opts,
    );
  };

  const [subTypeModal, setSubTypeModal] = useState<SubTypeModal | null>(null);

  const handleSubTypeSubmit = (name: string) => {
    if (!subTypeModal || !name) return;
    const { sport } = subTypeModal;
    if (subTypeModal.mode === 'add')
      addSubType.mutate({ value: sport.value, subType: name }, opts);
    else if (name.toLowerCase() !== subTypeModal.subType)
      renameSubType.mutate(
        { value: sport.value, subType: subTypeModal.subType, newName: name },
        opts,
      );
    setSubTypeModal(null);
  };

  const handleRemoveSubType = (sport: SportType, subType: string) => {
    if (
      window.confirm(
        `Remove sub type "${subType}" from ${displayName(sport)}?`,
      )
    )
      removeSubType.mutate({ value: sport.value, subType }, opts);
  };

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
        title="Sport Types"
        itemLabel="Sport Type"
        icon={IconBall}
        emptyText="No sport types yet"
        rows={rows}
        loading={isPending}
        error={error?.message}
        rowKey={(r) => r.value}
        columns={[
          {
            header: 'No.',
            render: (r) => position.get(r.value),
            className: 'text-slate-400',
            width: 'w-16',
          },
          {
            header: 'Name',
            render: (r) => (
              <div>
                <div>{displayName(r)}</div>
                <div className="text-xs font-normal text-slate-400">
                  {r.value}
                </div>
              </div>
            ),
            className: 'font-medium text-ink',
          },
          {
            header: 'Sub Types',
            render: (r) => (
              <div className="flex flex-wrap items-center gap-1.5">
                {r.subTypes.map((s) => (
                  <span
                    key={s}
                    draggable={r.subTypes.length > 1}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      setDragging({ sport: r.value, subType: s });
                    }}
                    onDragOver={(e) => {
                      if (dragging?.sport === r.value) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(r, s);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`flex items-center gap-0.5 rounded-full bg-slate-100 py-1 pr-1 pl-2.5 text-xs font-medium text-slate-600 ${
                      r.subTypes.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      dragging?.sport === r.value && dragging.subType === s
                        ? 'opacity-40'
                        : ''
                    }`}
                    title={r.subTypes.length > 1 ? 'Drag to reorder' : undefined}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSubTypeModal({
                          mode: 'rename',
                          sport: r,
                          subType: s,
                        })
                      }
                      className="hover:text-pitch-600"
                      title="Rename"
                    >
                      {capitalize(s)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubType(r, s)}
                      className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${s}`}
                      title="Remove"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setSubTypeModal({ mode: 'add', sport: r })}
                  className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 hover:border-pitch-500 hover:text-pitch-600"
                >
                  <IconPlus className="h-3 w-3" />
                  Add
                </button>
              </div>
            ),
          },
          {
            header: 'Match',
            render: (r) => (r.matchProvided ? 'Yes' : 'No'),
          },
        ]}
        fields={[
          {
            name: 'value',
            label: 'ID',
            required: true,
            placeholder: 'e.g. football',
          },
          titleField,
          {
            name: 'subTypes',
            label: 'Sub Types',
            placeholder: 'Comma-separated, e.g. futsal, stadium',
          },
          sortOrderField,
          matchField,
        ]}
        // `value` is immutable once created; sub types are edited inline.
        editFields={[titleField, sortOrderField, matchField]}
        toValues={(r) => ({
          title: displayName(r),
          sortOrder: String(r.sortOrder),
          matchProvided: r.matchProvided ? 'Yes' : 'No',
        })}
        onAdd={(v) =>
          create.mutate(
            {
              value: v.value.toLowerCase(),
              name: v.title || undefined,
              subTypes: parseSubTypes(v.subTypes),
              sortOrder: parseSortOrder(v.sortOrder),
              matchProvided: v.matchProvided !== 'No',
            },
            opts,
          )
        }
        onEdit={(row, v) =>
          update.mutate(
            {
              value: row.value,
              input: {
                name: v.title || undefined,
                sortOrder: parseSortOrder(v.sortOrder),
                matchProvided: v.matchProvided !== 'No',
              },
            },
            opts,
          )
        }
        onDelete={(row) => remove.mutate(row.value, opts)}
      />

      {subTypeModal && (
        <AddModal
          title={
            subTypeModal.mode === 'add'
              ? `Add Sub Type to ${displayName(subTypeModal.sport)}`
              : 'Rename Sub Type'
          }
          fields={[
            {
              name: 'name',
              label: 'Name',
              required: true,
              placeholder: 'e.g. futsal',
            },
          ]}
          initialValues={
            subTypeModal.mode === 'rename'
              ? { name: subTypeModal.subType }
              : undefined
          }
          onClose={() => setSubTypeModal(null)}
          onSubmit={(v) => handleSubTypeSubmit(v.name)}
        />
      )}
    </>
  );
}
