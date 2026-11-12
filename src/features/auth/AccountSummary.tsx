'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout, useSession } from './api';

const sections = [
  { href: '/account/orders', label: 'Orders', text: 'Track orders, send payment references.' },
  { href: '/account/addresses', label: 'Addresses', text: 'Your saved shipping addresses.' },
  { href: '/account/security', label: 'Security', text: 'Change your password, log out.' },
];

export function AccountSummary() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <p>
        Logged in as <span className="font-medium">{user?.email}</span>
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {sections.map(({ href, label, text }) => (
          <li key={href}>
            <Link href={href} className="block h-full rounded-md border p-4 hover:bg-muted">
              <span className="font-medium">{label}</span>
              <span className="block text-sm text-muted-foreground">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        disabled={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
      >
        {logout.isPending ? 'Logging out...' : 'Log out'}
      </Button>
    </div>
  );
}
