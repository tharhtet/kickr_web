import { useQuery } from '@tanstack/react-query';
import { sportTypesApi } from './api';

export const sportTypesKeys = {
  all: ['sport-types'] as const,
};

/** `GET /sport-types` */
export function useSportTypes() {
  return useQuery({
    queryKey: sportTypesKeys.all,
    queryFn: ({ signal }) => sportTypesApi.list(signal),
  });
}
