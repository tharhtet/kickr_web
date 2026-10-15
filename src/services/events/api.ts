import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { eventDetailFixture, eventPlayersFixture } from './fixtures';
import type { EventDetail, EventPlayer, EventStatus, EventSummary } from './types';

/**
 * Typed client for the kickr backend `events` endpoints.
 *
 * Same mock/live split as `profileApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation. These back the public detail pages, so every
 * call uses optional auth: `GET /:id` is open to anyone, the rest 401 for a
 * logged-out visitor and the page shows a log-in prompt in their place.
 */

export interface ListByGroupParams {
  status?: EventStatus;
  /** Include past and `done` events (hidden by default). */
  includeExpired?: boolean;
}

async function mockGet(eventId: string): Promise<EventDetail> {
  await delay();
  return { ...clone(eventDetailFixture), _id: eventId };
}

async function mockPlayers(): Promise<EventPlayer[]> {
  await delay();
  return clone(eventPlayersFixture);
}

async function mockListByGroup(
  groupId: string,
  params: ListByGroupParams,
): Promise<EventSummary[]> {
  await delay();
  const upcoming: EventSummary[] = [
    { ...clone(eventDetailFixture), groupId },
    {
      ...clone(eventDetailFixture),
      _id: '66b0c0ffee0000000000f002',
      groupId,
      title: 'Aura Bangkok vs Sukhumvit United',
      date: '2026-10-26T12:00:00.000Z',
      type: 'challenge',
      opponentGroupId: '66b0c0ffee0000000000c002',
      price: 0,
      joinedCount: 10,
      templateId: null,
    },
  ];
  if (params.status === 'done') {
    return Array.from({ length: 3 }, (_, i) => ({
      ...clone(eventDetailFixture),
      _id: `66b0c0ffee0000000000e00${i}`,
      groupId,
      status: 'done' as const,
      date: `2026-10-0${1 + i}T11:00:00.000Z`,
    }));
  }
  return upcoming;
}

async function mockJoinAnonymous(): Promise<void> {
  await delay();
}

export const eventsApi = {
  /** GET /events/:id */
  get(eventId: string, signal?: AbortSignal): Promise<EventDetail> {
    return env.useMocks
      ? mockGet(eventId)
      : request<EventDetail>(`/events/${encodeURIComponent(eventId)}`, {
          auth: 'optional',
          signal,
        });
  },

  /** GET /events/:id/players — joined, playable roster (registered + guests). */
  players(eventId: string, signal?: AbortSignal): Promise<EventPlayer[]> {
    return env.useMocks
      ? mockPlayers()
      : request<EventPlayer[]>(`/events/${encodeURIComponent(eventId)}/players`, {
          auth: 'optional',
          signal,
        });
  },

  /** POST /events/:id/join — the signed-in caller joins the event. */
  join(eventId: string): Promise<void> {
    return env.useMocks
      ? mockJoinAnonymous()
      : request<void>(`/events/${encodeURIComponent(eventId)}/join`, {
          method: 'POST',
        });
  },

  /** POST /events/:id/join-anonymous — a logged-out visitor joins as a named guest. */
  joinAnonymous(eventId: string, name: string): Promise<void> {
    return env.useMocks
      ? mockJoinAnonymous()
      : request<void>(`/events/${encodeURIComponent(eventId)}/join-anonymous`, {
          method: 'POST',
          json: { name },
          auth: false,
        });
  },

  /** GET /events/group/:groupId — soonest first; 403 for a private group's non-member. */
  listByGroup(
    groupId: string,
    params: ListByGroupParams = {},
    signal?: AbortSignal,
  ): Promise<EventSummary[]> {
    return env.useMocks
      ? mockListByGroup(groupId, params)
      : request<EventSummary[]>(`/events/group/${encodeURIComponent(groupId)}`, {
          query: {
            status: params.status,
            includeExpired: params.includeExpired,
          },
          auth: 'optional',
          signal,
        });
  },
};
