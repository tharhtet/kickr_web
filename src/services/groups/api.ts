import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import {
  groupDetailFixture,
  groupMembersFixture,
  groupPhotosFixture,
} from './fixtures';
import type {
  AdminGroup,
  GroupDetail,
  GroupMember,
  GroupPhoto,
  GroupPhotosResponse,
  ListAllGroupsParams,
  Page,
} from './types';

/**
 * Typed client for the kickr backend `groups` endpoints.
 *
 * Same mock/live split as `profileApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation. These back the public detail pages, so every
 * call uses optional auth: `GET /:id` is open to anyone, the rest 401 for a
 * logged-out visitor and the page shows a log-in prompt in their place.
 */

async function mockGet(groupId: string): Promise<GroupDetail> {
  await delay();
  return { ...clone(groupDetailFixture), _id: groupId };
}

async function mockMembers(): Promise<GroupMember[]> {
  await delay();
  return clone(groupMembersFixture);
}

async function mockPhotos(): Promise<GroupPhoto[]> {
  await delay();
  return clone(groupPhotosFixture);
}

/** 45 fake groups, newest first, so paging has something to page through. */
let mockAllGroups: AdminGroup[] = Array.from({ length: 45 }, (_, i) => ({
  _id: `mock-group-${String(45 - i).padStart(2, '0')}`,
  name: `${groupDetailFixture.name} ${45 - i}`,
  handle: `${groupDetailFixture.handle}-${45 - i}`,
  sportType: i % 3 === 0 ? 'futsal' : 'football',
  country: 'th',
  city: 'bangkok',
  isPrivate: i % 4 === 0,
  maxPlayers: 22,
  ownerId: 'u1',
  createdAt: new Date(Date.UTC(2026, 9, 1) - i * 86_400_000).toISOString(),
}));

async function mockListAll({
  page = 1,
  limit = 20,
  q,
}: ListAllGroupsParams): Promise<Page<AdminGroup>> {
  await delay();
  const needle = q?.trim().toLowerCase();
  const matches = needle
    ? mockAllGroups.filter((g) =>
        [g.name, g.handle].some((v) => v?.toLowerCase().includes(needle)),
      )
    : mockAllGroups;
  const start = (page - 1) * limit;
  return clone({
    items: matches.slice(start, start + limit),
    total: matches.length,
    page,
    limit,
    totalPages: Math.ceil(matches.length / limit),
  });
}

async function mockJoin(): Promise<void> {
  await delay();
}

async function mockLeave(): Promise<void> {
  await delay();
}

async function mockRemove(groupId: string): Promise<void> {
  await delay();
  mockAllGroups = mockAllGroups.filter((g) => g._id !== groupId);
}

export const groupsApi = {
  /** GET /groups/group-all — every group matching `q`, newest first, one page (superadmin). */
  listAll(
    params: ListAllGroupsParams = {},
    signal?: AbortSignal,
  ): Promise<Page<AdminGroup>> {
    return env.useMocks
      ? mockListAll(params)
      : request<Page<AdminGroup>>('/groups/group-all', {
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q?.trim() || undefined,
          },
          signal,
        });
  },

  /** GET /groups/:id */
  get(groupId: string, signal?: AbortSignal): Promise<GroupDetail> {
    return env.useMocks
      ? mockGet(groupId)
      : request<GroupDetail>(`/groups/${encodeURIComponent(groupId)}`, {
          auth: 'optional',
          signal,
        });
  },

  /** GET /groups/:id/members — 403 for a private group's non-member. */
  members(groupId: string, signal?: AbortSignal): Promise<GroupMember[]> {
    return env.useMocks
      ? mockMembers()
      : request<GroupMember[]>(
          `/groups/${encodeURIComponent(groupId)}/members`,
          {
            auth: 'optional',
            signal,
          },
        );
  },

  /** GET /groups/:id/photos — members only (403 otherwise). */
  async photos(groupId: string, signal?: AbortSignal): Promise<GroupPhoto[]> {
    if (env.useMocks) return mockPhotos();
    const res = await request<GroupPhotosResponse>(
      `/groups/${encodeURIComponent(groupId)}/photos`,
      { auth: 'optional', signal },
    );
    return res.photos;
  },

  /**
   * POST /groups/:id/invitations — the signed-in caller joins (public group)
   * or requests to join (private group); `memberStatus` reflects the result.
   */
  join(groupId: string): Promise<void> {
    return env.useMocks
      ? mockJoin()
      : request<void>(`/groups/${encodeURIComponent(groupId)}/invitations`, {
          method: 'POST',
        });
  },

  /**
   * POST /groups/:id/leave — the caller leaves the group, or cancels their
   * pending join request. 403 for the owner, 404 if not a member.
   */
  leave(groupId: string): Promise<void> {
    return env.useMocks
      ? mockLeave()
      : request<void>(`/groups/${encodeURIComponent(groupId)}/leave`, {
          method: 'POST',
        });
  },

  /** DELETE /groups/:id */
  async remove(groupId: string): Promise<void> {
    if (env.useMocks) await mockRemove(groupId);
    else
      await request<unknown>(`/groups/${encodeURIComponent(groupId)}`, {
        method: 'DELETE',
      });
  },
};
