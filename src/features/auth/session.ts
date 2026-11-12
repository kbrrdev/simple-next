import { useQuery, type QueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { refreshSession, request, type Schemas } from '@/lib/api';

export type User = Schemas['User'];

export const sessionKey = ['session'];

// These pages work without a session, so they skip the request that restores it.
const pagesWithoutSession = ['/login', '/register'];

/** The logged-in user, or null. On first load, the refresh cookie restores the session. */
async function loadSession(): Promise<User | null> {
  if (!(await refreshSession())) return null;

  const { data } = await request<{ data: User }>('/api/auth/me');
  return data;
}

export function useSession() {
  const pathname = usePathname();

  return useQuery({
    queryKey: sessionKey,
    queryFn: loadSession,
    staleTime: Infinity,
    retry: false,
    enabled: !pagesWithoutSession.includes(pathname),
  });
}

/** The session, waiting for it to load first, so that an early click knows who is shopping. */
export function ensureSession(queryClient: QueryClient) {
  return queryClient.ensureQueryData({ queryKey: sessionKey, queryFn: loadSession });
}
