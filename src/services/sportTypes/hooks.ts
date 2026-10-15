import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { sportTypesApi } from './api';
import type {
  CreateSportTypeInput,
  SportType,
  UpdateSportTypeInput,
} from './types';

export const sportTypesKeys = {
  all: ['sport-types'] as const,
  detail: (value: string) => [...sportTypesKeys.all, value] as const,
};

/** The full list, in display order (from `GET /configuration`). */
export function useSportTypes() {
  return useQuery({
    queryKey: sportTypesKeys.all,
    queryFn: ({ signal }) => sportTypesApi.list(signal),
  });
}

/** `GET /sport-types/:value` */
export function useSportType(value: string | undefined) {
  return useQuery({
    queryKey: sportTypesKeys.detail(value ?? ''),
    queryFn: ({ signal }) => sportTypesApi.get(value as string, signal),
    enabled: Boolean(value),
  });
}

/**
 * Every write returns the affected sport — patch it into the cached list so
 * the table updates without waiting, then refetch so server-side changes
 * (e.g. other rows' `sortOrder` shifting) are picked up.
 *
 * The row is matched by the `value` the request targeted (or `_id`), not the
 * response's `value` — if those ever differ, matching on the response would
 * append the edited sport as a duplicate row.
 */
function useWriteSportType() {
  const qc = useQueryClient();
  return (sport: SportType, key?: string) => {
    const isTarget = (p: SportType) =>
      p.value === (key ?? sport.value) ||
      p.value === sport.value ||
      (Boolean(p._id) && p._id === sport._id);
    qc.setQueryData<SportType[]>(sportTypesKeys.all, (prev = []) => {
      const next = prev.some(isTarget)
        ? prev.map((p) => (isTarget(p) ? { ...p, ...sport } : p))
        : [...prev, sport];
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    qc.setQueryData(sportTypesKeys.detail(sport.value), sport);
    qc.invalidateQueries({ queryKey: sportTypesKeys.all, exact: true });
  };
}

/** `POST /sport-types` */
export function useCreateSportType() {
  const write = useWriteSportType();
  return useMutation({
    mutationFn: (input: CreateSportTypeInput) => sportTypesApi.create(input),
    onSuccess: (sport) => write(sport),
  });
}

/** `PATCH /sport-types/:value` */
export function useUpdateSportType() {
  const write = useWriteSportType();
  return useMutation({
    mutationFn: ({ value, input }: { value: string; input: UpdateSportTypeInput }) =>
      sportTypesApi.update(value, input),
    onSuccess: (sport, { value }) => write(sport, value),
  });
}

/** `DELETE /sport-types/:value` */
export function useDeleteSportType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: string) => sportTypesApi.remove(value),
    onSuccess: ({ value }) => {
      qc.setQueryData<SportType[]>(sportTypesKeys.all, (prev = []) =>
        prev.filter((p) => p.value !== value),
      );
      qc.removeQueries({ queryKey: sportTypesKeys.detail(value) });
    },
  });
}

/** `POST /sport-types/:value/sub-types` */
export function useAddSubType() {
  const write = useWriteSportType();
  return useMutation({
    mutationFn: ({ value, subType }: { value: string; subType: string }) =>
      sportTypesApi.addSubType(value, subType),
    onSuccess: (sport, { value }) => write(sport, value),
  });
}

/** `PATCH /sport-types/:value/sub-types/:subType` */
export function useRenameSubType() {
  const write = useWriteSportType();
  return useMutation({
    mutationFn: ({
      value,
      subType,
      newName,
    }: {
      value: string;
      subType: string;
      newName: string;
    }) => sportTypesApi.renameSubType(value, subType, newName),
    onSuccess: (sport, { value }) => write(sport, value),
  });
}

/** `DELETE /sport-types/:value/sub-types/:subType` */
export function useRemoveSubType() {
  const write = useWriteSportType();
  return useMutation({
    mutationFn: ({ value, subType }: { value: string; subType: string }) =>
      sportTypesApi.removeSubType(value, subType),
    onSuccess: (sport, { value }) => write(sport, value),
  });
}

/**
 * Reorder sub types via `PATCH /sport-types/:value` (`subTypes` replaces the
 * whole list). Optimistic so the dragged chip doesn't snap back while saving.
 */
export function useReorderSubTypes() {
  const qc = useQueryClient();
  const write = useWriteSportType();
  return useMutation({
    mutationFn: ({ value, subTypes }: { value: string; subTypes: string[] }) =>
      sportTypesApi.update(value, { subTypes }),
    onMutate: async ({ value, subTypes }) => {
      await qc.cancelQueries({ queryKey: sportTypesKeys.all });
      const prev = qc.getQueryData<SportType[]>(sportTypesKeys.all);
      qc.setQueryData<SportType[]>(sportTypesKeys.all, (list = []) =>
        list.map((p) => (p.value === value ? { ...p, subTypes } : p)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(sportTypesKeys.all, ctx.prev);
    },
    onSuccess: (sport, { value }) => write(sport, value),
  });
}
