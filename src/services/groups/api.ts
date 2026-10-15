import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { groupDetailFixture, groupMembersFixture, groupPhotosFixture } from './fixtures';
import type { GroupDetail, GroupMember, GroupPhoto, GroupPhotosResponse } from './types';

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

async function mockJoin(): Promise<void> {
  await delay();
}

async function mockLeave(): Promise<void> {
  await delay();
}

export const groupsApi = {
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
      : request<GroupMember[]>(`/groups/${encodeURIComponent(groupId)}/members`, {
          auth: 'optional',
          signal,
        });
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
};
