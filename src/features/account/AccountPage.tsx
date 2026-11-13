import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { RequireAuth } from '@/features/auth/RequireAuth';

/**
 * An account page: a breadcrumb back to the account on its sub-pages, the heading, then the
 * content once the shopper is known to be logged in.
 */
export function AccountPage({
  title,
  subpage = true,
  children,
}: {
  title: string;
  /** False on the account overview itself, which needs no way back. */
  subpage?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        {subpage && (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm">
              <li>
                <Link href="/account" className="font-semibold hover:underline">
                  Account
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </li>
              <li aria-current="page" className="text-muted-foreground">
                {title}
              </li>
            </ol>
          </nav>
        )}
        <h1 className="text-[2rem] font-semibold tracking-tight">{title}</h1>
      </div>
      {/* RequireAuth reads the current path, which is only known per request. */}
      <Suspense>
        <RequireAuth>{children}</RequireAuth>
      </Suspense>
    </div>
  );
}
