'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Schemas } from '@/lib/api';
import { cn } from '@/lib/utils';

type Banner = Schemas['Banner'];

/** Phones get the phone image when there is one, through `<picture>`, so only one image loads. */
function BannerImage({ banner, first }: { banner: Banner; first: boolean }) {
  const common = {
    alt: banner.altText,
    fill: true,
    sizes: '100vw',
    loading: first ? 'eager' : 'lazy',
    fetchPriority: first ? 'high' : 'auto',
  } as const;
  const wide = getImageProps({ ...common, src: banner.imageUrl }).props;
  const image = getImageProps({ ...common, src: banner.mobileImageUrl ?? banner.imageUrl }).props;

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide.srcSet} sizes={wide.sizes} />
      <img {...image} alt={banner.altText} className="object-cover" />
    </picture>
  );
}

function Slide({ banner, first }: { banner: Banner; first: boolean }) {
  const content = (
    <>
      <BannerImage banner={banner} first={first} />
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-6 pt-16 pb-10 text-white md:p-10 md:pt-24 md:pb-12">
          {banner.title && (
            <p className="text-2xl font-bold tracking-tight text-balance md:text-4xl">
              {banner.title}
            </p>
          )}
          {banner.subtitle && <p className="mt-1 text-sm md:mt-2 md:text-lg">{banner.subtitle}</p>}
        </div>
      )}
    </>
  );

  return banner.linkUrl ? (
    <Link href={banner.linkUrl} className="relative block size-full">
      {content}
    </Link>
  ) : (
    <div className="relative size-full">{content}</div>
  );
}

/**
 * The home page's banners, swiped on touch screens and stepped with arrows on hover. It does not
 * play by itself, so nothing moves that the shopper did not move.
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (banners.length === 0) return null;

  // Phone images are tall, so the row is tall on phones only when a banner has one.
  const hasPhoneImage = banners.some((banner) => banner.mobileImageUrl);

  function step(direction: 1 | -1) {
    const element = track.current;
    element?.scrollBy({ left: direction * element.clientWidth, behavior: 'smooth' });
  }

  const arrow =
    'absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-raise transition-transform hover:scale-105 hover:bg-background group-hover:flex focus-visible:flex';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="group relative -mx-6 overflow-hidden md:mx-0 md:rounded-xl"
    >
      <div
        ref={track}
        onScroll={() => {
          const element = track.current;
          if (element) setIndex(Math.round(element.scrollLeft / element.clientWidth));
        }}
        className={cn(
          'scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-muted md:aspect-3/1',
          hasPhoneImage ? 'aspect-4/5' : 'aspect-2/1',
        )}
      >
        {banners.map((banner, position) => (
          <div
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} of ${banners.length}`}
            className="size-full shrink-0 snap-center"
          >
            <Slide banner={banner} first={position === 0} />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <>
          {index > 0 && (
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => step(-1)}
              className={cn(arrow, 'left-4')}
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
          )}
          {index < banners.length - 1 && (
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => step(1)}
              className={cn(arrow, 'right-4')}
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5"
          >
            {banners.map((banner, position) => (
              <span
                key={banner.id}
                className={cn(
                  'size-2 rounded-full bg-white shadow-[0_0_2px_rgb(0_0_0/0.4)] transition-opacity',
                  position === index ? 'opacity-100' : 'opacity-50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
