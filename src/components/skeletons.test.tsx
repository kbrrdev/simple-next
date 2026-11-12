import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ArticleSkeleton,
  BlogListSkeleton,
  CardListSkeleton,
  CartSkeleton,
  CategoryListSkeleton,
  CheckoutSkeleton,
  OrderListSkeleton,
  OrderSkeleton,
  PageSkeleton,
  ProductGridSkeleton,
  ProductPageSkeleton,
} from './skeletons';

const skeletons: [string, ReactElement][] = [
  ['Loading products', <ProductGridSkeleton key="grid" />],
  ['Loading categories', <CategoryListSkeleton key="categories" />],
  ['Loading product', <ProductPageSkeleton key="product" />],
  ['Loading posts', <BlogListSkeleton key="posts" />],
  ['Loading post', <ArticleSkeleton key="post" />],
  ['Loading your cart', <CartSkeleton key="cart" />],
  ['Loading your orders', <OrderListSkeleton key="orders" />],
  ['Loading your order', <OrderSkeleton key="order" />],
  ['Loading your addresses', <CardListSkeleton key="cards" label="Loading your addresses" />],
  ['Loading checkout', <CheckoutSkeleton key="checkout" />],
  ['Loading', <PageSkeleton key="page" />],
];

describe('skeletons', () => {
  it.each(skeletons)('announces "%s", and hides its blocks', (label, skeleton) => {
    const { container } = render(skeleton);

    expect(screen.getByRole('status')).toHaveTextContent(label);
    const blocks = container.querySelectorAll('[data-slot="skeleton"]');
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => expect(block).toHaveAttribute('aria-hidden', 'true'));
  });

  it('does not pulse for people who ask for less motion', () => {
    const { container } = render(<PageSkeleton />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveClass(
      'motion-safe:animate-pulse',
    );
  });
});
