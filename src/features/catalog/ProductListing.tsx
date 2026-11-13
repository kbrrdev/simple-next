'use client';

import { Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/features/cart/api';
import { formatCents } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Product } from './api';
import { OptionPicker } from './OptionPicker';
import { sortedImages } from './product';
import { ProductGallery } from './ProductGallery';
import { findVariant, initialSelection, type VariantChoice } from './variants';

interface ProductListingProps {
  product: Product;
  category: { id: string; name: string } | null;
}

function Heading({ product, category, className }: ProductListingProps & { className?: string }) {
  return (
    <div className={cn('space-y-1', className)}>
      {category && (
        <Link
          href={`/categories/${category.id}`}
          className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {category.name}
        </Link>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-[1.875rem]">
        {product.name}
      </h1>
    </div>
  );
}

function StockLine({ stock }: { stock: number }) {
  return (
    <p className={cn('text-sm', stock > 0 ? 'text-muted-foreground' : 'text-destructive')}>
      {stock > 0 ? 'In stock' : 'Out of stock'}
    </p>
  );
}

/**
 * A product the way shops show it: the photos on the left, and on the right a purchase panel with
 * the title, price, options, and Add to cart, which stays in view. On phones a bar along the
 * bottom keeps the price and Add to cart in reach. The chosen variant drives the photos, price,
 * and stock, and its own photo shows large when it has one.
 */
export function ProductListing({ product, category }: ProductListingProps) {
  const variants: VariantChoice[] = product.variants;
  const [selection, setSelection] = useState(() => initialSelection(variants));
  const variant = findVariant(variants, selection);
  const images = sortedImages(product);
  const featuredId = images.find(
    (image) => variant?.assetId && image.assetId === variant.assetId,
  )?.id;
  const stock = variant?.stock ?? 0;

  const addToCart = useAddToCart();
  const router = useRouter();

  function add() {
    if (!variant) return;

    addToCart.mutate(
      { variantId: variant.id, quantity: 1 },
      {
        onSuccess: () =>
          toast.success('Added to cart', {
            action: { label: 'View cart', onClick: () => router.push('/cart') },
          }),
      },
    );
  }

  const canAdd = stock > 0 && !addToCart.isPending;
  const addLabel = addToCart.isPending ? 'Adding...' : stock > 0 ? 'Add to cart' : 'Sold out';
  const price = variant && formatCents(variant.priceCents);

  return (
    <>
      {/*
        Two columns from tablets up: the photos and description on the left, and the purchase
        panel on the right, staying in view. Phones stack the photos, the panel, then the details.
      */}
      <div className="grid gap-x-12 md:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-x-16">
        <div className="md:col-start-1 md:row-start-1">
          <ProductGallery name={product.name} images={images} featuredId={featuredId ?? null} />
        </div>

        <aside className="md:col-start-2 md:row-span-3 md:row-start-1">
          <section
            aria-label="Buy"
            className="space-y-6 border-b border-hairline pt-6 pb-8 md:sticky md:top-32 md:border-b-0 md:pt-0"
          >
            <Heading product={product} category={category} />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{price}</p>
              <StockLine stock={stock} />
            </div>
            <OptionPicker
              option1Name={product.option1Name}
              option2Name={product.option2Name}
              variants={variants}
              selection={selection}
              onSelect={setSelection}
            />
            {/* On phones, the bar along the bottom has the button. */}
            <div className="hidden space-y-4 md:block">
              <Button size="lg" className="h-12 w-full text-base" disabled={!canAdd} onClick={add}>
                {addLabel}
              </Button>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                Ships within the Philippines. Shipping and tax are shown at checkout.
              </p>
            </div>
          </section>
        </aside>

        {product.description && (
          <section
            aria-labelledby="about-heading"
            className="min-w-0 space-y-4 border-b border-hairline py-8 md:col-start-1 md:border-t md:border-b-0 md:pt-10"
          >
            <h2 id="about-heading" className="text-xl font-semibold">
              About this item
            </h2>
            <p className="max-w-prose leading-7 whitespace-pre-line">{product.description}</p>
          </section>
        )}

        <section aria-labelledby="delivery-heading" className="flex min-w-0 gap-4 py-8 md:hidden">
          <Truck aria-hidden className="mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 id="delivery-heading" className="font-semibold">
              Delivery
            </h2>
            <p className="text-muted-foreground">
              Ships within the Philippines. Shipping and tax are shown at checkout.
            </p>
          </div>
        </section>
      </div>

      {/* Phones: the price and Add to cart stay in reach, above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-4 border-t border-hairline bg-background px-6 py-3 md:hidden">
        <div className="min-w-0">
          <p className="font-semibold tabular-nums">{price}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[variant?.option1Value, variant?.option2Value].filter(Boolean).join(' · ') ||
              (stock > 0 ? 'In stock' : 'Out of stock')}
          </p>
        </div>
        <Button size="lg" className="h-12 px-6 text-base" disabled={!canAdd} onClick={add}>
          {addLabel}
        </Button>
      </div>
    </>
  );
}
