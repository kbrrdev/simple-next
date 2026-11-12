import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { guestCart } from '@/features/cart/guest-cart';
import { refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { VariantPicker } from './VariantPicker';

vi.mock('next/navigation', () => ({
  usePathname: () => '/products/1',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

const sRed = '00000000-0000-4000-8000-000000000001';
const mRed = '00000000-0000-4000-8000-000000000002';
const mBlue = '00000000-0000-4000-8000-000000000003';

const variants = [
  { id: sRed, option1Value: 'S', option2Value: 'Red', priceCents: 19900, stock: 3 },
  { id: mRed, option1Value: 'M', option2Value: 'Red', priceCents: 21900, stock: 0 },
  { id: mBlue, option1Value: 'M', option2Value: 'Blue', priceCents: 22900, stock: 2 },
];

beforeEach(() => {
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
  guestCart.clear();
});

describe('VariantPicker', () => {
  it('shows the chosen variant, and updates its price and stock', async () => {
    const user = userEvent.setup();
    renderWithQuery(<VariantPicker option1Name="Size" option2Name="Color" variants={variants} />);

    expect(screen.getByText('₱199.00')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'M' }));

    expect(screen.getByText('₱219.00')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Blue' }));

    expect(screen.getByText('₱229.00')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
  });

  it('shows only the price for products without options', () => {
    renderWithQuery(
      <VariantPicker
        option1Name={null}
        option2Name={null}
        variants={[
          { id: sRed, option1Value: null, option2Value: null, priceCents: 59900, stock: 0 },
        ]}
      />,
    );

    expect(screen.getByText('₱599.00')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it("adds the chosen variant to a guest's cart in the browser", async () => {
    vi.mocked(refreshSession).mockResolvedValue(false);
    renderWithQuery(<VariantPicker option1Name="Size" option2Name="Color" variants={variants} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    await waitFor(() => expect(guestCart.read()).toEqual([{ variantId: sRed, quantity: 1 }]));
    expect(request).not.toHaveBeenCalled();
  });

  it("adds the chosen variant to a logged-in shopper's cart in the API", async () => {
    vi.mocked(refreshSession).mockResolvedValue(true);
    vi.mocked(request).mockImplementation(async (path) =>
      path === '/api/auth/me' ? { data: { id: 'user' } } : { data: {} },
    );
    renderWithQuery(<VariantPicker option1Name="Size" option2Name="Color" variants={variants} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/api/cart/items', {
        method: 'POST',
        body: { variantId: sRed, quantity: 1 },
      }),
    );
    expect(guestCart.read()).toEqual([]);
  });
});
