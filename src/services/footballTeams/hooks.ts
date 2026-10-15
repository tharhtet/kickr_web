import { useQuery } from '@tanstack/react-query';
import { footballTeamsApi } from './api';

export const footballTeamsKeys = {
  all: ['footballTeams'] as const,
};

/** `GET /global-football-teams` — fixed, server-seeded list. */
export function useFootballTeams(enabled = true) {
  return useQuery({
    queryKey: footballTeamsKeys.all,
    queryFn: ({ signal }) => footballTeamsApi.list(signal),
    staleTime: Infinity,
    enabled,
  });
}
