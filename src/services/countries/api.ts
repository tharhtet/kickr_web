import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { ApiError } from '@/lib/api/errors';
import type { Country, CreateCountryInput, UpdateCountryInput } from './types';

/**
 * Typed client for the kickr backend `countries` endpoints (superadmin).
 *
 * Same mock/live split as `authApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation.
 */

// --- mock state (module-scoped so edits persist within a session) ------------
let mockCountries: Country[] = [
  {
    id: 'myanmar',
    name: 'Myanmar',
    sortOrder: 1,
    regions: [
      { id: 'yangon', name: 'Yangon' },
      { id: 'mandalay', name: 'Mandalay' },
    ],
  },
];

async function mockList(): Promise<Country[]> {
  await delay();
  return clone([...mockCountries].sort((a, b) => a.sortOrder - b.sortOrder));
}

async function mockCreate(input: CreateCountryInput): Promise<Country> {
  await delay();
  if (mockCountries.some((c) => c.id === input.id)) {
    throw new ApiError(409, `Country '${input.id}' already exists`, undefined);
  }
  mockCountries = [...mockCountries, clone(input)];
  return clone(input);
}

function mockFind(id: string): Country {
  const country = mockCountries.find((c) => c.id === id);
  if (!country) throw new ApiError(404, `Country '${id}' not found`, undefined);
  return country;
}

async function mockUpdate(id: string, input: UpdateCountryInput): Promise<Country> {
  await delay();
  mockFind(id);
  mockCountries = mockCountries.map((c) => (c.id === id ? clone(input) : c));
  return clone(input);
}

async function mockRemove(id: string): Promise<{ deleted: true; id: string }> {
  await delay();
  mockFind(id);
  mockCountries = mockCountries.filter((c) => c.id !== id);
  return { deleted: true, id };
}

const path = (id: string) => `/countries/${encodeURIComponent(id)}`;

// --- public surface ---------------------------------------------------------
export const countriesApi = {
  /** GET /countries */
  list(signal?: AbortSignal): Promise<Country[]> {
    return env.useMocks ? mockList() : request<Country[]>('/countries', { signal });
  },

  /** POST /countries */
  create(input: CreateCountryInput): Promise<Country> {
    return env.useMocks
      ? mockCreate(input)
      : request<Country>('/countries', { method: 'POST', json: input });
  },

  /** PATCH /countries/:id */
  update(id: string, input: UpdateCountryInput): Promise<Country> {
    return env.useMocks
      ? mockUpdate(id, input)
      : request<Country>(path(id), { method: 'PATCH', json: input });
  },

  /** DELETE /countries/:id */
  async remove(id: string): Promise<void> {
    if (env.useMocks) await mockRemove(id);
    else await request<unknown>(path(id), { method: 'DELETE' });
  },
};
