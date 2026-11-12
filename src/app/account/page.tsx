import type { Metadata } from 'next';
import { AccountSummary } from '@/features/auth/AccountSummary';
import { RequireAuth } from '@/features/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <RequireAuth>
        <AccountSummary />
      </RequireAuth>
    </div>
  );
}
