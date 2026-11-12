'use client';

import Link from 'next/link';
import { useCartCount } from './api';

export function CartLink() {
  const count = useCartCount();

  return (
    <Link href="/cart" className="hover:underline">
      Cart{count > 0 && ` (${count})`}
      {count > 0 && <span className="sr-only"> items</span>}
    </Link>
  );
}
