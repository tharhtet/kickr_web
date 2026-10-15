import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfigApi } from './api';
import type { AppConfigInput, UpdateAppConfigInput } from './types';

export const appConfigKeys = {
  all: ['app-config'] as const,
  history: (limit: number) => ['app-config', 'history', limit] as const,
  revision: (revision: number) => ['app-config', 'revision', revision] as const,
};

/** `GET /app-config/history` — newest first; `data[0]` is the live config. */
export function useAppConfigHistory(limit = 20) {
  return useQuery({
    queryKey: appConfigKeys.history(limit),
    queryFn: ({ signal }) => appConfigApi.history({ limit }, signal),
  });
}

/** `GET /app-config/history/:revision` — disabled until a revision is picked. */
export function useAppConfigRevision(revision: number | null) {
  return useQuery({
    queryKey: appConfigKeys.revision(revision ?? 0),
    queryFn: ({ signal }) => appConfigApi.revision(revision!, signal),
    enabled: revision !== null,
  });
}

/** `POST /app-config` — saves a complete config as a new revision. */
export function useCreateAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AppConfigInput) => appConfigApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: appConfigKeys.all }),
  });
}

/** `PATCH /app-config` — saves the changed fields as a new revision. */
export function useUpdateAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAppConfigInput) => appConfigApi.update(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: appConfigKeys.all }),
  });
}
