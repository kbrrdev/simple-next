import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { SearchForm } from '@/components/SearchForm';
import { env } from '@/config/env';
import { AccountLink } from '@/features/auth/AccountLink';
import '@/styles/globals.css';

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: env.storeName, template: `%s | ${env.storeName}` },
  description: `Shop online at ${env.storeName}.`,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
              <Link href="/" className="font-semibold">
                {env.storeName}
              </Link>
              <SearchForm />
              <nav aria-label="Main" className="flex gap-4 text-sm">
                <Link href="/blogs" className="hover:underline">
                  Blog
                </Link>
                {/* Reads the current path, which is only known per request. */}
                <Suspense>
                  <AccountLink />
                </Suspense>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
