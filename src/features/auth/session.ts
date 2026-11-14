import { useQuery, type QueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { refreshSession, request, type Schemas } from '@/lib/api';

export type User = Schemas['User'];

export const sessionKey = ['session'];

// These pages work without a session, so they skip the request that restores it.
const pagesWithoutSession = ['/login', '/register', '/forgot-password', '/reset-password'];

/** The logged-in user, or null. On first load, the refresh cookie restores the session. */
async function loadSession(): Promise<User | null> {
  if (!(await refreshSession())) return null;

  const { data } = await request<{ data: User }>('/api/auth/me');
  return data;
}

function subscribeToNothing() {
  return () => {};
}

/** False while the server renders and while the page hydrates, then true. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * The logged-in user (`data`), null when logged out, while `isPending` until known. Parts of a
 * page hydrate at different times, and the session can arrive in between, so until a part has
 * hydrated it reports the session as loading, as the server rendered it.
 */
export function useSession() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useQuery({
    queryKey: sessionKey,
    queryFn: loadSession,
    staleTime: Infinity,
    retry: false,
    enabled: !pagesWithoutSession.includes(pathname),
  });

  if (!hydrated) return { data: undefined, isPending: true, isSuccess: false };
  return { data: session.data, isPending: session.isPending, isSuccess: session.isSuccess };
}

/** The session, waiting for it to load first, so that an early click knows who is shopping. */
export function ensureSession(queryClient: QueryClient) {
  return queryClient.ensureQueryData({ queryKey: sessionKey, queryFn: loadSession });
}
