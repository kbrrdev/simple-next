'use client';

import { CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout, useSession } from '@/features/auth/api';
import { headerButtonClass } from './header-button';

/** The round button at the header's right: a menu of account pages, or of logging in. */
export function AccountMenu() {
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user ? 'Account menu' : 'Log in or sign up'}
        className={headerButtonClass}
      >
        <CircleUserRound aria-hidden className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl border-hairline py-2 shadow-float"
      >
        {user ? (
          <>
            <DropdownMenuLabel className="truncate px-4 py-2 font-normal text-muted-foreground">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="px-4 py-2.5 font-semibold">
              <Link href="/account/orders">Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-4 py-2.5">
              <Link href="/account/addresses">Addresses</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-4 py-2.5">
              <Link href="/account">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild className="px-4 py-2.5">
              <Link href="/blogs">Blog</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-4 py-2.5"
              onSelect={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
            >
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild className="px-4 py-2.5 font-semibold">
              <Link href="/login">Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-4 py-2.5">
              <Link href="/register">Sign up</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem asChild className="px-4 py-2.5">
              <Link href="/blogs">Blog</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
