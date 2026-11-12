import { loginHref, safeNext } from './redirect';

describe('safeNext', () => {
  it('keeps paths on this site', () => {
    expect(safeNext('/checkout')).toBe('/checkout');
    expect(safeNext('/search?q=shirt')).toBe('/search?q=shirt');
  });

  it.each([null, '', '//evil.test', '/\\evil.test', 'https://evil.test', 'javascript:alert(1)'])(
    'sends %j home',
    (value) => {
      expect(safeNext(value)).toBe('/');
    },
  );
});

describe('loginHref', () => {
  it('carries the page to come back to', () => {
    expect(loginHref('/account?tab=orders')).toBe('/login?next=%2Faccount%3Ftab%3Dorders');
    expect(loginHref('/')).toBe('/login');
  });
});
