import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/features/search/SearchBox';
import { AccountMenu } from './AccountMenu';
import { CartButton } from './CartButton';
import { HeaderSearch } from './HeaderSearch';
import { Logo } from './Logo';

/**
 * The header: the store's logo, the product search in the middle, and the cart and account menu on
 * the right. On phones it holds only the logo, as search, the cart, and the account live in the
 * tab bar at the bottom.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background">
      <div className="page-x grid h-14 grid-cols-1 items-center gap-4 md:h-24 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <Logo />
        <div className="hidden min-w-0 justify-center md:flex md:w-[min(42rem,48vw)]">
          {/* The fallback is the same search box, so the header keeps its shape while it loads. */}
          <Suspense fallback={<SearchBox categories={[]} />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <nav aria-label="Main" className="hidden items-center justify-end gap-2 md:flex">
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
