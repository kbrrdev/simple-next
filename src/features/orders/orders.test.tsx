import { render, screen } from '@testing-library/react';
import { ApiError, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import type { Order } from './api';
import { GuestOrderView } from './GuestOrderView';
import { OrderDetails } from './OrderDetails';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
}));

const order: Order = {
  id: 'order-1',
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
  shippingAddress: {
    recipientName: 'Juan Dela Cruz',
    phone: '+639171234567',
    line1: '123 Rizal Street',
    line2: '',
    barangay: 'San Antonio',
    city: 'Pasig',
    province: 'Metro Manila',
    postalCode: '1605',
  },
  items: [
    {
      id: 'item-1',
      variantId: 'variant-1',
      productName: 'Linen Shirt',
      option1Name: 'Size',
      option1Value: 'M',
      option2Name: null,
      option2Value: null,
      unitPriceCents: 100000,
      quantity: 1,
      taxCents: 10714,
      lineTotalCents: 100000,
      imageUrl: null,
    },
  ],
  createdAt: '2026-11-13T04:00:00.000Z',
  updatedAt: '2026-11-13T04:00:00.000Z',
};

beforeEach(() => {
  vi.mocked(request).mockReset();
  window.location.hash = '';
});

describe('OrderDetails', () => {
  it('shows who to pay and the deadline for a manual payment', () => {
    render(<OrderDetails order={order} />);

    expect(screen.getByText('Waiting for payment')).toBeInTheDocument();
    expect(screen.getByText('09171234567')).toBeInTheDocument();
    expect(screen.getByText('Sample Store')).toBeInTheDocument();
    expect(screen.getByText(/Unpaid orders are cancelled/)).toBeInTheDocument();
    expect(screen.getAllByText('₱1,150.00').length).toBeGreaterThan(0);
  });

  it('asks for cash on delivery', () => {
    render(
      <OrderDetails
        order={{
          ...order,
          status: 'pending',
          paymentType: 'cod',
          payment: null,
          paymentDueAt: null,
        }}
      />,
    );

    expect(screen.getByText('Pay ₱1,150.00 in cash when your order arrives.')).toBeInTheDocument();
  });

  it('asks for nothing once an unpaid order is cancelled', () => {
    for (const paymentType of ['cod', 'manual'] as const) {
      const { unmount } = render(
        <OrderDetails
          order={{ ...order, status: 'cancelled', paymentType, payment: null, paymentDueAt: null }}
        />,
      );

      expect(screen.getByText('This order was cancelled, so nothing is due.')).toBeInTheDocument();
      expect(screen.queryByText(/in cash when your order arrives/)).not.toBeInTheDocument();
      unmount();
    }
  });

  it('shows a cash payment as paid once collected', () => {
    render(
      <OrderDetails
        order={{
          ...order,
          status: 'delivered',
          paymentType: 'cod',
          paymentStatus: 'paid',
          payment: null,
          paymentDueAt: null,
        }}
      />,
    );

    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('leaves out the address once it is hidden', () => {
    render(<OrderDetails order={{ ...order, shippingAddress: null, guestToken: 'token' }} />);

    expect(screen.queryByText('Shipping to')).not.toBeInTheDocument();
  });
});

describe('GuestOrderView', () => {
  it('opens the order from the token in the link, and offers to save the link', async () => {
    window.location.hash = '#token=abc.def';
    vi.mocked(request).mockResolvedValue({ data: { ...order, guestToken: 'abc.def' } });
    renderWithQuery(<GuestOrderView />);

    expect(await screen.findByText('Save this link')).toBeInTheDocument();
    expect(screen.getByLabelText('Order link')).toHaveValue(window.location.href);
    expect(request).toHaveBeenCalledWith('/api/orders/guest/abc.def');
  });

  it('explains a link without a token', async () => {
    renderWithQuery(<GuestOrderView />);

    expect(await screen.findByText(/This order link is not valid/)).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('explains a link the API does not recognize', async () => {
    window.location.hash = '#token=wrong';
    vi.mocked(request).mockRejectedValue(
      new ApiError(404, { error: { message: 'Order not found' } }),
    );
    renderWithQuery(<GuestOrderView />);

    expect(await screen.findByText(/This order link is not valid/)).toBeInTheDocument();
  });
});
