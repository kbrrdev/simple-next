'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/security', label: 'Security' },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex gap-4 overflow-x-auto border-b text-sm">
      {links.map(({ href, label }) => {
        const current = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 py-2 whitespace-nowrap',
              current ? 'border-foreground font-medium' : 'border-transparent hover:underline',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
