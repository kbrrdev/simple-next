import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FallbackImage } from '@/components/FallbackImage';
import { ScrollRow } from '@/components/ScrollRow';
import { cn } from '@/lib/utils';
import { findCategory, getCategoryTree, type CategoryNode } from './api';

function Tab({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex shrink-0 flex-col items-center gap-2 border-b-2 pt-1 pb-3 text-xs font-semibold whitespace-nowrap transition-colors',
        active
          ? 'border-foreground text-foreground'
          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
      )}
    >
      {children}
      {label}
    </Link>
  );
}

/**
 * The row of top-level categories under the header, each with its image as an icon. It stays in
 * view while the shopper scrolls through products.
 */
export async function CategoryTabs({ activeId }: { activeId: string | null }) {
  const categories = await getCategoryTree();
  if (categories.length === 0) return null;

  return (
    <div className="sticky top-14 z-30 -mx-6 -mt-6 bg-background px-6 pt-4 shadow-[0_1px_0_var(--hairline)] md:top-24 md:-mx-10 md:-mt-8 md:px-10 xl:-mx-20 xl:px-20">
      <ScrollRow label="Categories">
        <nav aria-label="Categories" className="flex gap-8">
          <Tab href="/products" label="All" active={activeId === null}>
            <LayoutGrid aria-hidden className="size-6" strokeWidth={1.75} />
          </Tab>
          {categories.map((category) => (
            <Tab
              key={category.id}
              href={`/categories/${category.id}`}
              label={category.name}
              active={category.id === activeId}
            >
              <span className="relative size-6 overflow-hidden rounded-full bg-muted opacity-80 group-hover:opacity-100 group-aria-[current=page]:opacity-100">
                {category.imageUrl && (
                  <FallbackImage
                    src={category.imageUrl}
                    iconClassName="size-3"
                    alt=""
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                )}
              </span>
            </Tab>
          ))}
        </nav>
      </ScrollRow>
    </div>
  );
}

/**
 * The home page's top-level categories, as large round images under the banners. Unlike the tabs,
 * it scrolls away with the page, as the home page has nothing to filter.
 */
export async function ShopByCategory() {
  const categories = await getCategoryTree();
  if (categories.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">Shop by category</h2>
      <ScrollRow label="Shop by category">
        <ul className="flex gap-4 md:gap-8">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.id}`}
                className="group flex w-20 flex-col items-center gap-2 text-center text-sm font-medium md:w-24"
              >
                <span className="relative size-16 overflow-hidden rounded-full bg-muted transition-transform group-hover:scale-105 md:size-20">
                  {category.imageUrl && (
                    <FallbackImage
                      src={category.imageUrl}
                      iconClassName="size-5"
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="line-clamp-2">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollRow>
    </section>
  );
}

/** The top-level category that holds a category, for the selected tab. */
export function rootCategoryId(tree: CategoryNode[], id: string) {
  return tree.find((node) => findCategory([node], id))?.id ?? null;
}
