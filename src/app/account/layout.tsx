import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountNav } from '@/features/account/AccountNav';

export const metadata: Metadata = {
  robots: { index: false },
};

// Each page guards itself with RequireAuth, so that this layout always renders its page, and
// Next.js can check the page for instant navigation.
export default function AccountLayout({ children }: LayoutProps<'/account'>) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Reads the current path, which is only known per request. */}
      <Suspense>
        <AccountNav />
      </Suspense>
      {children}
    </div>
  );
}
