import type { Metadata } from 'next';
import { CartView } from '@/features/cart/CartView';

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <CartView />
    </div>
  );
}
