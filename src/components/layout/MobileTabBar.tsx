'use client';

import { CircleUserRound, House, LayoutGrid, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth/api';
import { searchTabId } from '@/features/search/SearchBox';
import { searchScreen, useSearchScreenOpen } from '@/features/search/search-screen';
import { cn } from '@/lib/utils';

/**
 * The tab bar along the bottom on phones: Home, Search, Products, and the account. The cart lives
 * in the header, as in most shopping apps. The bar stays above the full-screen search, and
 * checkout hides it, to keep the focus on paying.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { data: user } = useSession();
  const searchOpen = useSearchScreenOpen();

  if (pathname.startsWith('/checkout')) return null;

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: House,
      active: !searchOpen && pathname === '/',
    },
    // Opens and closes the full-screen search, rather than going to a page.
    {
      href: '/search',
      label: 'Search',
      icon: Search,
      active: searchOpen,
      opensSearch: true,
    },
    {
      href: '/products',
      label: 'Products',
      icon: LayoutGrid,
      active:
        !searchOpen &&
        (pathname.startsWith('/products') ||
          pathname.startsWith('/categories') ||
          pathname === '/search'),
    },
    {
      href: user ? '/account' : '/login',
      label: user ? 'Account' : 'Log in',
      icon: CircleUserRound,
      active:
        !searchOpen &&
        (pathname.startsWith('/account') || pathname === '/login' || pathname === '/register'),
    },
  ];

  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-16 grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, active, opensSearch }) => {
          const className = cn(
            'flex h-full w-full flex-col items-center justify-center gap-1 text-[0.6875rem]',
            active ? 'font-semibold text-brand' : 'text-muted-foreground',
          );
          const content = (
            <>
              <Icon aria-hidden className="size-6" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </>
          );

          return (
            <li key={label}>
              {opensSearch ? (
                <button
                  id={searchTabId}
                  type="button"
                  aria-pressed={active}
                  onClick={searchScreen.toggle}
                  className={className}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  // Also closes the search when the tab's page is already open.
                  onClick={searchScreen.close}
                  className={className}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
