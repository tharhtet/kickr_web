import {
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  type SVGProps,
} from 'react';
import { IconPencil, IconPlus, IconTrash, IconX } from '@/components/ui/icons';

export interface ListColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Tailwind width class for the column, e.g. `w-16`. */
  width?: string;
}

export interface ListField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
}

interface ListPageProps<T> {
  title: string;
  /** Singular noun used in the add button / modal, e.g. "Sport Type". */
  itemLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  emptyText: string;
  rows: T[];
  loading?: boolean;
  error?: string | null;
  rowKey: (row: T) => string;
  columns: ListColumn<T>[];
  fields: ListField[];
  onAdd: (values: Record<string, string>) => void;
  /** Enables the per-row edit button; `toValues` prefills the edit form. */
  onEdit?: (row: T, values: Record<string, string>) => void;
  toValues?: (row: T) => Record<string, string>;
  /** Enables the per-row delete button (asks for confirmation first). */
  onDelete?: (row: T) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-pitch-500 focus:ring-2 focus:ring-pitch-500/15';

/**
 * Generic "table listing + Add" screen for simple lookup entities
 * (sport types, regions, …) rendered inside DashboardLayout.
 */
export default function ListPage<T>({
  title,
  itemLabel,
  icon: Icon,
  emptyText,
  rows,
  loading = false,
  error,
  rowKey,
  columns,
  fields,
  onAdd,
  onEdit,
  toValues,
  onDelete,
}: ListPageProps<T>) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700"
        >
          <IconPlus className="h-4 w-4" />
          Add {itemLabel}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-400">
            Loading…
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-sm text-red-600">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Icon className="h-10 w-10 text-pitch-500" />
            <p className="mt-3 text-sm font-medium text-ink">{emptyText}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide text-slate-400 uppercase">
                  {columns.map((col) => (
                    <th
                      key={col.header}
                      className={['pb-3 font-medium', col.width]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {col.header}
                    </th>
                  ))}
                  {hasActions && (
                    <th className="pb-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((col) => (
                      <td
                        key={col.header}
                        className={[
                          'py-3',
                          col.className ?? 'text-slate-500',
                        ].join(' ')}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => setEditing(row)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-pitch-600"
                              aria-label={`Edit ${itemLabel}`}
                              title="Edit"
                            >
                              <IconPencil className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete this ${itemLabel.toLowerCase()}?`,
                                  )
                                )
                                  onDelete(row);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${itemLabel}`}
                              title="Delete"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <AddModal
          title={`Add ${itemLabel}`}
          fields={fields}
          onClose={() => setOpen(false)}
          onSubmit={(values) => {
            onAdd(values);
            setOpen(false);
          }}
        />
      )}

      {editing && onEdit && (
        <AddModal
          title={`Edit ${itemLabel}`}
          fields={fields}
          initialValues={toValues?.(editing)}
          onClose={() => setEditing(null)}
          onSubmit={(values) => {
            onEdit(editing, values);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function AddModal({
  title,
  fields,
  initialValues,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: ListField[];
  initialValues?: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    for (const f of fields)
      values[f.name] = String(data.get(f.name) ?? '').trim();
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {fields.map((f) => (
            <label key={f.name} className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                {f.label}
              </span>
              {f.type === 'textarea' ? (
                <textarea
                  name={f.name}
                  defaultValue={initialValues?.[f.name]}
                  required={f.required}
                  placeholder={f.placeholder}
                  rows={3}
                  className={inputClass}
                />
              ) : f.type === 'select' ? (
                <select
                  name={f.name}
                  defaultValue={initialValues?.[f.name]}
                  required={f.required}
                  className={inputClass}
                >
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.name}
                  defaultValue={initialValues?.[f.name]}
                  required={f.required}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              )}
            </label>
          ))}
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

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-pitch-100 text-pitch-700',
  Inactive: 'bg-slate-100 text-slate-600',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        'rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-600',
      ].join(' ')}
    >
      {status}
    </span>
  );
}
