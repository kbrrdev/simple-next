'use client';

import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { FallbackImage } from '@/components/FallbackImage';
import { formatCents } from '@/lib/money';
import type { Product } from './api';
import { productImageClass } from './grid';
import { isInStock, optionSummary, priceRange, sortedImages } from './product';

const imageSizes =
  '(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

/**
 * A product's photos, swiped on touch screens and stepped with arrows on hover. The dots show
 * where the shopper is, and only the photo in view is loaded early.
 */
function PhotoCarousel({ product, href }: { product: Product; href: string }) {
  const images = sortedImages(product);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const element = track.current;
    if (element) setIndex(Math.round(element.scrollLeft / element.clientWidth));
  }

  function step(direction: 1 | -1) {
    const element = track.current;
    element?.scrollBy({ left: direction * element.clientWidth, behavior: 'smooth' });
  }

  if (images.length === 0) {
    return (
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="flex size-full items-center justify-center text-muted-foreground"
      >
        <ImageOff className="size-8" strokeWidth={1.25} />
      </Link>
    );
  }

  const arrow =
    'absolute top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-raise transition-[opacity,transform] hover:scale-105 hover:bg-background group-hover:flex focus-visible:flex';

  return (
    <>
      <div
        ref={track}
        onScroll={onScroll}
        className="scrollbar-none flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((image, position) => (
          <Link
            key={image.id}
            href={href}
            tabIndex={-1}
            aria-hidden
            className="relative size-full shrink-0 snap-center"
          >
            <FallbackImage
              src={image.url}
              alt={image.altText}
              fill
              sizes={imageSizes}
              loading={position === 0 ? 'eager' : 'lazy'}
              className="object-cover"
            />
          </Link>
        ))}
      </div>
      {images.length > 1 && (
        <>
          {index > 0 && (
            <button
              type="button"
              aria-label={`Previous photo of ${product.name}`}
              onClick={() => step(-1)}
              className={`${arrow} left-3`}
            >
              <ChevronLeft aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              aria-label={`Next photo of ${product.name}`}
              onClick={() => step(1)}
              className={`${arrow} right-3`}
            >
              <ChevronRight aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
          >
            {images.slice(0, 5).map((image, position) => (
              <span
                key={image.id}
                className={`size-1.5 rounded-full bg-white shadow-[0_0_2px_rgb(0_0_0/0.4)] transition-opacity ${
                  position === Math.min(index, 4) ? 'opacity-100' : 'opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.id}`;
  const { min, max } = priceRange(product.variants);
  const soldOut = !isInStock(product.variants);
  const options = optionSummary(product);

  return (
    <div className="group">
      <div className={`relative overflow-hidden bg-muted ${productImageClass}`}>
        <PhotoCarousel product={product} href={href} />
        {soldOut && (
          <span className="absolute top-3 left-3 rounded-full bg-background px-3 py-1 text-xs font-semibold shadow-raise">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5 text-[0.9375rem] leading-snug">
        <h3>
          <Link href={href} className="font-semibold hover:underline">
            {product.name}
          </Link>
        </h3>
        {options && <p className="text-muted-foreground">{options}</p>}
        <p className="pt-1">
          {min !== max && <span>from </span>}
          <span className="font-semibold tabular-nums">{formatCents(min)}</span>
        </p>
      </div>
    </div>
  );
}
