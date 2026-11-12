import { render, screen } from '@testing-library/react';
import type { Product } from './api';
import { ProductGrid } from './ProductGrid';

function product(
  id: string,
  name: string,
  variants: [priceCents: number, stock: number][],
): Product {
  return {
    id,
    categoryId: 'category',
    name,
    description: '',
    option1Name: null,
    option2Name: null,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    images: [],
    variants: variants.map(([priceCents, stock], index) => ({
      id: `${id}-${index}`,
      productId: id,
      option1Value: null,
      option2Value: null,
      assetId: null,
      priceCents,
      stock,
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })),
  };
}

describe('ProductGrid', () => {
  it('links each product, with its price', () => {
    render(
      <ProductGrid
        empty="Nothing here"
        products={[
          product('tote', 'Canvas Tote', [[59900, 4]]),
          product('shirt', 'Linen Shirt', [
            [129900, 0],
            [99900, 2],
          ]),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Canvas Tote/ })).toHaveAttribute(
      'href',
      '/products/tote',
    );
    expect(screen.getByText('₱599.00')).toBeInTheDocument();
    expect(screen.getByText('From ₱999.00')).toBeInTheDocument();
  });

  it('marks products that are out of stock', () => {
    render(<ProductGrid empty="Nothing here" products={[product('a', 'Mug', [[30000, 0]])]} />);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows the empty message', () => {
    render(<ProductGrid empty="No products match." products={[]} />);

    expect(screen.getByText('No products match.')).toBeInTheDocument();
  });
});
