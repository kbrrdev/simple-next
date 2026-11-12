import { productListHref, readSearch, readSort } from './params';

describe('readSort', () => {
  it('accepts name, and defaults to newest', () => {
    expect(readSort('name')).toBe('name');
    expect(readSort('price')).toBe('newest');
    expect(readSort(undefined)).toBe('newest');
  });
});

describe('readSearch', () => {
  it('trims the text, and treats blank as no search', () => {
    expect(readSearch('  shirt ')).toBe('shirt');
    expect(readSearch('   ')).toBeUndefined();
    expect(readSearch('a'.repeat(300))).toHaveLength(255);
  });
});

describe('productListHref', () => {
  it('leaves out default values', () => {
    expect(productListHref('/search', { sort: 'newest', page: 1 })).toBe('/search');
  });

  it('keeps the search, sort, and page', () => {
    expect(productListHref('/search', { search: 'red shirt', sort: 'name', page: 2 })).toBe(
      '/search?q=red+shirt&sort=name&page=2',
    );
  });
});
