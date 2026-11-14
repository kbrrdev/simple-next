import type { Metadata } from 'next';
import { Pagination } from '@/components/Pagination';
import { env } from '@/config/env';
import { getProducts } from '@/features/catalog/api';
import { CategoryTabs } from '@/features/catalog/CategoryTabs';
import { productListHref, readSort } from '@/features/catalog/params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductListHeader } from '@/features/catalog/ProductListHeader';
import { SortLinks } from '@/features/catalog/SortLinks';
import { firstValue, readPage, type SearchParam } from '@/lib/search-params';

const pageSize = 24;
const path = '/products';

/** `?onSale=true` keeps only the products a current sale covers. */
function readOnSale(value: SearchParam) {
  return firstValue(value) === 'true';
}

export async function generateMetadata({
  searchParams,
}: PageProps<'/products'>): Promise<Metadata> {
  return readOnSale((await searchParams).onSale)
    ? { title: 'On sale', description: `Products on sale at ${env.storeName}.` }
    : { title: 'All products', description: `Shop every product at ${env.storeName}.` };
}

export default async function ProductsPage({ searchParams }: PageProps<'/products'>) {
  const query = await searchParams;
  const page = readPage(query.page);
  const sort = readSort(query.sort);
  const onSale = readOnSale(query.onSale);
  const { data: products, meta } = await getProducts({
    page,
    sort,
    limit: pageSize,
    ...(onSale && { onSale: true }),
  });

  return (
    <>
      <CategoryTabs activeId={null} />
      <ProductListHeader title={onSale ? 'On sale' : 'All products'} total={meta.total}>
        <SortLinks
          current={sort}
          href={(value) => productListHref(path, { onSale, sort: value, page: 1 })}
        />
      </ProductListHeader>
      <ProductGrid
        products={products}
        empty={onSale ? 'Nothing is on sale right now.' : 'No products yet. Check back soon.'}
      />
      <Pagination
        {...meta}
        href={(value) => productListHref(path, { onSale, sort, page: value })}
      />
    </>
  );
}
