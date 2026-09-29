import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { delay } from '@/lib/api/mock';
import { ApiError } from '@/lib/api/errors';
import type { LoginInput, LoginResponse } from './types';

/**
 * Typed client for the kickr backend `auth` endpoints.
 *
 * Same mock/live split as `profileApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation.
 */

async function mockLogin(input: LoginInput): Promise<LoginResponse> {
  await delay(500);
  if (!input.email || !input.password) {
    throw new ApiError(400, 'Email and password are required', null);
  }
  const stamp = Date.now();
  return {
    accessToken: `mock-access.${btoa(input.email)}.${stamp}`,
    idToken: `mock-id.${btoa(input.email)}.${stamp}`,
    refreshToken: `mock-refresh.${btoa(input.email)}.${stamp}`,
    sub: `mock-sub-${btoa(input.email)}`,
    expiresIn: 3600,
  };
}

export const authApi = {
  /** POST /auth/login */
  login(input: LoginInput): Promise<LoginResponse> {
    console.log(input);
    return env.useMocks
      ? mockLogin(input)
      : request<LoginResponse>('/auth/login', {
          method: 'POST',
          json: input,
          auth: false,
        });
  },
};
