'use client';

import { CircleUserRound, Search, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/api';
import { useCartCount } from '@/features/cart/api';
import { cn } from '@/lib/utils';

/** The tab bar along the bottom on phones. Checkout hides it, to keep the focus on paying. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { data: user } = useSession();
  const count = useCartCount();

  if (pathname.startsWith('/checkout')) return null;

  const tabs = [
    {
      href: '/',
      label: 'Shop',
      icon: Store,
      active:
        pathname === '/' || pathname.startsWith('/categories') || pathname.startsWith('/products'),
    },
    { href: '/search', label: 'Search', icon: Search, active: pathname === '/search' },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, active: pathname === '/cart', badge: count },
    {
      href: user ? '/account' : '/login',
      label: user ? 'Account' : 'Log in',
      icon: CircleUserRound,
      active: pathname.startsWith('/account') || pathname === '/login' || pathname === '/register',
    },
  ];

  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-16 grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={label}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem]',
                active ? 'font-semibold text-brand' : 'text-muted-foreground',
              )}
            >
              <span className="relative">
                <Icon aria-hidden className="size-6" strokeWidth={active ? 2.25 : 1.75} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.625rem] font-bold text-brand-foreground tabular-nums">
                    {badge > 99 ? '99+' : badge}
                    <span className="sr-only"> items</span>
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
