import 'server-only';
import type { paths } from '@/lib/api-schema';
import type { Schemas } from '@/lib/api';
import { getPublic } from '@/lib/server-api';

export type Product = Schemas['Product'];
export type ProductVariant = Schemas['ProductVariant'];
export type CategoryNode = Schemas['CategoryNode'];
export type PageMeta = Schemas['PageMeta'];
export type ProductQuery = NonNullable<paths['/api/products']['get']['parameters']['query']>;

export function getProducts(query: ProductQuery) {
  return getPublic<{ data: Product[]; meta: PageMeta }>('/api/products', query);
}

export async function getProduct(id: string) {
  const { data } = await getPublic<{ data: Product }>(`/api/products/${id}`);
  return data;
}

export async function getCategoryTree() {
  const { data } = await getPublic<{ data: CategoryNode[] }>('/api/categories/tree');
  return data;
}

/** Finds a category anywhere in the tree. */
export function findCategory(tree: CategoryNode[], id: string): CategoryNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;

    const child = findCategory(node.children, id);
    if (child) return child;
  }

  return undefined;
}
