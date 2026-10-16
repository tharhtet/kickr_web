import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { ApiError } from '@/lib/api/errors';
import type {
  CreateSportTypeInput,
  SportType,
  UpdateSportTypeInput,
} from './types';

/**
 * Typed client for the kickr backend `sport-types` endpoints (superadmin).
 *
 * Same mock/live split as `authApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation.
 */

// --- mock state (module-scoped so edits persist within a session) ------------
let mockSportTypes: SportType[] = [
  { _id: '6aad602b494d2afa80f643da', value: 'football', subTypes: ['futsal', 'stadium'], playerRoles: ['forward', 'winger', 'midfielder', 'defender', 'goalkeeper', 'referee', 'coach'], sortOrder: 1, matchProvided: true },
  { _id: '6aad602b494d2afa80f643db', value: 'futsal', subTypes: [], playerRoles: ['goalkeeper', 'defender', 'pivot'], sortOrder: 2, matchProvided: true },
  { _id: '6aad602b494d2afa80f643dc', value: 'badminton', subTypes: [], playerRoles: [], sortOrder: 3, matchProvided: true },
];

const slug = (s: string) => s.trim().toLowerCase();

function mockFind(value: string): SportType {
  const sport = mockSportTypes.find((s) => s.value === slug(value));
  if (!sport) throw new ApiError(404, `Sport type '${value}' not found`, undefined);
  return sport;
}

function mockSave(sport: SportType): SportType {
  mockSportTypes = mockSportTypes.map((s) => (s.value === sport.value ? sport : s));
  return clone(sport);
}

async function mockList(): Promise<SportType[]> {
  await delay();
  return clone([...mockSportTypes].sort((a, b) => a.sortOrder - b.sortOrder));
}

async function mockGet(value: string): Promise<SportType> {
  await delay();
  return clone(mockFind(value));
}

async function mockCreate(input: CreateSportTypeInput): Promise<SportType> {
  await delay();
  const value = slug(input.value);
  if (mockSportTypes.some((s) => s.value === value)) {
    throw new ApiError(409, `Sport type '${value}' already exists`, undefined);
  }
  const sport: SportType = {
    _id: `mock-${Date.now()}`,
    value,
    name: input.name?.trim() || undefined,
    subTypes: [...new Set((input.subTypes ?? []).map(slug))],
    playerRoles: [...new Set((input.playerRoles ?? []).map(slug))],
    sortOrder:
      input.sortOrder ?? Math.max(0, ...mockSportTypes.map((s) => s.sortOrder)) + 1,
    matchProvided: input.matchProvided ?? true,
  };
  mockSportTypes = [...mockSportTypes, sport];
  return clone(sport);
}

async function mockUpdate(value: string, input: UpdateSportTypeInput): Promise<SportType> {
  await delay();
  const sport = mockFind(value);
  const { name, ...rest } = input;
  return mockSave({
    ...sport,
    ...rest,
    name: name === undefined ? sport.name : name.trim() || undefined,
    subTypes: input.subTypes ? [...new Set(input.subTypes.map(slug))] : sport.subTypes,
    playerRoles: input.playerRoles
      ? [...new Set(input.playerRoles.map(slug))]
      : sport.playerRoles,
  });
}

async function mockRemove(value: string): Promise<{ deleted: true; value: string }> {
  await delay();
  const sport = mockFind(value);
  mockSportTypes = mockSportTypes.filter((s) => s.value !== sport.value);
  return { deleted: true, value: sport.value };
}

async function mockAddSubType(value: string, subType: string): Promise<SportType> {
  await delay();
  const sport = mockFind(value);
  const next = slug(subType);
  if (sport.subTypes.includes(next)) {
    throw new ApiError(409, `subType '${next}' already exists on sport type '${sport.value}'`, undefined);
  }
  return mockSave({ ...sport, subTypes: [...sport.subTypes, next] });
}

async function mockRenameSubType(value: string, subType: string, newName: string): Promise<SportType> {
  await delay();
  const sport = mockFind(value);
  const current = slug(subType);
  const next = slug(newName);
  if (!sport.subTypes.includes(current)) {
    throw new ApiError(404, `subType '${subType}' not found on sport type '${sport.value}'`, undefined);
  }
  if (next !== current && sport.subTypes.includes(next)) {
    throw new ApiError(409, `subType '${next}' already exists on sport type '${sport.value}'`, undefined);
  }
  return mockSave({ ...sport, subTypes: sport.subTypes.map((s) => (s === current ? next : s)) });
}

async function mockRemoveSubType(value: string, subType: string): Promise<SportType> {
  await delay();
  const sport = mockFind(value);
  const current = slug(subType);
  if (!sport.subTypes.includes(current)) {
    throw new ApiError(404, `subType '${subType}' not found on sport type '${sport.value}'`, undefined);
  }
  return mockSave({ ...sport, subTypes: sport.subTypes.filter((s) => s !== current) });
}

const path = (value: string, subType?: string) =>
  `/sport-types/${encodeURIComponent(value)}` +
  (subType === undefined ? '' : `/sub-types/${encodeURIComponent(subType)}`);

// --- public surface ---------------------------------------------------------
export const sportTypesApi = {
  /**
   * The whole list, in display order. The backend dropped `GET /sport-types`;
   * the list now ships inside the public `GET /configuration` payload.
   */
  async list(signal?: AbortSignal): Promise<SportType[]> {
    if (env.useMocks) return mockList();
    const res = await request<{ sportTypes: SportType[] }>('/configuration', {
      signal,
      auth: false,
    });
    return res.sportTypes;
  },

  /** GET /sport-types/:value */
  get(value: string, signal?: AbortSignal): Promise<SportType> {
    return env.useMocks ? mockGet(value) : request<SportType>(path(value), { signal });
  },

  /** POST /sport-types */
  create(input: CreateSportTypeInput): Promise<SportType> {
    return env.useMocks
      ? mockCreate(input)
      : request<SportType>('/sport-types', { method: 'POST', json: input });
  },

  /** PATCH /sport-types/:value */
  update(value: string, input: UpdateSportTypeInput): Promise<SportType> {
    return env.useMocks
      ? mockUpdate(value, input)
      : request<SportType>(path(value), { method: 'PATCH', json: input });
  },

  /** DELETE /sport-types/:value */
  remove(value: string): Promise<{ deleted: true; value: string }> {
    return env.useMocks
      ? mockRemove(value)
      : request<{ deleted: true; value: string }>(path(value), { method: 'DELETE' });
  },

  /** POST /sport-types/:value/sub-types */
  addSubType(value: string, subType: string): Promise<SportType> {
    return env.useMocks
      ? mockAddSubType(value, subType)
      : request<SportType>(`${path(value)}/sub-types`, {
          method: 'POST',
          json: { subType },
        });
  },

  /** PATCH /sport-types/:value/sub-types/:subType — body carries the new name. */
  renameSubType(value: string, subType: string, newName: string): Promise<SportType> {
    return env.useMocks
      ? mockRenameSubType(value, subType, newName)
      : request<SportType>(path(value, subType), {
          method: 'PATCH',
          json: { subType: newName },
        });
  },

  /** DELETE /sport-types/:value/sub-types/:subType */
  removeSubType(value: string, subType: string): Promise<SportType> {
    return env.useMocks
      ? mockRemoveSubType(value, subType)
      : request<SportType>(path(value, subType), { method: 'DELETE' });
  },
};
