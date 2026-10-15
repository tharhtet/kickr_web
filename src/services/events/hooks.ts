import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi, type ListByGroupParams } from './api';

export const eventsKeys = {
  all: ['events'] as const,
  detail: (eventId: string) => [...eventsKeys.all, 'detail', eventId] as const,
  players: (eventId: string) => [...eventsKeys.all, 'players', eventId] as const,
  byGroup: (groupId: string, params: ListByGroupParams) =>
    [...eventsKeys.all, 'group', groupId, params] as const,
};

/** `GET /events/:id` */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: eventsKeys.detail(eventId ?? ''),
    queryFn: ({ signal }) => eventsApi.get(eventId as string, signal),
    enabled: Boolean(eventId),
  });
}

/** `GET /events/:id/players` */
export function useEventPlayers(eventId: string | undefined) {
  return useQuery({
    queryKey: eventsKeys.players(eventId ?? ''),
    queryFn: ({ signal }) => eventsApi.players(eventId as string, signal),
    enabled: Boolean(eventId),
  });
}

/** `POST /events/:id/join` — refetches the event and its roster on success. */
export function useJoinEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => eventsApi.join(eventId),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }),
        qc.invalidateQueries({ queryKey: eventsKeys.players(eventId) }),
      ]),
  });
}

/** `POST /events/:id/join-anonymous` — refetches the event and its roster on success. */
export function useJoinEventAnonymous(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => eventsApi.joinAnonymous(eventId, name),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }),
        qc.invalidateQueries({ queryKey: eventsKeys.players(eventId) }),
      ]),
  });
}

/** `GET /events/group/:groupId` */
export function useGroupEvents(groupId: string | undefined, params: ListByGroupParams = {}) {
  return useQuery({
    queryKey: eventsKeys.byGroup(groupId ?? '', params),
    queryFn: ({ signal }) => eventsApi.listByGroup(groupId as string, params, signal),
    enabled: Boolean(groupId),
  });
}
