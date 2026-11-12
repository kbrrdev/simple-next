import Image from 'next/image';
import Link from 'next/link';
import { brandLogo } from '@/config/brand';
import { env } from '@/config/env';

/** The store's logo from `src/config/brand.ts`, or its name as a wordmark. */
export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${env.storeName}, home`}>
      {brandLogo ? (
        <Image
          src={brandLogo.src}
          alt=""
          width={brandLogo.width}
          height={brandLogo.height}
          priority
          className="h-8 w-auto"
        />
      ) : (
        <span className="text-xl font-extrabold tracking-tight text-brand">{env.storeName}</span>
      )}
    </Link>
  );
}
