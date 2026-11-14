'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A row that scrolls sideways by touch, trackpad, or keyboard, with round arrow buttons on wider
 * screens. Each arrow shows only while there is more to see that way.
 */
export function ScrollRow({ label, children }: { label: string; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = row.current;
    if (!element) return;

    const update = () =>
      setEdges({
        start: element.scrollLeft <= 1,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      });

    update();
    element.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, []);

  function scroll(direction: 1 | -1) {
    const element = row.current;
    element?.scrollBy({ left: direction * element.clientWidth * 0.7, behavior: 'smooth' });
  }

  const arrowClass =
    'absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-raise transition-transform hover:scale-105 md:flex';

  return (
    <div className="relative">
      {/*
        Relative, so that anything absolutely placed inside, such as a screen reader's label,
        is clipped by the row rather than widening the page.
      */}
      <div
        ref={row}
        role="group"
        aria-label={label}
        className="scrollbar-none relative overflow-x-auto"
      >
        {children}
      </div>
      {!edges.start && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-background to-transparent md:block"
          />
          <button
            type="button"
            aria-label="Scroll back"
            onClick={() => scroll(-1)}
            className={cn(arrowClass, 'left-0')}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
        </>
      )}
      {!edges.end && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-background to-transparent md:block"
          />
          <button
            type="button"
            aria-label="Scroll forward"
            onClick={() => scroll(1)}
            className={cn(arrowClass, 'right-0')}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
