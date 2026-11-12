'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loading } from '@/components/Loading';
import { useSession } from './api';
import { loginHref } from './redirect';

/** Shows its children to logged-in shoppers, and sends everyone else to log in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isSuccess } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const loggedOut = isSuccess && user === null;

  useEffect(() => {
    if (loggedOut) router.replace(loginHref(pathname + window.location.search));
  }, [loggedOut, pathname, router]);

  if (!user) return <Loading label="Loading..." />;

  return children;
}
