import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ApiError, refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import type { CartItem } from './api';
import { describeAdjustments, mergeGuestCart } from './api';
import { CartView } from './CartView';
import { guestCart } from './guest-cart';

vi.mock('next/navigation', () => ({
  usePathname: () => '/cart',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), warning: vi.fn(), error: vi.fn() }),
}));

const shirt = '00000000-0000-4000-8000-000000000001';
const mug = '00000000-0000-4000-8000-000000000002';

function item(variantId: string, name: string, overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId,
    productId: `product-${name}`,
    productName: name,
    imageUrl: null,
    option1Name: null,
    option1Value: null,
    option2Name: null,
    option2Value: null,
    unitPriceCents: 50000,
    quantity: 1,
    lineTotalCents: 50000,
    compareAtPriceCents: null,
    saleEndsAt: null,
    stock: 10,
    available: true,
    ...overrides,
  };
}

function mockApi(routes: Record<string, unknown>) {
  vi.mocked(request).mockImplementation(async (path, options) => {
    const key = `${options?.method ?? 'GET'} ${path}`;
    if (key in routes) return routes[key];
    throw new Error(`Unexpected request: ${key}`);
  });
}

beforeEach(() => {
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
  vi.mocked(toast.warning).mockReset();
  vi.mocked(toast.error).mockReset();
  guestCart.clear();
});

describe('guest cart page', () => {
  beforeEach(() => {
    vi.mocked(refreshSession).mockResolvedValue(false);
  });

  it('prices the stored lines with the API', async () => {
    guestCart.add(shirt, 2);
    mockApi({
      'POST /api/cart/preview': {
        data: {
          items: [item(shirt, 'Linen Shirt', { quantity: 2, lineTotalCents: 100000 })],
          subtotalCents: 100000,
        },
      },
    });
    renderWithQuery(<CartView />);

    expect(await screen.findByRole('link', { name: 'Linen Shirt' })).toBeInTheDocument();
    expect(screen.getAllByText('₱1,000.00')).toHaveLength(2);
    expect(request).toHaveBeenCalledWith('/api/cart/preview', {
      method: 'POST',
      body: { items: [{ variantId: shirt, quantity: 2 }] },
    });
  });

  it('changes quantities in the browser', async () => {
    guestCart.add(shirt, 1);
    mockApi({
      'POST /api/cart/preview': {
        data: { items: [item(shirt, 'Linen Shirt')], subtotalCents: 50000 },
      },
    });
    renderWithQuery(<CartView />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Increase quantity of Linen Shirt' }),
    );

    await waitFor(() => expect(guestCart.read()).toEqual([{ variantId: shirt, quantity: 2 }]));
  });

  it('removes items the API no longer sells, and says so', async () => {
    guestCart.add(shirt, 1);
    guestCart.add(mug, 1);
    mockApi({
      'POST /api/cart/preview': {
        data: { items: [item(shirt, 'Linen Shirt')], subtotalCents: 50000 },
      },
    });
    renderWithQuery(<CartView />);

    await waitFor(() => expect(guestCart.read()).toEqual([{ variantId: shirt, quantity: 1 }]));
    expect(toast.warning).toHaveBeenCalled();
  });

  it('marks unavailable items and low stock', async () => {
    guestCart.add(shirt, 3);
    guestCart.add(mug, 1);
    mockApi({
      'POST /api/cart/preview': {
        data: {
          items: [
            item(shirt, 'Linen Shirt', { quantity: 3, stock: 2 }),
            item(mug, 'Mug', { available: false }),
          ],
          subtotalCents: 150000,
        },
      },
    });
    renderWithQuery(<CartView />);

    expect(await screen.findByText('Only 2 in stock')).toBeInTheDocument();
    expect(screen.getByText('No longer available')).toBeInTheDocument();
  });

  it('warns guests over the order limit', async () => {
    guestCart.add(shirt, 11);
    mockApi({
      'POST /api/cart/preview': {
        data: { items: [item(shirt, 'Linen Shirt', { quantity: 11 })], subtotalCents: 550000 },
      },
    });
    renderWithQuery(<CartView />);

    expect(await screen.findByText(/A guest order can have up to 10 items/)).toBeInTheDocument();
  });

  it('shows an empty cart without asking the API', async () => {
    renderWithQuery(<CartView />);

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('shows the reference when the API fails', async () => {
    guestCart.add(shirt, 1);
    vi.mocked(request).mockRejectedValue(
      new ApiError(500, { error: { message: 'Internal', requestId: 'req-1' } }),
    );
    renderWithQuery(<CartView />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reference: req-1');
  });
});

describe('account cart page', () => {
  beforeEach(() => {
    vi.mocked(refreshSession).mockResolvedValue(true);
  });

  it('changes and removes items through the API', async () => {
    mockApi({
      'GET /api/auth/me': { data: { id: 'user' } },
      'GET /api/cart': { data: { items: [item(shirt, 'Linen Shirt')], subtotalCents: 50000 } },
      [`PATCH /api/cart/items/${shirt}`]: { data: {} },
      [`DELETE /api/cart/items/${shirt}`]: undefined,
    });
    renderWithQuery(<CartView />);

    const line = (await screen.findByRole('link', { name: 'Linen Shirt' })).closest('li');
    if (!line) throw new Error('No cart line');

    await userEvent.click(
      within(line).getByRole('button', { name: 'Increase quantity of Linen Shirt' }),
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(`/api/cart/items/${shirt}`, {
        method: 'PATCH',
        body: { quantity: 2 },
      }),
    );

    await userEvent.click(within(line).getByRole('button', { name: 'Remove' }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(`/api/cart/items/${shirt}`, { method: 'DELETE' }),
    );
    expect(guestCart.read()).toEqual([]);
  });
});

describe('mergeGuestCart', () => {
  it('moves the guest cart into the account, then clears it', async () => {
    guestCart.add(shirt, 5);
    mockApi({
      'POST /api/cart/merge': {
        data: {
          items: [item(shirt, 'Linen Shirt', { quantity: 2 })],
          subtotalCents: 100000,
          adjustments: [{ variantId: shirt, requestedQuantity: 5, addedQuantity: 2 }],
        },
      },
    });
    const { queryClient } = renderWithQuery(<div />);

    await mergeGuestCart(queryClient);

    expect(request).toHaveBeenCalledWith('/api/cart/merge', {
      method: 'POST',
      body: { items: [{ variantId: shirt, quantity: 5 }] },
    });
    expect(guestCart.read()).toEqual([]);
    expect(toast.warning).toHaveBeenCalledWith('Some items in your cart changed', {
      description: 'Linen Shirt: 2 of 5 added, as stock is limited.',
    });
  });

  it('keeps the guest cart when the merge fails', async () => {
    guestCart.add(shirt, 1);
    vi.mocked(request).mockRejectedValue(new TypeError('Failed to fetch'));
    const { queryClient } = renderWithQuery(<div />);

    await mergeGuestCart(queryClient);

    expect(guestCart.read()).toEqual([{ variantId: shirt, quantity: 1 }]);
    expect(toast.error).toHaveBeenCalled();
  });

  it('does nothing without a guest cart', async () => {
    const { queryClient } = renderWithQuery(<div />);

    await mergeGuestCart(queryClient);

    expect(request).not.toHaveBeenCalled();
  });
});

describe('describeAdjustments', () => {
  it('names items that could not be added', () => {
    expect(
      describeAdjustments({
        items: [],
        subtotalCents: 0,
        adjustments: [{ variantId: mug, requestedQuantity: 1, addedQuantity: 0 }],
      }),
    ).toEqual(['An item is no longer available.']);
  });
});
