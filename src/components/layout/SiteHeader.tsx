import Link from 'next/link';
import { Suspense } from 'react';
import { AccountMenu } from './AccountMenu';
import { CartButton } from './CartButton';
import { HeaderSearch } from './HeaderSearch';
import { Logo } from './Logo';
import { SearchPill } from './SearchPill';

/**
 * The header: the store's logo, the search pill in the middle, and the cart and account menu on
 * the right. On phones the cart and account move to the tab bar at the bottom.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background">
      <div className="page-x grid h-[4.5rem] grid-cols-[auto_1fr] items-center gap-4 md:h-24 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <Logo />
        <div className="flex min-w-0 justify-center md:w-[min(42rem,48vw)]">
          {/* The fallback is the same pill, so the header keeps its shape while it loads. */}
          <Suspense fallback={<SearchPill categories={[]} />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <nav aria-label="Main" className="hidden items-center justify-end gap-1 md:flex">
          <Link
            href="/blogs"
            className="rounded-full px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Blog
          </Link>
          {/* Both read the session, which depends on the current path. */}
          <Suspense>
            <CartButton />
            <AccountMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
