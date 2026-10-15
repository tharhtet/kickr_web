import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { clone, delay } from '@/lib/api/mock';
import { ApiError } from '@/lib/api/errors';
import type {
  AppConfigInput,
  AppConfigRevision,
  Platform,
  UpdateAppConfigInput,
} from './types';

/**
 * Typed client for the kickr backend `app-config` endpoints. History reads
 * are public; writes are superadmin only. Every write saves a NEW revision —
 * there is no delete.
 *
 * Same mock/live split as `authApi` — `env.useMocks` (VITE_USE_MOCKS)
 * picks the implementation.
 */

// --- mock state (module-scoped so edits persist within a session) ------------
const appUpdatePlatform = {
  latestVersion: '1.0.1',
  minimumVersion: '1.0.0',
  upgradeTitle: 'A new version is available',
  upgradeDescription: 'Please update the app to enjoy the latest features and improvements.',
  forceUpdate: false,
};
const majorUpdatePlatform = {
  enabled: true,
  title: 'Major Update Available',
  description:
    "We've made major improvements to the app. Please update to the latest version.",
  version: '1.0.0',
};

let mockRevisions: AppConfigRevision[] = [
  {
    revision: 1,
    appUpdate: { ios: { ...appUpdatePlatform }, android: { ...appUpdatePlatform } },
    majorUpdate: { ios: { ...majorUpdatePlatform }, android: { ...majorUpdatePlatform } },
    updatedBy: null,
    createdAt: new Date().toISOString(),
  },
];

async function mockHistory(limit: number, before?: number): Promise<AppConfigRevision[]> {
  await delay();
  return clone(
    [...mockRevisions]
      .sort((a, b) => b.revision - a.revision)
      .filter((r) => before === undefined || r.revision < before)
      .slice(0, limit),
  );
}

async function mockRevision(revision: number): Promise<AppConfigRevision> {
  await delay();
  const row = mockRevisions.find((r) => r.revision === revision);
  if (!row) {
    throw new ApiError(404, `App config revision ${revision} not found`, undefined);
  }
  return clone(row);
}

function mockInsert(config: AppConfigInput): AppConfigRevision {
  const row: AppConfigRevision = {
    ...clone(config),
    revision: Math.max(0, ...mockRevisions.map((r) => r.revision)) + 1,
    updatedBy: null,
    createdAt: new Date().toISOString(),
  };
  mockRevisions = [...mockRevisions, row];
  return clone(row);
}

async function mockCreate(input: AppConfigInput): Promise<AppConfigRevision> {
  await delay();
  return mockInsert(input);
}

async function mockUpdate(input: UpdateAppConfigInput): Promise<AppConfigRevision> {
  await delay();
  const [latest] = await mockHistory(1);
  if (!latest) {
    throw new ApiError(404, 'App config has not been set', undefined);
  }
  const platforms: Platform[] = ['ios', 'android'];
  const next: AppConfigInput = {
    appUpdate: { ...latest.appUpdate },
    majorUpdate: { ...latest.majorUpdate },
  };
  for (const p of platforms) {
    next.appUpdate[p] = { ...latest.appUpdate[p], ...input.appUpdate?.[p] };
    next.majorUpdate[p] = { ...latest.majorUpdate[p], ...input.majorUpdate?.[p] };
  }
  return mockInsert(next);
}

// --- public surface ---------------------------------------------------------
export const appConfigApi = {
  /** GET /app-config/history — newest first; the first row is the live one. */
  history(
    { limit = 20, before }: { limit?: number; before?: number } = {},
    signal?: AbortSignal,
  ): Promise<AppConfigRevision[]> {
    return env.useMocks
      ? mockHistory(limit, before)
      : request<AppConfigRevision[]>('/app-config/history', {
          query: { limit, before },
          signal,
          auth: false,
        });
  },

  /** GET /app-config/history/:revision */
  revision(revision: number, signal?: AbortSignal): Promise<AppConfigRevision> {
    return env.useMocks
      ? mockRevision(revision)
      : request<AppConfigRevision>(`/app-config/history/${revision}`, {
          signal,
          auth: false,
        });
  },

  /** POST /app-config — saves a complete config as the new latest revision. */
  create(input: AppConfigInput): Promise<AppConfigRevision> {
    return env.useMocks
      ? mockCreate(input)
      : request<AppConfigRevision>('/app-config', { method: 'POST', json: input });
  },

  /** PATCH /app-config — applies the sent fields on top of the latest revision. */
  update(input: UpdateAppConfigInput): Promise<AppConfigRevision> {
    return env.useMocks
      ? mockUpdate(input)
      : request<AppConfigRevision>('/app-config', { method: 'PATCH', json: input });
  },
};
