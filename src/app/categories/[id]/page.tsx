import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pagination } from '@/components/Pagination';
import { findCategory, getCategoryTree, getProducts } from '@/features/catalog/api';
import { productListHref, readSort } from '@/features/catalog/params';
import { isId, readPage } from '@/lib/search-params';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { SortLinks } from '@/features/catalog/SortLinks';

const pageSize = 24;

async function loadCategory(params: PageProps<'/categories/[id]'>['params']) {
  const { id } = await params;
  const category = isId(id) ? findCategory(await getCategoryTree(), id) : undefined;
  if (!category) notFound();

  return category;
}

export async function generateMetadata({
  params,
}: PageProps<'/categories/[id]'>): Promise<Metadata> {
  const category = await loadCategory(params);
  return { title: category.name, description: `Shop ${category.name}.` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<'/categories/[id]'>) {
  const category = await loadCategory(params);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{category.name}</h1>
      {category.children.length > 0 && (
        <nav aria-label="Subcategories">
          <ul className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.id}`}
                  className="block rounded-full border px-3 py-1 text-sm hover:bg-muted"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <SortLinks current={sort} href={(value) => productListHref(path, { sort: value, page: 1 })} />
      <ProductGrid products={products} empty="No products in this category yet." />
      <Pagination {...meta} href={(value) => productListHref(path, { sort, page: value })} />
    </div>
  );
}
