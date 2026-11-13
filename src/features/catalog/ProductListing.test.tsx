import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { guestCart } from '@/features/cart/guest-cart';
import { refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import type { Product } from './api';
import { ProductListing } from './ProductListing';

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

function variant(
  id: string,
  option1Value: string | null,
  option2Value: string | null,
  priceCents: number,
  stock: number,
  assetId: string | null = null,
) {
  return {
    id,
    productId: 'shirt',
    option1Value,
    option2Value,
    assetId,
    priceCents,
    stock,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function image(id: string, assetId: string, position: number) {
  return {
    id,
    productId: 'shirt',
    assetId,
    url: `http://api.test/uploads/${id}.png`,
    altText: `Shirt photo ${id}`,
    position,
  };
}

const shirt: Product = {
  id: 'shirt',
  categoryId: 'men',
  name: 'Linen Shirt',
  description: 'Light and airy.',
  option1Name: 'Size',
  option2Name: 'Color',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  images: [
    image('front', 'asset-front', 0),
    image('back', 'asset-back', 1),
    image('blue', 'asset-blue', 2),
  ],
  variants: [
    variant(sRed, 'S', 'Red', 19900, 3),
    variant(mRed, 'M', 'Red', 21900, 0),
    variant(mBlue, 'M', 'Blue', 22900, 2, 'asset-blue'),
  ],
};

function render(product = shirt) {
  return renderWithQuery(
    <ProductListing product={product} category={{ id: 'men', name: 'Men' }} />,
  );
}

// The purchase card's button. Phones show the same action in the bar along the bottom.
function addButton() {
  return screen.getAllByRole('button', { name: /Add to cart|Sold out|Adding/ })[0];
}

function highlighted(container: HTMLElement) {
  return [...container.querySelectorAll('label[data-selected]')].map((label) => label.textContent);
}

/** The large photo. Wide screens show it; phones swipe instead, later in the page. */
function largePhoto() {
  return within(screen.getAllByRole('button', { name: /^Enlarge photo/ })[0]).getByRole('img');
}

beforeEach(() => {
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
  guestCart.clear();
});

describe('ProductListing', () => {
  it('shows the chosen variant, and updates its price and stock', async () => {
    const user = userEvent.setup();
    render();

    expect(screen.getByRole('heading', { level: 1, name: 'Linen Shirt' })).toBeInTheDocument();
    expect(screen.getAllByText('₱199.00').length).toBeGreaterThan(0);
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'M' }));

    expect(screen.getAllByText('₱219.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(addButton()).toHaveTextContent('Sold out');
    expect(addButton()).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Blue' }));

    expect(screen.getAllByText('₱229.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
  });

  it('highlights exactly the chosen values, even when one option moves the other', async () => {
    const user = userEvent.setup();
    const { container } = render();

    expect(highlighted(container)).toEqual(['S', 'Red']);

    await user.click(screen.getByRole('radio', { name: 'M' }));
    expect(highlighted(container)).toEqual(['M', 'Red']);

    await user.click(screen.getByRole('radio', { name: 'Blue' }));
    expect(highlighted(container)).toEqual(['M', 'Blue']);

    // S only comes in Red, so choosing it moves the color too.
    await user.click(screen.getByRole('radio', { name: 'S' }));
    expect(highlighted(container)).toEqual(['S', 'Red']);
    expect(screen.getByRole('radio', { name: 'Red' })).toBeChecked();
  });

  it("shows the chosen variant's own photo large, and marks its thumbnail", async () => {
    const user = userEvent.setup();
    render();

    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo front');

    await user.click(screen.getByRole('radio', { name: 'M' }));
    await user.click(screen.getByRole('radio', { name: 'Blue' }));

    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo blue');
    expect(screen.getByRole('button', { name: 'Show photo 3 of 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches the large photo from the thumbnails and the arrows', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getByRole('button', { name: 'Show photo 2 of 3' }));
    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo back');
    expect(screen.getByRole('button', { name: 'Show photo 2 of 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo blue');

    // Past the last photo, the arrows wrap around.
    await user.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo front');

    // Choosing a variant with its own photo takes over the large photo.
    await user.click(screen.getByRole('radio', { name: 'M' }));
    await user.click(screen.getByRole('radio', { name: 'Blue' }));
    expect(largePhoto()).toHaveAttribute('alt', 'Shirt photo blue');
  });

  it('shows every photo in a full-screen view', async () => {
    const user = userEvent.setup();
    render();

    await user.click(screen.getAllByRole('button', { name: /^Enlarge photo/ })[0]);

    const dialog = await screen.findByRole('dialog', { name: 'Linen Shirt' });
    expect(within(dialog).getAllByRole('img')).toHaveLength(3);

    await user.click(within(dialog).getByRole('button', { name: 'Close photos' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows only the price for products without options', () => {
    render({
      ...shirt,
      option1Name: null,
      option2Name: null,
      images: [],
      variants: [variant(sRed, null, null, 59900, 0)],
    });

    expect(screen.getAllByText('₱599.00').length).toBeGreaterThan(0);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(addButton()).toBeDisabled();
  });

  it("adds the chosen variant to a guest's cart in the browser", async () => {
    vi.mocked(refreshSession).mockResolvedValue(false);
    render();

    await userEvent.click(addButton());

    await waitFor(() => expect(guestCart.read()).toEqual([{ variantId: sRed, quantity: 1 }]));
    expect(request).not.toHaveBeenCalled();
  });

  it("adds the chosen variant to a logged-in shopper's cart in the API", async () => {
    vi.mocked(refreshSession).mockResolvedValue(true);
    vi.mocked(request).mockImplementation(async (path) =>
      path === '/api/auth/me' ? { data: { id: 'user' } } : { data: {} },
    );
    render();

    await userEvent.click(addButton());

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/api/cart/items', {
        method: 'POST',
        body: { variantId: sRed, quantity: 1 },
      }),
    );
    expect(guestCart.read()).toEqual([]);
  });
});
