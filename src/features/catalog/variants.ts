import type { ProductVariant } from './api';

export type VariantChoice = Pick<
  ProductVariant,
  | 'id'
  | 'option1Value'
  | 'option2Value'
  | 'priceCents'
  | 'stock'
  | 'compareAtPriceCents'
  | 'saleEndsAt'
> &
  // The variant's own photo, when it has one.
  Partial<Pick<ProductVariant, 'assetId'>>;

/** The chosen value of each option. A product without that option has null. */
export interface Selection {
  option1: string | null;
  option2: string | null;
}

/** Each option's values, in the order the variants list them. */
export function optionValues(variants: VariantChoice[], option: 1 | 2) {
  const values = variants.map((variant) =>
    option === 1 ? variant.option1Value : variant.option2Value,
  );
  return [...new Set(values.filter((value) => value !== null))];
}

export function findVariant(variants: VariantChoice[], selection: Selection) {
  return variants.find(
    (variant) =>
      variant.option1Value === selection.option1 && variant.option2Value === selection.option2,
  );
}

function selectionOf(variant: VariantChoice): Selection {
  return { option1: variant.option1Value, option2: variant.option2Value };
}

/** Starts on the first variant in stock, or the first variant when none are. */
export function initialSelection(variants: VariantChoice[]): Selection {
  const variant = variants.find((item) => item.stock > 0) ?? variants[0];
  return selectionOf(variant);
}

/**
 * Changes one option. When the other option's value does not exist with the new one, it moves to
 * a variant that does, preferring one in stock.
 */
export function selectOption(
  variants: VariantChoice[],
  current: Selection,
  option: 1 | 2,
  value: string,
): Selection {
  const next = option === 1 ? { ...current, option1: value } : { ...current, option2: value };
  if (findVariant(variants, next)) return next;

  const matches = variants.filter(
    (variant) => (option === 1 ? variant.option1Value : variant.option2Value) === value,
  );
  const variant = matches.find((item) => item.stock > 0) ?? matches[0];

  return variant ? selectionOf(variant) : current;
}

/**
 * Whether a second option value exists with the chosen first one. First option values are always
 * pickable, as choosing one moves the second option to a value that exists.
 */
export function isAvailable(variants: VariantChoice[], option1: string | null, option2: string) {
  return variants.some(
    (variant) => variant.option1Value === option1 && variant.option2Value === option2,
  );
}
