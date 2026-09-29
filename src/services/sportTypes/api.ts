import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import type { SportType } from './types';

/**
 * Typed client for the kickr backend `sport-types` endpoints.
 *
 * Same mock/live split as `authApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation.
 */

const MOCK_SPORT_TYPES: SportType[] = [
  { _id: '6aad602b494d2afa80f643da', value: 'football', subTypes: ['futsal', 'stadium'], sortOrder: 1 },
  { _id: '6aad602b494d2afa80f643db', value: 'futsal', subTypes: [], sortOrder: 2 },
  { _id: '6aad602b494d2afa80f643dc', value: 'badminton', subTypes: [], sortOrder: 3 },
];

async function mockList(): Promise<SportType[]> {
  await delay();
  return clone(MOCK_SPORT_TYPES);
}

export const sportTypesApi = {
  /** GET /sport-types */
  list(signal?: AbortSignal): Promise<SportType[]> {
    return env.useMocks ? mockList() : request<SportType[]>('/sport-types', { signal });
  },
};
