import Link from 'next/link';
import { getCategoryTree, getProducts } from '@/features/catalog/api';
import { CategoryList } from '@/features/catalog/CategoryList';
import { ProductGrid } from '@/features/catalog/ProductGrid';

export default async function HomePage() {
  const [categories, { data: products }] = await Promise.all([
    getCategoryTree(),
    getProducts({ sort: 'newest', limit: 12 }),
  ]);

  return (
    <div className="space-y-10">
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <CategoryList categories={categories} />
        </section>
      )}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">New arrivals</h2>
          <Link href="/search" className="text-sm underline">
            See all
          </Link>
        </div>
        <ProductGrid products={products} empty="No products yet. Check back soon." />
      </section>
    </div>
  );
}
