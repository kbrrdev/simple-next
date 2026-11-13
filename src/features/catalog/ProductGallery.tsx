'use client';

import { ChevronLeft, ImageOff, LayoutGrid, X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { FallbackImage } from '@/components/FallbackImage';
import { cn } from '@/lib/utils';
import type { Product } from './api';

type ProductImage = Product['images'][number];

interface ProductGalleryProps {
  name: string;
  /** In display order. */
  images: ProductImage[];
  /** The chosen variant's own photo, shown first when it has one. */
  featuredId: string | null;
}

function Photo({
  image,
  sizes,
  priority,
}: {
  image: ProductImage;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <FallbackImage
      src={image.url}
      alt={image.altText}
      fill
      sizes={sizes}
      preload={priority}
      className="object-cover"
    />
  );
}

/**
 * Every photo in one scrolling column, opened from "Show all photos" or a photo. It starts at
 * the photo the shopper chose.
 */
function AllPhotos({
  name,
  images,
  open,
  startId,
  onOpenChange,
}: {
  name: string;
  images: ProductImage[];
  open: boolean;
  startId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            if (startId) document.getElementById(`photo-${startId}`)?.scrollIntoView();
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-background outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4"
        >
          <div className="sticky top-0 z-10 flex items-center bg-background/95 px-4 py-3 md:px-10">
            <DialogPrimitive.Close
              aria-label="Close photos"
              className="flex size-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <ChevronLeft aria-hidden className="size-5 md:hidden" />
              <X aria-hidden className="hidden size-5 md:block" />
            </DialogPrimitive.Close>
            <DialogPrimitive.Title className="ml-2 truncate font-semibold">
              {name}
            </DialogPrimitive.Title>
          </div>
          <ul className="mx-auto grid max-w-3xl gap-2 px-4 pb-10 md:gap-3 md:px-10">
            {images.map((image) => (
              <li
                key={image.id}
                id={`photo-${image.id}`}
                className="relative aspect-square scroll-mt-16 overflow-hidden rounded-lg bg-muted"
              >
                <Photo image={image} sizes="(min-width: 768px) 768px, 100vw" />
              </li>
            ))}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * A product's photos. Wide screens show a mosaic of up to five, with the main photo large. Phones
 * swipe through them, with a counter. Either opens every photo in a full-screen view.
 */
export function ProductGallery({ name, images, featuredId }: ProductGalleryProps) {
  const [open, setOpen] = useState(false);
  const [startId, setStartId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  // The chosen variant's photo leads the mosaic.
  const lead = images.find((image) => image.id === featuredId) ?? images[0];
  const ordered = lead ? [lead, ...images.filter((image) => image.id !== lead.id)] : [];

  // On phones, choosing a variant with its own photo swipes to it.
  useEffect(() => {
    const element = track.current;
    const position = images.findIndex((image) => image.id === featuredId);
    if (element && position >= 0) {
      element.scrollTo?.({ left: position * element.clientWidth, behavior: 'smooth' });
    }
  }, [featuredId, images]);

  function show(imageId: string | null) {
    setStartId(imageId);
    setOpen(true);
  }

  if (images.length === 0) {
    return (
      <div className="-mx-6 flex aspect-square items-center justify-center bg-muted text-muted-foreground md:mx-0 md:aspect-auto md:h-[min(28rem,50vh)] md:rounded-xl">
        <ImageOff aria-hidden className="size-10" strokeWidth={1.25} />
      </div>
    );
  }

  const tiles = ordered.slice(0, 5);
  const mosaic = cn(
    // Capped in height, so that the price and Add to cart show early on a laptop.
    'hidden h-[min(28rem,50vh)] gap-2 overflow-hidden rounded-xl md:grid',
    tiles.length === 1 && 'grid-cols-1',
    tiles.length === 2 && 'grid-cols-2',
    tiles.length >= 3 && 'grid-cols-4 grid-rows-2',
  );

  return (
    <>
      {/* Wide screens: the mosaic. */}
      <div className="relative">
        <div className={mosaic}>
          {tiles.map((image, position) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show photo ${position + 1} of ${images.length}`}
              onClick={() => show(image.id)}
              className={cn(
                'group relative overflow-hidden bg-muted',
                tiles.length >= 3 && position === 0 && 'col-span-2 row-span-2',
                tiles.length === 3 && position > 0 && 'col-span-2',
                tiles.length === 4 && position === 3 && 'col-span-2',
              )}
            >
              <Photo
                image={image}
                priority={position === 0}
                sizes={position === 0 && tiles.length > 1 ? '50vw' : '25vw'}
              />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => show(null)}
            className="absolute right-6 bottom-6 hidden items-center gap-2 rounded-lg border border-foreground bg-background px-4 py-2 text-sm font-semibold shadow-raise transition-colors hover:bg-muted md:flex"
          >
            <LayoutGrid aria-hidden className="size-4" />
            Show all photos
          </button>
        )}
      </div>

      {/* Phones: a full-width swipe, with a counter. */}
      <div className="relative -mx-6 md:hidden">
        <div
          ref={track}
          onScroll={() => {
            const element = track.current;
            if (element) setIndex(Math.round(element.scrollLeft / element.clientWidth));
          }}
          className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show photo ${position + 1} of ${images.length}`}
              onClick={() => show(image.id)}
              className="relative size-full shrink-0 snap-center bg-muted"
            >
              <Photo image={image} priority={position === 0} sizes="100vw" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <span
            aria-hidden
            className="absolute right-4 bottom-4 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white tabular-nums"
          >
            {Math.min(index + 1, images.length)} / {images.length}
          </span>
        )}
      </div>

      <AllPhotos name={name} images={images} open={open} startId={startId} onOpenChange={setOpen} />
    </>
  );
}
