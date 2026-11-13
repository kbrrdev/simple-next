import { QueryClientProvider } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { searchScreen } from './search-screen';
import { SearchBox, SearchScreen } from './SearchBox';
import { matchCategories, splitMatches, type SearchCategory } from './suggestions';

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: '/',
  search: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.search,
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
}));

const categories: SearchCategory[] = [
  { id: 'men', label: 'Men', imageUrl: null, topLevel: true },
  { id: 'men-shirts', label: 'Men › Shirts', imageUrl: null, topLevel: false },
  { id: 'women', label: 'Women', imageUrl: null, topLevel: true },
];

function product(id: string, name: string, prices: number[]) {
  return {
    id,
    name,
    images: [],
    variants: prices.map((priceCents) => ({ priceCents, stock: 1 })),
  };
}

beforeEach(() => {
  vi.mocked(request).mockReset();
  navigation.push.mockReset();
});

/**
 * A suggestion by its text. jsdom puts spaces between a name's bolded parts when it computes
 * accessible names, which browsers do not, so names are matched on their text instead.
 */
async function findOption(text: string) {
  let found: HTMLElement | undefined;
  await waitFor(
    () => {
      found = screen.getAllByRole('option').find((option) => option.textContent?.includes(text));
      expect(found).toBeDefined();
    },
    { timeout: 3000 },
  );
  return found as HTMLElement;
}

function field() {
  // The wide-screen field. Phones show a button that opens the full-screen view instead.
  return screen.getByRole('combobox', { name: 'Search products' });
}

describe('SearchBox', () => {
  it('offers the top-level categories before typing', async () => {
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.click(field());

    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    expect(within(listbox).getByRole('group', { name: 'Browse categories' })).toBeInTheDocument();
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['MenCategory', 'WomenCategory']);
    expect(request).not.toHaveBeenCalled();
  });

  it('suggests products and categories after a pause, from two characters', async () => {
    vi.mocked(request).mockResolvedValue({
      data: [product('p1', 'Linen Shirt', [129900, 99900])],
    });
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.type(field(), 's');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(request).not.toHaveBeenCalled();

    await userEvent.type(field(), 'h');

    expect(await findOption('Linen Shirt')).toHaveTextContent('from ₱999.00');
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('/api/products', { query: { search: 'sh', limit: 5 } });
    expect(await findOption('Men › Shirts')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /See all results for/ })).toBeInTheDocument();
    expect(
      within(await findOption('Linen Shirt')).getByText('Sh', { selector: 'strong' }),
    ).toBeInTheDocument();
  });

  it('opens the highlighted suggestion with the arrow keys and Enter', async () => {
    vi.mocked(request).mockResolvedValue({ data: [product('p1', 'Linen Shirt', [99900])] });
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.type(field(), 'shirt');
    await findOption('Linen Shirt');
    await userEvent.keyboard('{ArrowDown}');

    expect(field()).toHaveAttribute('aria-activedescendant', (await findOption('Linen Shirt')).id);

    await userEvent.keyboard('{Enter}');
    expect(navigation.push).toHaveBeenCalledWith('/products/p1');
  });

  it('searches for the text when nothing is highlighted', async () => {
    vi.mocked(request).mockResolvedValue({ data: [] });
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.type(field(), 'red shirt{Enter}');

    expect(navigation.push).toHaveBeenCalledWith('/search?q=red%20shirt');
  });

  it('says when no products match, and still offers the full search', async () => {
    vi.mocked(request).mockResolvedValue({ data: [] });
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.type(field(), 'zzz');

    expect(
      await screen.findByText('No products match "zzz".', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /See all results for/ })).toBeInTheDocument();
  });

  it('leaves out products when the API fails, and keeps the rest', async () => {
    vi.mocked(request).mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.type(field(), 'men');

    await waitFor(() => expect(screen.queryByText('Searching…')).not.toBeInTheDocument());
    expect(screen.queryByRole('group', { name: 'Products' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^MenCategory/ })).toBeInTheDocument();
  });

  it('closes the suggestions with Escape', async () => {
    renderWithQuery(<SearchBox categories={categories} />);

    await userEvent.click(field());
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('SearchScreen', () => {
  beforeEach(() => {
    navigation.pathname = '/';
    act(() => searchScreen.close());
  });

  it('opens from the tab bar, focused, and closes with its back button', async () => {
    renderWithQuery(<SearchScreen categories={categories} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => searchScreen.toggle());

    const dialog = screen.getByRole('dialog', { name: 'Search' });
    expect(within(dialog).getByRole('combobox')).toHaveFocus();
    expect(within(dialog).getByRole('group', { name: 'Browse categories' })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close search' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when the tab bar is tapped again', () => {
    renderWithQuery(<SearchScreen categories={categories} />);

    act(() => searchScreen.toggle());
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => searchScreen.toggle());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when the shopper moves to another page, such as the cart', () => {
    const { rerender, queryClient } = renderWithQuery(<SearchScreen categories={categories} />);
    act(() => searchScreen.open());
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    navigation.pathname = '/cart';
    rerender(
      <QueryClientProvider client={queryClient}>
        <SearchScreen categories={categories} />
      </QueryClientProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts with the current search filled in', () => {
    navigation.search = new URLSearchParams({ q: 'linen' });
    renderWithQuery(<SearchScreen categories={categories} />);

    act(() => searchScreen.open());

    expect(within(screen.getByRole('dialog')).getByRole('combobox')).toHaveValue('linen');
    navigation.search = new URLSearchParams();
  });
});

describe('suggestion helpers', () => {
  it('finds categories by any part of their name, starts first', () => {
    expect(matchCategories(categories, 'men').map((category) => category.id)).toEqual([
      'men',
      'men-shirts',
      'women',
    ]);
    expect(matchCategories(categories, 'm')).toEqual([]);
  });

  it('splits text around the typed words, ignoring case', () => {
    expect(splitMatches('Linen Shirt', 'shirt')).toEqual([
      { text: 'Linen ', match: false },
      { text: 'Shirt', match: true },
    ]);
    expect(splitMatches('A (b)', '(b')).toEqual([
      { text: 'A ', match: false },
      { text: '(b', match: true },
      { text: ')', match: false },
    ]);
  });
});
