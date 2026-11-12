import { isId, readPage } from './search-params';

describe('readPage', () => {
  it.each([
    ['3', 3],
    [['2', '5'], 2],
    [undefined, 1],
    ['0', 1],
    ['-1', 1],
    ['1.5', 1],
    ['abc', 1],
  ])('reads %j as page %i', (value, page) => {
    expect(readPage(value)).toBe(page);
  });
});

describe('isId', () => {
  it('accepts UUIDs only', () => {
    expect(isId('df4f20d6-9a5d-4e3f-9b68-2352fb03d3cb')).toBe(true);
    expect(isId('classic-t-shirt')).toBe(false);
  });
});
