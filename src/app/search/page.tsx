import type { Metadata } from 'next';
import { Pagination } from '@/components/Pagination';
import { getProducts } from '@/features/catalog/api';
import { productListHref, readSearch, readSort } from '@/features/catalog/params';
import { readPage } from '@/lib/search-params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { SortLinks } from '@/features/catalog/SortLinks';

const pageSize = 24;

export async function generateMetadata({ searchParams }: PageProps<'/search'>): Promise<Metadata> {
  const search = readSearch((await searchParams).q);

  return {
    title: search ? `Search results for "${search}"` : 'All products',
    // Search results repeat the product and category pages, so only those are indexed.
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const query = await searchParams;
  const search = readSearch(query.q);
  const page = readPage(query.page);
  const sort = readSort(query.sort);
  const { data: products, meta } = await getProducts({ search, page, sort, limit: pageSize });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {search ? `Search results for "${search}"` : 'All products'}
      </h1>
      <SortLinks
        current={sort}
        href={(value) => productListHref('/search', { search, sort: value, page: 1 })}
      />
      <ProductGrid
        products={products}
        empty={search ? `No products match "${search}".` : 'No products yet. Check back soon.'}
      />
      <Pagination
        {...meta}
        href={(value) => productListHref('/search', { search, sort, page: value })}
      />
    </div>
  );
}
