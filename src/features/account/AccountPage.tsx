import { Suspense, type ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/RequireAuth';

/** An account page: its heading, then its content once the shopper is known to be logged in. */
export function AccountPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {/* RequireAuth reads the current path, which is only known per request. */}
      <Suspense>
        <RequireAuth>{children}</RequireAuth>
      </Suspense>
    </div>
  );
}
