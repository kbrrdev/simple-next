import { screen, within } from '@testing-library/react';
import { refreshSession } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { MobileTabBar } from './MobileTabBar';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

function activeTab() {
  const tabs = within(screen.getByRole('navigation', { name: 'Tabs' }));
  return tabs.getAllByRole('link').find((link) => link.getAttribute('aria-current') === 'page');
}

beforeEach(() => {
  vi.mocked(refreshSession).mockResolvedValue(false);
});

describe('MobileTabBar', () => {
  it('offers Home, Search, Products, and the account, but not the cart', async () => {
    navigation.pathname = '/';
    renderWithQuery(<MobileTabBar />);

    const tabs = within(screen.getByRole('navigation', { name: 'Tabs' }));
    expect(tabs.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(tabs.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(tabs.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(await tabs.findByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(tabs.queryByRole('link', { name: /Cart/ })).not.toBeInTheDocument();
  });

  it.each([
    ['/', 'Home'],
    ['/products', 'Products'],
    ['/products/123', 'Products'],
    ['/categories/123', 'Products'],
    ['/search', 'Products'],
    ['/login', 'Log in'],
    ['/cart', undefined],
  ])('marks the tab for %s', (pathname, tab) => {
    navigation.pathname = pathname;
    renderWithQuery(<MobileTabBar />);

    expect(activeTab()?.textContent).toBe(tab);
  });

  it('is hidden on checkout', () => {
    navigation.pathname = '/checkout';
    renderWithQuery(<MobileTabBar />);

    expect(screen.queryByRole('navigation', { name: 'Tabs' })).not.toBeInTheDocument();
  });
});
