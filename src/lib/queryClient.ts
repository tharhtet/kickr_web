import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry auth / not-found / validation errors.
        if (isApiError(error) && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
