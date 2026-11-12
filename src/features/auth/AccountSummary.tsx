'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout, useSession } from './api';

export function AccountSummary() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <p>
        Logged in as <span className="font-medium">{user?.email}</span>
      </p>
      <Button
        variant="outline"
        disabled={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
      >
        {logout.isPending ? 'Logging out...' : 'Log out'}
      </Button>
    </div>
  );
}
