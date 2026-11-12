import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

const href = (page: number) => `/search?page=${page}`;

describe('Pagination', () => {
  it('links to the pages around the current one', () => {
    render(<Pagination page={2} limit={10} total={35} href={href} />);

    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
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
