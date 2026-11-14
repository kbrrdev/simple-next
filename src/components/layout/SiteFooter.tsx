import { cacheLife } from 'next/cache';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { env } from '@/config/env';
import { getCategoryTree } from '@/features/catalog/api';
import { StoreContact } from '@/features/store/StoreContact';
import { getPages, getStoreInfo } from '@/features/store/api';

// The current time cannot be read while prerendering, so the year is cached for a day.
async function CopyrightYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

const linkClass = 'text-sm hover:underline';

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

async function ShopLinks() {
  const categories = await getCategoryTree();

  return (
    <>
      {categories.map((category) => (
        <li key={category.id}>
          <Link href={`/categories/${category.id}`} className={linkClass}>
            {category.name}
          </Link>
        </li>
      ))}
    </>
  );
}

async function PageLinks() {
  const pages = await getPages();

  return (
    <>
      {pages.map((page) => (
        <li key={page.id}>
          <Link href={`/pages/${page.slug}`} className={linkClass}>
            {page.title}
          </Link>
        </li>
      ))}
    </>
  );
}

async function ContactDetails() {
  return <StoreContact info={await getStoreInfo()} />;
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline bg-muted">
      <div className="page-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <Column title="Shop">
          <li>
            <Link href="/products" className={linkClass}>
              All products
            </Link>
          </li>
          <Suspense>
            <ShopLinks />
          </Suspense>
        </Column>
        <Column title="Help">
          <li>
            <Link href="/account/orders" className={linkClass}>
              Your orders
            </Link>
          </li>
          <li>
            <Link href="/cart" className={linkClass}>
              Cart
            </Link>
          </li>
          <li>
            <Link href="/account" className={linkClass}>
              Account
            </Link>
          </li>
        </Column>
        <Column title={env.storeName}>
          <li>
            <Link href="/blogs" className={linkClass}>
              Blog
            </Link>
          </li>
          <Suspense>
            <PageLinks />
          </Suspense>
        </Column>
        <Column title="Contact">
          <Suspense>
            <ContactDetails />
          </Suspense>
        </Column>
      </div>
      <div className="page-x flex flex-col gap-2 border-t border-border py-6 text-sm sm:flex-row sm:justify-between">
        <p>
          © <CopyrightYear /> {env.storeName}
        </p>
        <p className="text-muted-foreground">Prices in PHP · Ships within the Philippines</p>
      </div>
    </footer>
  );
}
