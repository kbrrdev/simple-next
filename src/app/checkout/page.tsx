import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutView } from '@/features/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      {/* The session depends on the current path, which is only known per request. */}
      <Suspense>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
