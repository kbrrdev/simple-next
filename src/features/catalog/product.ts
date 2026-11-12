import type { Product, ProductVariant } from './api';

/** The lowest and highest prices the API returned for a product's variants. */
export function priceRange(variants: Pick<ProductVariant, 'priceCents'>[]) {
  const prices = variants.map((variant) => variant.priceCents);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function isInStock(variants: Pick<ProductVariant, 'stock'>[]) {
  return variants.some((variant) => variant.stock > 0);
}

export function sortedImages(product: Pick<Product, 'images'>) {
  return product.images.toSorted((a, b) => a.position - b.position);
}
