import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retrying only helps with network failures. API errors would fail the same way again.
        retry: (failureCount, error) => !(error instanceof ApiError) && failureCount < 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
