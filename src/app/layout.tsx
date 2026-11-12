import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { Providers } from '@/components/providers';
import { env } from '@/config/env';
import '@/styles/globals.css';

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: env.storeName, template: `%s | ${env.storeName}` },
  description: `Shop online at ${env.storeName}.`,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
              <Link href="/" className="font-semibold">
                {env.storeName}
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
