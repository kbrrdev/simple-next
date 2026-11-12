import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeGuestCart } from '@/features/cart/api';
import { request, setAccessToken } from '@/lib/api';
import { sessionKey, type User } from './session';

export { sessionKey, useSession, type User } from './session';

interface Credentials {
  email: string;
  password: string;
}

function login(credentials: Credentials) {
  return request<{ data: { user: User; accessToken: string } }>('/api/auth/login', {
    method: 'POST',
    body: { ...credentials, client: 'web' },
  });
}

/** Starts the session, then moves the guest cart into the account before moving on. */
function useStartSession() {
  const queryClient = useQueryClient();

  return async ({ data }: { data: { user: User; accessToken: string } }) => {
    setAccessToken(data.accessToken);
    queryClient.setQueryData(sessionKey, data.user);
    await mergeGuestCart(queryClient);
  };
}

export function useLogin() {
  const startSession = useStartSession();

  return useMutation({ mutationFn: login, onSuccess: startSession });
}

/** Registers, then logs in, as registering returns no session. */
export function useRegister() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await request('/api/auth/register', { method: 'POST', body: credentials });
      return login(credentials);
    },
    onSuccess: startSession,
  });
}

function useEndSession() {
  const queryClient = useQueryClient();

  return () => {
    setAccessToken(null);
    queryClient.setQueryData(sessionKey, null);
    // Drops the shopper's cached data. The session query stays, as the header watches it.
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] });
  };
}

export function useLogout() {
  const endSession = useEndSession();

  return useMutation({
    mutationFn: () => request('/api/auth/logout', { method: 'POST' }),
    // Logged out locally even when the request fails, as the session may already be gone.
    onSettled: endSession,
  });
}

/** Ends every session, on every device, including this one. */
export function useLogoutEverywhere() {
  const endSession = useEndSession();

  return useMutation({
    mutationFn: () => request('/api/auth/logout-all', { method: 'POST' }),
    // Only on success: if it failed, the other devices are still logged in, so the shopper
    // stays here to try again.
    onSuccess: endSession,
  });
}

/** Changes the password. The API keeps this session, and ends the others. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      request('/api/auth/change-password', { method: 'POST', body }),
  });
}
