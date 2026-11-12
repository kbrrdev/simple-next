import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { refreshSession, request, setAccessToken, type Schemas } from '@/lib/api';

export type User = Schemas['User'];

interface Credentials {
  email: string;
  password: string;
}

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

function login(credentials: Credentials) {
  return request<{ data: { user: User; accessToken: string } }>('/api/auth/login', {
    method: 'POST',
    body: { ...credentials, client: 'web' },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(sessionKey, data.user);
    },
  });
}

/** Registers, then logs in, as registering returns no session. */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await request('/api/auth/register', { method: 'POST', body: credentials });
      return login(credentials);
    },
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(sessionKey, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => request('/api/auth/logout', { method: 'POST' }),
    // Logged out locally even when the request fails, as the session may already be gone.
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(sessionKey, null);
      // Drops the shopper's cached data. The session query stays, as the header watches it.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] });
    },
  });
}
