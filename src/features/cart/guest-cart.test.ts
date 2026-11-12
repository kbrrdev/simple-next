import { guestCart, parseGuestCart } from './guest-cart';

const a = '00000000-0000-4000-8000-00000000000a';
const b = '00000000-0000-4000-8000-00000000000b';

beforeEach(() => {
  guestCart.clear();
});

describe('parseGuestCart', () => {
  it('reads stored lines', () => {
    expect(parseGuestCart(JSON.stringify([{ variantId: a, quantity: 2 }]))).toEqual([
      { variantId: a, quantity: 2 },
    ]);
  });

  it.each([null, '', 'not json', '{}', '"text"'])('treats %j as an empty cart', (raw) => {
    expect(parseGuestCart(raw)).toEqual([]);
  });

  it('drops malformed lines', () => {
    const raw = JSON.stringify([
      { variantId: 'not-an-id', quantity: 1 },
      { variantId: a, quantity: 0 },
      { variantId: a, quantity: 1.5 },
      { variantId: a, quantity: '2' },
      null,
      { variantId: b, quantity: 1 },
    ]);

    expect(parseGuestCart(raw)).toEqual([{ variantId: b, quantity: 1 }]);
  });

  it('combines repeated lines, up to 99', () => {
    const raw = JSON.stringify([
      { variantId: a, quantity: 60 },
      { variantId: a, quantity: 60 },
    ]);

    expect(parseGuestCart(raw)).toEqual([{ variantId: a, quantity: 99 }]);
  });
});

describe('guestCart', () => {
  it('stores only variant IDs and quantities', () => {
    guestCart.add(a, 1);
    guestCart.add(a, 2);
    guestCart.add(b, 1);

    expect(JSON.parse(localStorage.getItem('cart') ?? '')).toEqual([
      { variantId: a, quantity: 3 },
      { variantId: b, quantity: 1 },
    ]);
  });

  it('changes quantities between 1 and 99, and removes lines', () => {
    guestCart.add(a, 1);
    guestCart.add(b, 1);

    guestCart.setQuantity(a, 150);
    guestCart.setQuantity(b, 0);
    expect(guestCart.read()).toEqual([
      { variantId: a, quantity: 99 },
      { variantId: b, quantity: 1 },
    ]);

    guestCart.remove([a]);
    expect(guestCart.read()).toEqual([{ variantId: b, quantity: 1 }]);
  });
});
