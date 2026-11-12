import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { sessionKey } from '@/features/auth/api';
import { ApiError, setAccessToken } from './api';

export function createQueryClient() {
  /** A 401 that survived a refresh means the session is over. */
  function endSessionOn401(error: Error) {
    if (error instanceof ApiError && error.status === 401) {
      setAccessToken(null);
      queryClient.setQueryData(sessionKey, null);
    }
  }

  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: endSessionOn401 }),
    mutationCache: new MutationCache({ onError: endSessionOn401 }),
    defaultOptions: {
      queries: {
        // Retrying only helps with network failures. API errors would fail the same way again.
        retry: (failureCount, error) => !(error instanceof ApiError) && failureCount < 2,
        refetchOnWindowFocus: false,
      },
    },
  });

  return queryClient;
}
