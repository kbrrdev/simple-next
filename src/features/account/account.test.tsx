import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestOrderView } from '@/features/orders/GuestOrderView';
import { OrderView } from '@/features/orders/OrderView';
import { ApiError, refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { AddressBook } from './AddressBook';
import { OrderList } from './OrderList';
import { SecuritySettings } from './SecuritySettings';

const navigation = vi.hoisted(() => ({
  search: new URLSearchParams(),
  params: { id: '' },
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/account',
  useSearchParams: () => navigation.search,
  useParams: () => navigation.params,
  useRouter: () => ({ push: navigation.push, replace: vi.fn() }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn() } }));

const orderId = '00000000-0000-4000-8000-000000000001';

const order = {
  id: orderId,
  orderNumber: 'ORD-000123',
  status: 'awaiting_payment',
  paymentType: 'manual',
  paymentProvider: 'GCash',
  paymentStatus: 'unpaid',
  paymentDueAt: '2026-11-14T04:00:00.000Z',
  payment: {
    providerName: 'GCash',
    accountName: 'Sample Store',
    accountNumber: '09171234567',
    qrUrl: null,
  },
  subtotalCents: 100000,
  shippingCents: 15000,
  vatableCents: 102679,
  taxCents: 12321,
  totalCents: 115000,
  taxRatePercent: 12,
  pricesIncludeTax: true,
  shippingAddress: null,
  items: [],
  createdAt: '2026-11-13T04:00:00.000Z',
  updatedAt: '2026-11-13T04:00:00.000Z',
};

const address = {
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

type Handler = (options?: { body?: unknown; query?: unknown }) => unknown;

function mockApi(routes: Record<string, unknown | Handler>) {
  vi.mocked(request).mockImplementation(async (path, options) => {
    const key = `${options?.method ?? 'GET'} ${path}`;
    if (!(key in routes)) throw new Error(`Unexpected request: ${key}`);

    const route = routes[key];
    return typeof route === 'function' ? (route as Handler)(options) : route;
  });
}

function calls(method: string, path: string) {
  return vi
    .mocked(request)
    .mock.calls.filter(
      ([called, options]) => called === path && (options?.method ?? 'GET') === method,
    );
}

beforeEach(() => {
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
  navigation.search = new URLSearchParams();
  navigation.push.mockReset();
  window.location.hash = '';
});

describe('OrderList', () => {
  it('reads the page and status from the URL, and links each order', async () => {
    navigation.search = new URLSearchParams({ page: '2', status: 'pending' });
    mockApi({
      'GET /api/orders': {
        data: [{ ...order, status: 'pending' }],
        meta: { page: 2, limit: 10, total: 25 },
      },
    });
    renderWithQuery(<OrderList />);

    expect(await screen.findByRole('link', { name: /ORD-000123/ })).toHaveAttribute(
      'href',
      `/orders/${orderId}`,
    );
    expect(calls('GET', '/api/orders')[0][1]).toMatchObject({
      query: { page: 2, limit: 10, status: 'pending' },
    });
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/account/orders?status=pending&page=3',
    );
  });

  it('ignores an unknown status, and changes the filter through the URL', async () => {
    navigation.search = new URLSearchParams({ status: 'lost' });
    mockApi({ 'GET /api/orders': { data: [], meta: { page: 1, limit: 10, total: 0 } } });
    renderWithQuery(<OrderList />);

    expect(await screen.findByText('You have no orders yet.')).toBeInTheDocument();
    expect(calls('GET', '/api/orders')[0][1]).toMatchObject({ query: { status: undefined } });

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'shipped');
    expect(navigation.push).toHaveBeenCalledWith('/account/orders?status=shipped');
  });
});

describe('an account order', () => {
  beforeEach(() => {
    navigation.params = { id: orderId };
  });

  it('sends the payment reference, checking its format first', async () => {
    mockApi({
      [`GET /api/orders/${orderId}`]: { data: order },
      [`POST /api/orders/${orderId}/payment`]: undefined,
    });
    renderWithQuery(<OrderView />);

    const field = await screen.findByLabelText('GCash reference number');
    await userEvent.type(field, 'ab c');
    await userEvent.click(screen.getByRole('button', { name: 'Send payment reference' }));
    expect(screen.getByText(/Use 4 to 100 letters/)).toBeInTheDocument();
    expect(calls('POST', `/api/orders/${orderId}/payment`)).toHaveLength(0);

    await userEvent.clear(field);
    await userEvent.type(field, 'GC-12345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send payment reference' }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        body: { reference: 'GC-12345678' },
      }),
    );
  });

  it('shows why the reference was refused', async () => {
    mockApi({
      [`GET /api/orders/${orderId}`]: { data: order },
      [`POST /api/orders/${orderId}/payment`]: () => {
        throw new ApiError(409, {
          error: { message: 'This payment reference has already been used' },
        });
      },
    });
    renderWithQuery(<OrderView />);

    await userEvent.type(await screen.findByLabelText('GCash reference number'), 'GC-12345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send payment reference' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This payment reference has already been used',
    );
  });

  it('cancels after confirming', async () => {
    mockApi({
      [`GET /api/orders/${orderId}`]: { data: order },
      [`POST /api/orders/${orderId}/cancel`]: undefined,
    });
    renderWithQuery(<OrderView />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel order' }));
    const dialog = screen.getByRole('dialog');
    expect(calls('POST', `/api/orders/${orderId}/cancel`)).toHaveLength(0);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel order' }));
    await waitFor(() => expect(calls('POST', `/api/orders/${orderId}/cancel`)).toHaveLength(1));
  });

  it('offers no actions once the order is on its way', async () => {
    mockApi({
      [`GET /api/orders/${orderId}`]: {
        data: { ...order, status: 'shipped', paymentStatus: 'paid', payment: null },
      },
    });
    renderWithQuery(<OrderView />);

    expect(await screen.findByText('Shipped')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/reference number/)).not.toBeInTheDocument();
  });
});

