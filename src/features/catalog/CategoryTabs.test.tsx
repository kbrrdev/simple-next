import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getCategoryTree, type CategoryNode } from './api';
import { CategoryTabs, ShopByCategory } from './CategoryTabs';

vi.mock('./api', () => ({ getCategoryTree: vi.fn(), findCategory: vi.fn() }));

// The rows scroll in a ScrollRow, which watches its size. jsdom does not lay out pages.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

function category(id: string, name: string): CategoryNode {
  return {
    id,
    name,
    parentId: null,
    imageAssetId: null,
    imageUrl: null,
    icon: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    children: [],
  };
}

describe('ShopByCategory', () => {
  it('links each top-level category', async () => {
    vi.mocked(getCategoryTree).mockResolvedValue([
      category('c1', 'Shirts'),
      category('c2', 'Bags'),
    ]);
    render(await ShopByCategory());

    expect(screen.getByRole('heading', { name: 'Shop by category' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shirts' })).toHaveAttribute('href', '/categories/c1');
    expect(screen.getByRole('link', { name: 'Bags' })).toHaveAttribute('href', '/categories/c2');
  });

  it('shows the image when there is one, and otherwise the icon', async () => {
    vi.mocked(getCategoryTree).mockResolvedValue([
      {
        ...category('c1', 'Bags'),
        icon: 'shopping-bag',
        imageUrl: 'http://localhost:3000/uploads/bags.jpg',
      },
      { ...category('c2', 'Shoes'), icon: 'footprints' },
      { ...category('c3', 'Hats'), icon: 'not-an-icon' },
    ]);
    const { container } = render(await ShopByCategory());

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toContain('bags.jpg');
    // Only Shoes shows an icon: Bags has its image, and Hats has neither.
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Shoes' }).querySelector('svg')).not.toBeNull(),
    );
    expect(screen.getByRole('link', { name: 'Hats' }).querySelector('svg, img')).toBeNull();
  });

  it('shows the icon when the image cannot load', async () => {
    vi.mocked(getCategoryTree).mockResolvedValue([
      {
        ...category('c1', 'Bags'),
        icon: 'shopping-bag',
        imageUrl: 'http://localhost:3000/uploads/missing.jpg',
      },
    ]);
    const { container } = render(await ShopByCategory());

    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(container.querySelector('img')).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Bags' }).querySelector('svg')).not.toBeNull(),
    );
  });

  it('shows nothing without categories', async () => {
    vi.mocked(getCategoryTree).mockResolvedValue([]);

    expect(await ShopByCategory()).toBeNull();
  });
});

describe('CategoryTabs', () => {
  it('sends the All tab to every product', async () => {
    vi.mocked(getCategoryTree).mockResolvedValue([category('c1', 'Shirts')]);
    render(await CategoryTabs({ activeId: null }));

    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('href', '/products');
  });
});
