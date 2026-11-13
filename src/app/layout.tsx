import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Suspense } from 'react';
import { PhoneSearch } from '@/components/layout/HeaderSearch';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Providers } from '@/components/providers';
import { env } from '@/config/env';
import '@/styles/globals.css';

// Downloaded at build time and served from this site, so no font service is called.
const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: env.storeName, template: `%s | ${env.storeName}` },
  description: `Shop online at ${env.storeName}.`,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      {/* Room at the bottom on phones, so the tab bar never covers the footer. */}
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <Providers>
          <SiteHeader />
          <main className="page-x flex-1 py-6 md:py-8">{children}</main>
          <SiteFooter />
          {/* Both read the current path, which is only known per request. */}
          <Suspense>
            <PhoneSearch />
            <MobileTabBar />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
