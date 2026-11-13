'use client';

import { MapPin, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout, useSession } from './api';

const sections = [
  {
    href: '/account/orders',
    label: 'Orders',
    text: 'Track your orders, and send payment references.',
    icon: Package,
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    text: 'The shipping addresses you check out with.',
    icon: MapPin,
  },
  {
    href: '/account/security',
    label: 'Security',
    text: 'Change your password, or log out on every device.',
    icon: ShieldCheck,
  },
];

/** The account overview: who is logged in, the account's sections as cards, and Log out. */
export function AccountSummary() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  return (
    <div className="space-y-10">
      <p className="-mt-6 text-lg text-muted-foreground">{user?.email}</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, label, text, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full flex-col rounded-xl p-5 shadow-float transition-shadow hover:shadow-[0_6px_20px_rgb(0_0_0/0.2)]"
            >
              <Icon aria-hidden className="size-8" strokeWidth={1.5} />
              <span className="mt-8 font-semibold">{label}</span>
              <span className="mt-1 text-sm text-muted-foreground">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="lg"
        className="border-foreground"
        disabled={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
      >
        {logout.isPending ? 'Logging out...' : 'Log out'}
      </Button>
    </div>
  );
}
