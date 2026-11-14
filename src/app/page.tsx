import Link from 'next/link';
import { Suspense } from 'react';
import { BannerSkeleton, ProductRowSkeleton, ShopByCategorySkeleton } from '@/components/skeletons';
import { env } from '@/config/env';
import { getBanners } from '@/features/banners/api';
import { BannerCarousel } from '@/features/banners/BannerCarousel';
import { getCategoryTree, getProducts } from '@/features/catalog/api';
import { ShopByCategory } from '@/features/catalog/CategoryTabs';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductRow } from '@/features/catalog/ProductRow';

const rowSize = 8;

async function Banners() {
  return <BannerCarousel banners={await getBanners()} />;
}

function newest() {
  return getProducts({ sort: 'newest', limit: rowSize });
}

async function NewArrivals() {
  const { data: products } = await newest();
  if (products.length === 0) {
    return <ProductGrid products={products} empty="No products yet. Check back soon." />;
  }

  return <ProductRow title="New arrivals" href="/products" products={products} />;
}

/** Products a current sale covers. Left out when nothing is on sale. */
async function OnSale() {
  const { data: products } = await getProducts({ onSale: true, limit: rowSize });
  return <ProductRow title="On sale" href="/products?onSale=true" products={products} />;
}

/** A row for each top-level category, which includes its subcategories' products. */
async function CategoryRows() {
  const categories = await getCategoryTree();
  const rows = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: (await getProducts({ categoryId: category.id, limit: rowSize })).data,
    })),
  );

  return rows.map(({ category, products }) => (
    <ProductRow
      key={category.id}
      title={category.name}
      href={`/categories/${category.id}`}
      products={products}
    />
  ));
}

async function ShowAll() {
  const { meta } = await newest();
  if (meta.total === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <p className="text-lg font-semibold">Continue exploring</p>
      <Link
        href="/products"
        className="rounded-lg bg-foreground px-6 py-3 font-semibold text-background transition-opacity hover:opacity-90"
      >
        Show all {meta.total.toLocaleString('en-PH')} products
      </Link>
    </div>
  );
}

// Public data is cached for only 60 seconds, which Next.js keeps out of the instant page shell,
// so each part streams in behind its own placeholder.
export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">{env.storeName}</h1>
      <div className="space-y-12">
        <Suspense fallback={<BannerSkeleton />}>
          <Banners />
        </Suspense>
        <Suspense fallback={<ShopByCategorySkeleton />}>
          <ShopByCategory />
        </Suspense>
        <Suspense fallback={<ProductRowSkeleton />}>
          <OnSale />
        </Suspense>
        <Suspense fallback={<ProductRowSkeleton />}>
          <NewArrivals />
        </Suspense>
        <Suspense fallback={<ProductRowSkeleton />}>
          <CategoryRows />
        </Suspense>
        <Suspense>
          <ShowAll />
        </Suspense>
      </div>
    </>
  );
}
