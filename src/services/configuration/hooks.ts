import { useQuery } from '@tanstack/react-query';
import { configurationApi } from './api';

export const configurationKeys = {
  all: ['configuration'] as const,
};

/** `GET /configuration` — rarely changes, so it's cached for the session. */
export function useConfiguration() {
  return useQuery({
    queryKey: configurationKeys.all,
    queryFn: ({ signal }) => configurationApi.get(signal),
    staleTime: Infinity,
  });
}
