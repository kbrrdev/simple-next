import type { Metadata } from 'next';
import { Pagination } from '@/components/Pagination';
import { findCategory, getCategoryTree, getProducts } from '@/features/catalog/api';
import { CategoryTabs, rootCategoryId } from '@/features/catalog/CategoryTabs';
import { productListHref, readSearch, readSort } from '@/features/catalog/params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductListHeader } from '@/features/catalog/ProductListHeader';
import { SortLinks } from '@/features/catalog/SortLinks';
import { firstValue, isId, readPage, type SearchParam } from '@/lib/search-params';

const pageSize = 24;

/** The category to search within, from the search pill. Anything else searches everything. */
function readCategoryId(value: SearchParam) {
  const id = firstValue(value);
  return id && isId(id) ? id : undefined;
}

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
  const tree = await getCategoryTree();
  const category = (() => {
    const id = readCategoryId(query.categoryId);
    return id ? findCategory(tree, id) : undefined;
  })();
  const categoryId = category?.id;
  const { data: products, meta } = await getProducts({
    search,
    categoryId,
    page,
    sort,
    limit: pageSize,
  });

  const title = search
    ? `Results for "${search}"${category ? ` in ${category.name}` : ''}`
    : (category?.name ?? 'All products');

  return (
    <>
      <CategoryTabs activeId={categoryId ? rootCategoryId(tree, categoryId) : null} />
      <ProductListHeader title={title} total={meta.total}>
        <SortLinks
          current={sort}
          href={(value) => productListHref('/search', { search, categoryId, sort: value, page: 1 })}
        />
      </ProductListHeader>
      <ProductGrid
        products={products}
        empty={search ? `No products match "${search}".` : 'No products yet. Check back soon.'}
      />
      <Pagination
        {...meta}
        href={(value) => productListHref('/search', { search, categoryId, sort, page: value })}
      />
    </>
  );
}
