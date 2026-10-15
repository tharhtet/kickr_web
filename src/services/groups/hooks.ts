import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export const groupsKeys = {
  all: ['groups'] as const,
  detail: (groupId: string) => [...groupsKeys.all, 'detail', groupId] as const,
  members: (groupId: string) => [...groupsKeys.all, 'members', groupId] as const,
  photos: (groupId: string) => [...groupsKeys.all, 'photos', groupId] as const,
};

/** `GET /groups/:id` */
export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: groupsKeys.detail(groupId ?? ''),
    queryFn: ({ signal }) => groupsApi.get(groupId as string, signal),
    enabled: Boolean(groupId),
  });
}

/** `GET /groups/:id/members` */
export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: groupsKeys.members(groupId ?? ''),
    queryFn: ({ signal }) => groupsApi.members(groupId as string, signal),
    enabled: Boolean(groupId),
  });
}

/** `GET /groups/:id/photos` */
export function useGroupPhotos(groupId: string | undefined) {
  return useQuery({
    queryKey: groupsKeys.photos(groupId ?? ''),
    queryFn: ({ signal }) => groupsApi.photos(groupId as string, signal),
    enabled: Boolean(groupId),
  });
}

/** `POST /groups/:id/invitations` — refetches the group and its roster on success. */
export function useJoinGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupsApi.join(groupId),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: groupsKeys.detail(groupId) }),
        qc.invalidateQueries({ queryKey: groupsKeys.members(groupId) }),
      ]),
  });
}

/**
 * `POST /groups/:id/leave` — on success refetches the group and drops its
 * members / photos / events, which a private group no longer shows the caller.
 */
export function useLeaveGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: groupsKeys.detail(groupId) }),
        qc.invalidateQueries({ queryKey: groupsKeys.members(groupId) }),
        qc.invalidateQueries({ queryKey: groupsKeys.photos(groupId) }),
        qc.invalidateQueries({ queryKey: ['events', 'group', groupId] }),
      ]),
  });
}
