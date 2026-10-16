import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconSearch, IconUsers, IconX } from '@/components/ui/icons';
import ListPage, { inputClass } from '@/components/ui/ListPage';
import {
  groupsKeys,
  useAllGroups,
  useDeleteGroup,
} from '@/services/groups/hooks';
import type { AdminGroup } from '@/services/groups/types';

const PAGE_SIZE = 20;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const pagerButton =
  'rounded-xl border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:border-pitch-500 hover:text-pitch-600 disabled:pointer-events-none disabled:opacity-50';

/** Superadmin list of every group (`GET /groups/group-all`), newest first. */
export default function GroupsPage() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const remove = useDeleteGroup();

  const { data, isPending, isPlaceholderData, error, refetch } = useAllGroups({
    page,
    limit: PAGE_SIZE,
    q: q || undefined,
  });

  // Runs a search from page 1, always hitting the API (never a cached page).
  const runSearch = (value: string) => {
    const next = value.trim();
    if (next === q && page === 1) {
      refetch();
      return;
    }
    queryClient.invalidateQueries({
      queryKey: groupsKeys.listAll({
        page: 1,
        limit: PAGE_SIZE,
        q: next || undefined,
      }),
      exact: true,
      refetchType: 'none',
    });
    setQ(next);
    setPage(1);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    runSearch(search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Clearing the field resets the list to all groups.
    if (!value.trim() && q) runSearch('');
  };
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const offset = ((data?.page ?? page) - 1) * (data?.limit ?? PAGE_SIZE);

  const handleDelete = (row: AdminGroup) =>
    remove.mutate(row._id, {
      onSuccess: () => {
        setActionError(null);
        // Deleting the last row of a page steps back to the previous page.
        if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      },
      onError: (err) => setActionError(err.message),
    });

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
        title="Group List"
        itemLabel="Group"
        icon={IconUsers}
        emptyText={q ? `No groups match "${q}"` : 'No groups yet'}
        rows={rows}
        loading={isPending}
        error={error?.message}
        rowKey={(r) => r._id}
        onDelete={handleDelete}
        columns={[
          {
            header: 'No.',
            render: (_, i) => offset + i + 1,
            className: 'text-slate-400',
            width: 'w-16',
          },
          {
            header: 'Name',
            render: (r) => (
              <div>
                <div>{r.name}</div>
                {r.handle && (
                  <div className="text-xs font-normal text-slate-400">
                    @{r.handle}
                  </div>
                )}
              </div>
            ),
            className: 'font-medium text-ink',
          },
          {
            header: 'Sport',
            render: (r) => (r.sportType ? capitalize(r.sportType) : '—'),
          },
          {
            header: 'Location',
            render: (r) =>
              [r.city, r.country?.toUpperCase()]
                .filter(Boolean)
                .map((s) => capitalize(s!))
                .join(', ') || '—',
          },
          {
            header: 'Visibility',
            render: (r) => (r.isPrivate ? 'Private' : 'Public'),
          },
          { header: 'Max Players', render: (r) => r.maxPlayers },
          { header: 'Created', render: (r) => formatDate(r.createdAt) },
        ]}
        toolbar={
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <div className="relative w-full sm:w-72">
              <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search groups…"
                aria-label="Search groups"
                className={`${inputClass} pl-9`}
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-pitch-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pitch-600/30 transition hover:bg-pitch-700"
            >
              Search
            </button>
          </form>
        }
        footer={
          total > 0 && (
            <div className="mt-4 grid grid-cols-1 items-center gap-3 text-sm text-slate-500 sm:grid-cols-3">
              <div className="hidden sm:block" />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1 || isPlaceholderData}
                  className={pagerButton}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || isPlaceholderData}
                  className={pagerButton}
                >
                  Next
                </button>
              </div>
              <span className="text-center sm:text-right">
                Showing {offset + 1}–{offset + rows.length} of {total}
              </span>
            </div>
          )
        }
      />
    </>
  );
}
