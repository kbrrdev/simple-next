'use client';

import Link from 'next/link';
import { useSession } from './api';

export function AccountLink() {
  const { data: user, isPending } = useSession();

  // Nothing while the session loads, so that the link does not flicker.
  if (isPending) return null;

  return user ? (
    <Link href="/account" className="hover:underline">
      Account
    </Link>
  ) : (
    <Link href="/login" className="hover:underline">
      Log in
    </Link>
  );
}
