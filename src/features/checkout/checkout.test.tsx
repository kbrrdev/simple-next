import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { guestCart } from '@/features/cart/guest-cart';
import { ApiError, refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { CheckoutView } from './CheckoutView';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/checkout',
  useRouter: () => ({ push: navigation.push }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

const shirt = '00000000-0000-4000-8000-000000000001';
const gcash = '00000000-0000-4000-8000-0000000000aa';

const cartItem = {
  variantId: shirt,
  productId: 'product-1',
  productName: 'Linen Shirt',
  imageUrl: null,
  option1Name: null,
  option1Value: null,
  option2Name: null,
  option2Value: null,
  unitPriceCents: 100000,
  quantity: 1,
  lineTotalCents: 100000,
  stock: 5,
  available: true,
};

function preview(totalCents: number) {
  return {
    data: {
      items: [cartItem],
      subtotalCents: 100000,
      shippingCents: 15000,
      vatableCents: 102679,
      taxCents: 12321,
      totalCents,
      taxRatePercent: 12,
      pricesIncludeTax: true,
    },
  };
}

const savedAddress = {
  id: 'address-1',
  userId: 'user-1',
  recipientName: 'Juan Dela Cruz',
  phone: '+639171234567',
  line1: '123 Rizal Street',
  line2: '',
  barangay: 'San Antonio',
  city: 'Pasig',
  province: 'Metro Manila',
  postalCode: '1605',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

type Handler = (body: unknown) => unknown;

function mockApi(routes: Record<string, unknown | Handler>) {
  vi.mocked(request).mockImplementation(async (path, options) => {
    const key = `${options?.method ?? 'GET'} ${path}`;
    if (!(key in routes)) throw new Error(`Unexpected request: ${key}`);

    const route = routes[key];
    return typeof route === 'function' ? (route as Handler)(options?.body) : route;
  });
}

function bodiesSentTo(path: string) {
  return vi
    .mocked(request)
    .mock.calls.filter(([called, options]) => called === path && options?.method === 'POST')
    .map(([, options]) => options?.body as Record<string, unknown>);
}

async function fillGuestDetails() {
  await userEvent.type(await screen.findByLabelText('Email'), 'guest@example.com');
  await userEvent.type(screen.getByLabelText('Full name'), 'Juan Dela Cruz');
  await userEvent.type(screen.getByLabelText('Mobile number'), '09171234567');
  await userEvent.type(screen.getByLabelText('House or unit number and street'), '1 Rizal St');
  await userEvent.type(screen.getByLabelText('Barangay'), 'San Antonio');
  await userEvent.type(screen.getByLabelText('City or municipality'), 'Pasig');
  await userEvent.type(screen.getByLabelText('Province'), 'Metro Manila');
  await userEvent.type(screen.getByLabelText('Postal code'), '1605');
}

beforeEach(() => {
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
  navigation.push.mockReset();
  guestCart.clear();
});

describe('guest checkout', () => {
  beforeEach(() => {
    vi.mocked(refreshSession).mockResolvedValue(false);
    guestCart.add(shirt, 1);
  });

  it('offers manual methods only, and shows the API total', async () => {
    mockApi({
      'GET /api/payment-methods': { data: [{ id: gcash, type: 'manual', providerName: 'GCash' }] },
      'POST /api/cart/preview': { data: { items: [cartItem], subtotalCents: 100000 } },
      'POST /api/orders/preview': preview(115000),
    });
    renderWithQuery(<CheckoutView />);

    expect(await screen.findByRole('radio', { name: 'GCash' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Cash on delivery' })).not.toBeInTheDocument();
    expect(await screen.findByText('₱1,150.00')).toBeInTheDocument();
    expect(screen.getByText('Includes VAT (12%)')).toBeInTheDocument();
  });

  it('checks the address before sending', async () => {
    mockApi({
      'GET /api/payment-methods': { data: [{ id: gcash, type: 'manual', providerName: 'GCash' }] },
      'POST /api/cart/preview': { data: { items: [cartItem], subtotalCents: 100000 } },
      'POST /api/orders/preview': preview(115000),
    });
    renderWithQuery(<CheckoutView />);

    await userEvent.click(await screen.findByRole('radio', { name: 'GCash' }));
    await screen.findByText('₱1,150.00');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(screen.getByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getAllByText('Required.').length).toBeGreaterThan(0);
    expect(bodiesSentTo('/api/orders/guest')).toEqual([]);
  });

  it('places the order at the previewed total, clears the cart, and opens the private link', async () => {
    mockApi({
      'GET /api/payment-methods': { data: [{ id: gcash, type: 'manual', providerName: 'GCash' }] },
      'POST /api/cart/preview': { data: { items: [cartItem], subtotalCents: 100000 } },
      'POST /api/orders/preview': preview(115000),
      'POST /api/orders/guest': { data: { id: 'order-1', guestToken: 'secret.token' } },
    });
    renderWithQuery(<CheckoutView />);

    await fillGuestDetails();
    await userEvent.click(await screen.findByRole('radio', { name: 'GCash' }));
    await screen.findByText('₱1,150.00');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() =>
      expect(navigation.push).toHaveBeenCalledWith('/orders/guest#token=secret.token'),
    );
    const [body] = bodiesSentTo('/api/orders/guest');
    expect(body).toMatchObject({
      email: 'guest@example.com',
      items: [{ variantId: shirt, quantity: 1 }],
      paymentMethod: gcash,
      expectedTotalCents: 115000,
      address: { phone: '09171234567', postalCode: '1605' },
    });
    expect(body.idempotencyKey).toEqual(expect.any(String));
    expect(guestCart.read()).toEqual([]);
  });

  it('reuses the key on retry, and shows problems next to the items', async () => {
    let attempts = 0;
    mockApi({
      'GET /api/payment-methods': { data: [{ id: gcash, type: 'manual', providerName: 'GCash' }] },
      'POST /api/cart/preview': { data: { items: [cartItem], subtotalCents: 100000 } },
      'POST /api/orders/preview': preview(115000),
      'POST /api/orders/guest': () => {
        attempts += 1;
        if (attempts === 1) throw new TypeError('Failed to fetch');
        throw new ApiError(409, {
          error: {
            message: 'Some items are short of stock',
            details: [{ field: shirt, message: 'Linen Shirt has only 0 left' }],
          },
        });
      },
    });
    renderWithQuery(<CheckoutView />);

    await fillGuestDetails();
    await userEvent.click(await screen.findByRole('radio', { name: 'GCash' }));
    await screen.findByText('₱1,150.00');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await screen.findByText(/Could not reach the server/);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('Linen Shirt has only 0 left')).toBeInTheDocument();
    const [first, second] = bodiesSentTo('/api/orders/guest');
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
  });

  it('checks the total again when the order fails', async () => {
    let total = 115000;
    mockApi({
      'GET /api/payment-methods': { data: [{ id: gcash, type: 'manual', providerName: 'GCash' }] },
      'POST /api/cart/preview': { data: { items: [cartItem], subtotalCents: 100000 } },
      'POST /api/orders/preview': () => preview(total),
      'POST /api/orders/guest': () => {
        total = 125000;
        throw new ApiError(409, { error: { message: 'The order total has changed' } });
      },
    });
    renderWithQuery(<CheckoutView />);

    await fillGuestDetails();
    await userEvent.click(await screen.findByRole('radio', { name: 'GCash' }));
    await screen.findByText('₱1,150.00');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('The order total has changed')).toBeInTheDocument();
    expect(await screen.findByText('₱1,250.00')).toBeInTheDocument();
  });
});

describe('account checkout', () => {
  beforeEach(() => {
    vi.mocked(refreshSession).mockResolvedValue(true);
  });

  it('offers cash on delivery, uses the default address, and opens the order', async () => {
    mockApi({
      'GET /api/auth/me': { data: { id: 'user-1', email: 'shopper@example.com' } },
      'GET /api/cart': { data: { items: [cartItem], subtotalCents: 100000 } },
      'GET /api/addresses': { data: [savedAddress] },
      'GET /api/payment-methods': { data: [] },
      'POST /api/orders/preview': preview(115000),
      'POST /api/orders': { data: { id: 'order-9' } },
    });
    renderWithQuery(<CheckoutView />);

    expect(await screen.findByText('shopper@example.com')).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Juan Dela Cruz/ })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Cash on delivery' }));
    await screen.findByText('₱1,150.00');
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/orders/order-9'));
    expect(bodiesSentTo('/api/orders')[0]).toMatchObject({
      addressId: 'address-1',
      paymentMethod: 'cod',
      expectedTotalCents: 115000,
    });
  });

  it('saves a new address once, even when the order is retried', async () => {
    let attempts = 0;
    mockApi({
      'GET /api/auth/me': { data: { id: 'user-1', email: 'shopper@example.com' } },
      'GET /api/cart': { data: { items: [cartItem], subtotalCents: 100000 } },
      'GET /api/addresses': { data: [] },
      'GET /api/payment-methods': { data: [] },
      'POST /api/orders/preview': preview(115000),
      'POST /api/addresses': { data: { ...savedAddress, id: 'address-new' } },
      'POST /api/orders': () => {
        attempts += 1;
        if (attempts === 1) throw new TypeError('Failed to fetch');
        return { data: { id: 'order-9' } };
      },
    });
    renderWithQuery(<CheckoutView />);

    await userEvent.type(await screen.findByLabelText('Full name'), 'Juan Dela Cruz');
    await userEvent.type(screen.getByLabelText('Mobile number'), '09171234567');
    await userEvent.type(screen.getByLabelText('House or unit number and street'), '1 Rizal St');
    await userEvent.type(screen.getByLabelText('Barangay'), 'San Antonio');
    await userEvent.type(screen.getByLabelText('City or municipality'), 'Pasig');
    await userEvent.type(screen.getByLabelText('Province'), 'Metro Manila');
    await userEvent.type(screen.getByLabelText('Postal code'), '1605');
    await userEvent.click(screen.getByRole('radio', { name: 'Cash on delivery' }));
    await screen.findByText('₱1,150.00');

    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));
    await screen.findByText(/Could not reach the server/);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/orders/order-9'));
    expect(bodiesSentTo('/api/addresses')).toHaveLength(1);
    const [first, second] = bodiesSentTo('/api/orders');
    expect(second.addressId).toBe('address-new');
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
  });
});
