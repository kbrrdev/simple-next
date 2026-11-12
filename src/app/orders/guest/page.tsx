import type { Metadata } from 'next';
import { GuestOrderView } from '@/features/orders/GuestOrderView';

// The link holds a private token, so this page stays out of search engines. next.config.ts also
// sends Referrer-Policy: no-referrer for it.
export const metadata: Metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
};

export default function GuestOrderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Your order</h1>
      <GuestOrderView />
    </div>
  );
}
