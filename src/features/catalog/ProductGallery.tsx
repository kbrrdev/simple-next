'use client';

import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
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
  /** The chosen variant's own photo, shown large when it has one. */
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

/** Every photo in one scrolling column, starting at the photo the shopper opened. */
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
              <X aria-hidden className="size-5" />
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
 * A product's photos, the way shops show them. Wide screens show one large photo, with arrows,
 * above a row of thumbnails. Phones swipe through the photos, with dots. Opening a photo shows
 * every photo full screen.
 */
export function ProductGallery({ name, images, featuredId }: ProductGalleryProps) {
  const [open, setOpen] = useState(false);
  const [startId, setStartId] = useState<string | null>(null);
  // A thumbnail the shopper picks wins, until they choose another variant.
  const [picked, setPicked] = useState<{ id: string; featuredId: string | null } | null>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const activeId =
    picked && picked.featuredId === featuredId ? picked.id : (featuredId ?? images[0]?.id);
  const activeIndex = Math.max(
    images.findIndex((image) => image.id === activeId),
    0,
  );
  const active = images[activeIndex];

  // On phones, choosing a variant with its own photo swipes to it.
  useEffect(() => {
    const element = track.current;
    const position = images.findIndex((image) => image.id === featuredId);
    if (element && position >= 0) {
      element.scrollTo?.({ left: position * element.clientWidth, behavior: 'smooth' });
    }
  }, [featuredId, images]);

  function pick(index: number) {
    const image = images[(index + images.length) % images.length];
    setPicked({ id: image.id, featuredId });
  }

  function enlarge(imageId: string) {
    setStartId(imageId);
    setOpen(true);
  }

  if (!active) {
    return (
      <div className="-mx-6 flex aspect-square items-center justify-center bg-muted text-muted-foreground md:mx-0 md:rounded-xl">
        <ImageOff aria-hidden className="size-10" strokeWidth={1.25} />
      </div>
    );
  }

  const arrow =
    'absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-raise transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background';

  return (
    <>
      {/* Wide screens: the large photo, then the thumbnails. */}
      <div className="hidden space-y-3 md:block">
        <div className="group relative">
          <button
            type="button"
            aria-label={`Enlarge photo ${activeIndex + 1} of ${images.length}`}
            onClick={() => enlarge(active.id)}
            className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted"
          >
            <Photo key={active.id} image={active} priority sizes="(min-width: 1280px) 40vw, 55vw" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => pick(activeIndex - 1)}
                className={cn(arrow, 'left-4')}
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => pick(activeIndex + 1)}
                className={cn(arrow, 'right-4')}
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <ul className="grid grid-cols-5 gap-3">
            {images.map((image, position) => (
              <li key={image.id}>
                <button
                  type="button"
                  aria-label={`Show photo ${position + 1} of ${images.length}`}
                  aria-pressed={image.id === active.id}
                  onClick={() => pick(position)}
                  className={cn(
                    'relative block aspect-square w-full overflow-hidden rounded-lg bg-muted ring-offset-2 transition',
                    image.id === active.id
                      ? 'ring-2 ring-foreground'
                      : 'opacity-70 hover:opacity-100',
                  )}
                >
                  <Photo image={image} sizes="96px" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Phones: a full-width swipe, with dots. */}
      <div className="relative -mx-6 md:hidden">
        <div
          ref={track}
          onScroll={() => {
            const element = track.current;
            if (element) setSwipeIndex(Math.round(element.scrollLeft / element.clientWidth));
          }}
          className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Enlarge photo ${position + 1} of ${images.length}`}
              onClick={() => enlarge(image.id)}
              className="relative size-full shrink-0 snap-center bg-muted"
            >
              <Photo image={image} priority={position === 0} sizes="100vw" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div aria-hidden className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {images.map((image, position) => (
              <span
                key={image.id}
                className={cn(
                  'size-2 rounded-full bg-white shadow-[0_0_2px_rgb(0_0_0/0.4)] transition-opacity',
                  position === swipeIndex ? 'opacity-100' : 'opacity-50',
                )}
              />
            ))}
          </div>
        )}
      </div>

      <AllPhotos name={name} images={images} open={open} startId={startId} onOpenChange={setOpen} />
    </>
  );
}