describe('a guest order', () => {
  it('sends the payment reference with the token', async () => {
    window.location.hash = '#token=abc.def';
    mockApi({
      'GET /api/orders/guest/abc.def': { data: { ...order, guestToken: 'abc.def' } },
      'POST /api/orders/guest/abc.def/payment': undefined,
    });
    renderWithQuery(<GuestOrderView />);

    await userEvent.type(await screen.findByLabelText('GCash reference number'), 'GC-12345678');
    await userEvent.click(screen.getByRole('button', { name: 'Send payment reference' }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/api/orders/guest/abc.def/payment', {
        method: 'POST',
        body: { reference: 'GC-12345678' },
      }),
    );
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
  });
});

describe('AddressBook', () => {
  it('adds an address, showing the API field errors', async () => {
    let attempts = 0;
    mockApi({
      'GET /api/addresses': { data: [address] },
      'POST /api/addresses': () => {
        attempts += 1;
        if (attempts === 1) {
          throw new ApiError(400, {
            error: {
              message: 'Validation failed',
              details: [{ field: 'city', message: 'City is not recognized' }],
            },
          });
        }
        return { data: { ...address, id: 'address-2', isDefault: false } };
      },
    });
    renderWithQuery(<AddressBook />);

    await userEvent.click(await screen.findByRole('button', { name: 'Add an address' }));
    await userEvent.type(screen.getByLabelText('Full name'), 'Maria Santos');
    await userEvent.type(screen.getByLabelText('Mobile number'), '09181234567');
    await userEvent.type(screen.getByLabelText('House or unit number and street'), '5 Mabini St');
    await userEvent.type(screen.getByLabelText('Barangay'), 'Poblacion');
    await userEvent.type(screen.getByLabelText('City or municipality'), 'Nowhere');
    await userEvent.type(screen.getByLabelText('Province'), 'Cebu');
    await userEvent.type(screen.getByLabelText('Postal code'), '6000');
    await userEvent.click(screen.getByRole('button', { name: 'Save address' }));

    expect(await screen.findByText('City is not recognized')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save address' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save address' })).not.toBeInTheDocument(),
    );
    expect(calls('POST', '/api/addresses')).toHaveLength(2);
  });

  it('makes an address the default, and deletes one after confirming', async () => {
    const second = { ...address, id: 'address-2', recipientName: 'Maria Santos', isDefault: false };
    mockApi({
      'GET /api/addresses': { data: [address, second] },
      'POST /api/addresses/address-2/default': undefined,
      'DELETE /api/addresses/address-2': undefined,
    });
    renderWithQuery(<AddressBook />);

    await userEvent.click(await screen.findByRole('button', { name: 'Make default' }));
    await waitFor(() => expect(calls('POST', '/api/addresses/address-2/default')).toHaveLength(1));

    const card = screen.getByText('Maria Santos').closest('li');
    if (!card) throw new Error('No address card');
    await userEvent.click(within(card).getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete address' }),
    );
    await waitFor(() => expect(calls('DELETE', '/api/addresses/address-2')).toHaveLength(1));
  });

  it('says when there are none', async () => {
    mockApi({ 'GET /api/addresses': { data: [] } });
    renderWithQuery(<AddressBook />);

    expect(await screen.findByText('You have no saved addresses.')).toBeInTheDocument();
  });
});

describe('SecuritySettings', () => {
  async function fillPasswords(current: string, next: string) {
    await userEvent.type(screen.getByLabelText('Current password'), current);
    await userEvent.type(screen.getByLabelText('New password'), next);
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
  }

  it('shows the API error for a wrong current password', async () => {
    mockApi({
      'POST /api/auth/change-password': () => {
        throw new ApiError(400, { error: { message: 'Current password is incorrect' } });
      },
    });
    renderWithQuery(<SecuritySettings />);

    await fillPasswords('wrong-password', 'a-new-password');

    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect');
  });

  it('changes the password, and explains that other devices were logged out', async () => {
    mockApi({ 'POST /api/auth/change-password': undefined });
    renderWithQuery(<SecuritySettings />);

    await fillPasswords('old-password', 'a-new-password');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'You were logged out on your other devices',
    );
    expect(request).toHaveBeenCalledWith('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword: 'old-password', newPassword: 'a-new-password' },
    });
  });

  it('checks the new password length before sending', async () => {
    renderWithQuery(<SecuritySettings />);

    await fillPasswords('old-password', 'short');

    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('logs out everywhere after confirming, then goes home', async () => {
    mockApi({ 'POST /api/auth/logout-all': undefined });
    const { queryClient } = renderWithQuery(<SecuritySettings />);
    queryClient.setQueryData(['session'], { id: 'user-1' });

    await userEvent.click(screen.getByRole('button', { name: 'Log out everywhere' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Log out everywhere' }),
    );

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith('/'));
    expect(queryClient.getQueryData(['session'])).toBeNull();
  });
});
