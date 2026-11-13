import type { Metadata } from 'next';
import { CartView } from '@/features/cart/CartView';

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">Cart</h1>
      <CartView />
    </div>
  );
}
