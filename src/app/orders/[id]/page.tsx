import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { OrderView } from '@/features/orders/OrderView';

export const metadata: Metadata = {
  title: 'Order',
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">Your order</h1>
      {/* The order ID comes from the URL, which is only known per request. */}
      <Suspense>
        <RequireAuth>
          <OrderView />
        </RequireAuth>
      </Suspense>
    </div>
  );
}
