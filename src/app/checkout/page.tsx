import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckoutView } from '@/features/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 md:-ml-14">
        <Link
          href="/cart"
          aria-label="Back to cart"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted md:size-12"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
        <h1 className="text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">
          Confirm and pay
        </h1>
      </div>
      {/* The session depends on the current path, which is only known per request. */}
      <Suspense>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
