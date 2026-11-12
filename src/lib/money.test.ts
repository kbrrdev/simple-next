import { formatCents } from './money';

describe('formatCents', () => {
  it('formats cents as pesos', () => {
    expect(formatCents(19999)).toBe('₱199.99');
  });
});
