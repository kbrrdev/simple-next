import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pagination } from '@/components/Pagination';
import { findCategory, getCategoryTree, getProducts } from '@/features/catalog/api';
import { CategoryTabs, rootCategoryId } from '@/features/catalog/CategoryTabs';
import { productListHref, readSort } from '@/features/catalog/params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { ProductListHeader } from '@/features/catalog/ProductListHeader';
import { SortLinks } from '@/features/catalog/SortLinks';
import { isId, readPage } from '@/lib/search-params';

const pageSize = 24;

async function loadCategory(params: PageProps<'/categories/[id]'>['params']) {
  const { id } = await params;
  const tree = await getCategoryTree();
  const category = isId(id) ? findCategory(tree, id) : undefined;
  if (!category) notFound();

  return { category, rootId: rootCategoryId(tree, category.id) };
}

export async function generateMetadata({
  params,
}: PageProps<'/categories/[id]'>): Promise<Metadata> {
  const { category } = await loadCategory(params);
  return { title: category.name, description: `Shop ${category.name}.` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<'/categories/[id]'>) {
  const { category, rootId } = await loadCategory(params);
  const query = await searchParams;
  const page = readPage(query.page);
  const sort = readSort(query.sort);
  const { data: products, meta } = await getProducts({
    categoryId: category.id,
    page,
    sort,
    limit: pageSize,
  });
  const path = `/categories/${category.id}`;

  return (
    <>
      <CategoryTabs activeId={rootId} />
      <ProductListHeader title={category.name} total={meta.total}>
        <SortLinks
          current={sort}
          href={(value) => productListHref(path, { sort: value, page: 1 })}
        />
      </ProductListHeader>
      {category.children.length > 0 && (
        <nav aria-label="Subcategories" className="-mt-2 pb-6">
          <ul className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.id}`}
                  className="block rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <ProductGrid products={products} empty="No products in this category yet." />
      <Pagination {...meta} href={(value) => productListHref(path, { sort, page: value })} />
    </>
  );
}
