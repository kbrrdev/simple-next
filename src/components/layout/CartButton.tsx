'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartCount } from '@/features/cart/api';
import { headerButtonClass } from './header-button';

export function CartButton() {
  const count = useCartCount();
  const label = count === 0 ? 'Cart' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`;

  return (
    <Link href="/cart" aria-label={label} className={headerButtonClass}>
      <ShoppingBag aria-hidden className="size-5" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-brand px-1 text-[0.6875rem] font-bold text-brand-foreground tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
