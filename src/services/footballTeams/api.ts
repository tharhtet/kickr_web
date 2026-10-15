import { env } from '@/config/env';
import { request } from '@/lib/api/http';
import { delay } from '@/lib/api/mock';
import type { FootballTeam } from './types';

async function mockList(): Promise<FootballTeam[]> {
  await delay();
  return ['Arsenal', 'Barcelona', 'Liverpool', 'Manchester United', 'Real Madrid'].map(
    (name, i) => ({ _id: `68b9c1aa22bb33cc44dd000${i}`, name, sortOrder: i + 1 }),
  );
}

export const footballTeamsApi = {
  /** GET /global-football-teams — the full club list in display order (not paginated). */
  list(signal?: AbortSignal): Promise<FootballTeam[]> {
    return env.useMocks
      ? mockList()
      : request<FootballTeam[]>('/global-football-teams', { signal });
  },
};
