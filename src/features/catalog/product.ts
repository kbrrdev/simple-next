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

/** How many choices each option offers, such as "3 sizes · 2 colors". */
export function optionSummary(product: Pick<Product, 'option1Name' | 'option2Name' | 'variants'>) {
  const options = [
    { name: product.option1Name, values: product.variants.map((variant) => variant.option1Value) },
    { name: product.option2Name, values: product.variants.map((variant) => variant.option2Value) },
  ];

  return options
    .flatMap(({ name, values }) => {
      if (!name) return [];
      const count = new Set(values.filter(Boolean)).size;
      if (count < 2) return [];

      const noun = name.toLowerCase();
      return [`${count} ${noun.endsWith('s') ? noun : `${noun}s`}`];
    })
    .join(' · ');
}
