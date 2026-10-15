import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { delay } from '@/lib/api/mock';
import type { Configuration } from './types';

async function mockGet(): Promise<Configuration> {
  await delay();
  return {
    regions: {
      myanmar: [
        { id: 'yangon', name: 'Yangon' },
        { id: 'mandalay', name: 'Mandalay' },
      ],
      th: [{ id: 'bangkok', name: 'Bangkok' }],
    },
    sportTypes: [
      { value: 'football', name: 'Football', subTypes: [], sortOrder: 1, matchProvided: true },
      { value: 'futsal', name: 'Futsal', subTypes: [], sortOrder: 2, matchProvided: true },
      { value: 'badminton', name: 'Badminton', subTypes: [], sortOrder: 3, matchProvided: false },
    ],
  };
}

export const configurationApi = {
  /** GET /configuration — public reference data (regions, sport types). */
  get(signal?: AbortSignal): Promise<Configuration> {
    return env.useMocks
      ? mockGet()
      : request<Configuration>('/configuration', { signal, auth: false });
  },
};
