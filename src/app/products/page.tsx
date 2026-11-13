import type { Metadata } from 'next';
import { Pagination } from '@/components/Pagination';
import { env } from '@/config/env';
import { getProducts } from '@/features/catalog/api';
import { CategoryTabs } from '@/features/catalog/CategoryTabs';
import { productListHref, readSort } from '@/features/catalog/params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductListHeader } from '@/features/catalog/ProductListHeader';
import { SortLinks } from '@/features/catalog/SortLinks';
import { readPage } from '@/lib/search-params';

const pageSize = 24;
const path = '/products';

export const metadata: Metadata = {
  title: 'All products',
  description: `Shop every product at ${env.storeName}.`,
};

export default async function ProductsPage({ searchParams }: PageProps<'/products'>) {
  const query = await searchParams;
  const page = readPage(query.page);
  const sort = readSort(query.sort);
  const { data: products, meta } = await getProducts({ page, sort, limit: pageSize });

  return (
    <>
      <CategoryTabs activeId={null} />
      <ProductListHeader title="All products" total={meta.total}>
        <SortLinks
          current={sort}
          href={(value) => productListHref(path, { sort: value, page: 1 })}
        />
      </ProductListHeader>
      <ProductGrid products={products} empty="No products yet. Check back soon." />
      <Pagination {...meta} href={(value) => productListHref(path, { sort, page: value })} />
    </>
  );
}
