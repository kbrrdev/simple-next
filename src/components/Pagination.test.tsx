import { render, screen } from '@testing-library/react';
import { Pagination, pageNumbers } from './Pagination';

const href = (page: number) => `/search?page=${page}`;

describe('Pagination', () => {
  it('links to the pages around the current one, and marks the current page', () => {
    render(<Pagination page={2} limit={10} total={35} href={href} />);

    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Page 4' })).toHaveAttribute('href', '/search?page=4');
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/search?page=1',
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/search?page=3');
  });

  it('hides links past either end', () => {
    render(<Pagination page={4} limit={10} total={35} href={href} />);

    expect(screen.queryByRole('link', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} limit={10} total={5} href={href} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('pageNumbers', () => {
  it('shows the ends and the nearby pages, with gaps between', () => {
    expect(pageNumbers(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
  });
});
