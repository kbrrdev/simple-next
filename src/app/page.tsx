import Link from 'next/link';
import { Suspense } from 'react';
import { Loading } from '@/components/Loading';
import { getCategoryTree, getProducts } from '@/features/catalog/api';
import { CategoryList } from '@/features/catalog/CategoryList';
import { ProductGrid } from '@/features/catalog/ProductGrid';

async function Categories() {
  const categories = await getCategoryTree();
  if (categories.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Shop by category</h2>
      <CategoryList categories={categories} />
    </section>
  );
}

async function NewArrivals() {
  const { data: products } = await getProducts({ sort: 'newest', limit: 12 });
  return <ProductGrid products={products} empty="No products yet. Check back soon." />;
}

// Public data is cached for only 60 seconds, which Next.js keeps out of the instant page shell,
// so each section streams in behind its own placeholder.
export default function HomePage() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<Loading label="Loading categories..." />}>
        <Categories />
      </Suspense>
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">New arrivals</h2>
          <Link href="/search" className="text-sm underline">
            See all
          </Link>
        </div>
        <Suspense fallback={<Loading label="Loading products..." />}>
          <NewArrivals />
        </Suspense>
      </section>
    </div>
  );
}
