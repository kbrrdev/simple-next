import { firstValue, type SearchParam } from '@/lib/search-params';
import type { ProductQuery } from './api';

export type ProductSort = NonNullable<ProductQuery['sort']>;

export function readSort(value: SearchParam): ProductSort {
  return firstValue(value) === 'name' ? 'name' : 'newest';
}

/** The search text, trimmed to the 255 characters the API accepts, or undefined when empty. */
export function readSearch(value: SearchParam) {
  const text = firstValue(value)?.trim().slice(0, 255);
  return text || undefined;
}

/** A product list's address, leaving out default values so that links stay short. */
export function productListHref(
  path: string,
  {
    search,
    categoryId,
    onSale,
    sort,
    page,
  }: { search?: string; categoryId?: string; onSale?: boolean; sort: ProductSort; page: number },
) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (categoryId) params.set('categoryId', categoryId);
  if (onSale) params.set('onSale', 'true');
  if (sort !== 'newest') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
