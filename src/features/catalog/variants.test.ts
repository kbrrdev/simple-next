import {
  findVariant,
  initialSelection,
  isAvailable,
  optionValues,
  selectOption,
  type VariantChoice,
} from './variants';

function variant(id: string, size: string, color: string, stock = 5): VariantChoice {
  return { id, option1Value: size, option2Value: color, priceCents: 1000, stock };
}

const variants = [
  variant('s-red', 'S', 'Red', 0),
  variant('m-red', 'M', 'Red'),
  variant('m-blue', 'M', 'Blue'),
  variant('l-blue', 'L', 'Blue', 0),
];

describe('variants', () => {
  it('lists each option value once, in order', () => {
    expect(optionValues(variants, 1)).toEqual(['S', 'M', 'L']);
    expect(optionValues(variants, 2)).toEqual(['Red', 'Blue']);
  });

  it('starts on the first variant in stock', () => {
    expect(initialSelection(variants)).toEqual({ option1: 'M', option2: 'Red' });
  });

  it('starts on the first variant when none are in stock', () => {
    expect(initialSelection([variant('a', 'S', 'Red', 0)])).toEqual({
      option1: 'S',
      option2: 'Red',
    });
  });

  it('keeps the other option when the combination exists', () => {
    expect(selectOption(variants, { option1: 'M', option2: 'Red' }, 2, 'Blue')).toEqual({
      option1: 'M',
      option2: 'Blue',
    });
  });

  it('moves the other option when the combination does not exist', () => {
    expect(selectOption(variants, { option1: 'M', option2: 'Red' }, 1, 'L')).toEqual({
      option1: 'L',
      option2: 'Blue',
    });
  });

  it('marks second option values that do not exist with the first', () => {
    expect(isAvailable(variants, 'S', 'Red')).toBe(true);
    expect(isAvailable(variants, 'S', 'Blue')).toBe(false);
  });

  it('finds products without options', () => {
    const single = [
      { id: 'only', option1Value: null, option2Value: null, priceCents: 500, stock: 1 },
    ];

    expect(findVariant(single, initialSelection(single))?.id).toBe('only');
  });
});
