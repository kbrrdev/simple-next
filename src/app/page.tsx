import Link from 'next/link';
import { Suspense } from 'react';
import { CategoryTabsSkeleton, ProductGridSkeleton } from '@/components/skeletons';
import { env } from '@/config/env';
import { getProducts } from '@/features/catalog/api';
import { CategoryTabs } from '@/features/catalog/CategoryTabs';
import { ProductGrid } from '@/features/catalog/ProductGrid';

const homeProducts = 20;

async function NewArrivals() {
  const { data: products, meta } = await getProducts({ sort: 'newest', limit: homeProducts });

  return (
    <>
      <ProductGrid products={products} empty="No products yet. Check back soon." />
      {meta.total > products.length && (
        <div className="flex flex-col items-center gap-4 pt-14">
          <p className="text-lg font-semibold">Continue exploring</p>
          <Link
            href="/search"
            className="rounded-lg bg-foreground px-6 py-3 font-semibold text-background transition-opacity hover:opacity-90"
          >
            Show all {meta.total.toLocaleString('en-PH')} products
          </Link>
        </div>
      )}
    </>
  );
}

// Public data is cached for only 60 seconds, which Next.js keeps out of the instant page shell,
// so each part streams in behind its own placeholder.
export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">{env.storeName}</h1>
      <Suspense fallback={<CategoryTabsSkeleton />}>
        <CategoryTabs activeId={null} />
      </Suspense>
      <div className="pt-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <NewArrivals />
        </Suspense>
      </div>
    </>
  );
}
