import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { ApiError } from '@/lib/api/errors';
import {
  currentUserFixture,
  publicProfileFixtures,
  qrFixture,
} from './fixtures';
import type {
  PublicProfile,
  QrResponse,
  UpdateProfileInput,
  User,
} from './types';

/**
 * Typed client for the kickr backend `users` endpoints.
 *
 * Every function has two implementations: a `mock*` one backed by the local
 * fixtures and a real HTTP one. `env.useMocks` (VITE_USE_MOCKS) picks between
 * them, so switching to the live backend is a config change, not a code change.
 */

// --- mock state (module-scoped so edits persist within a session) ------------
let mockUser: User = clone(currentUserFixture);

async function mockGetMe(): Promise<User> {
  await delay();
  return clone(mockUser);
}

async function mockUpdateProfile(input: UpdateProfileInput): Promise<User> {
  await delay();
  mockUser = {
    ...mockUser,
    ...input,
    privacy: input.privacy
      ? { ...mockUser.privacy!, ...input.privacy }
      : mockUser.privacy,
  };
  return clone(mockUser);
}

async function mockUploadAvatar(file: File): Promise<User> {
  await delay(600);
  const url = URL.createObjectURL(file);
  mockUser = { ...mockUser, profileImage: url };
  return clone(mockUser);
}

async function mockGetMyQr(): Promise<QrResponse> {
  await delay();
  return clone(qrFixture);
}

async function mockGetPublicProfile(userId: string): Promise<PublicProfile> {
  await delay();
  const found = publicProfileFixtures[userId];
  if (!found) throw new ApiError(404, 'User not found', { message: 'User not found' });
  return clone(found);
}

// --- public surface ---------------------------------------------------------
export const profileApi = {
  /** GET /users/me */
  getMe(): Promise<User> {
    return env.useMocks ? mockGetMe() : request<User>('/users/me');
  },

  /** PATCH /users/me */
  updateProfile(input: UpdateProfileInput): Promise<User> {
    return env.useMocks
      ? mockUpdateProfile(input)
      : request<User>('/users/me', { method: 'PATCH', json: input });
  },

  /** POST /users/me/avatar (multipart, field name `file`) */
  uploadAvatar(file: File): Promise<User> {
    if (env.useMocks) return mockUploadAvatar(file);
    const form = new FormData();
    form.append('file', file);
    return request<User>('/users/me/avatar', { method: 'POST', body: form });
  },

  /** GET /users/me/qr */
  getMyQr(): Promise<QrResponse> {
    return env.useMocks ? mockGetMyQr() : request<QrResponse>('/users/me/qr');
  },

  /** GET /users/:id/profile */
  getPublicProfile(userId: string): Promise<PublicProfile> {
    return env.useMocks
      ? mockGetPublicProfile(userId)
      : request<PublicProfile>(`/users/${userId}/profile`);
  },
};
