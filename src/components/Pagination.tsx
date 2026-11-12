import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  /** The link to a page, keeping the list's other filters. */
  href: (page: number) => string;
}

/** The first, last, and nearby pages, with a gap marker where pages are skipped. */
export function pageNumbers(page: number, pages: number): (number | 'gap')[] {
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);

  return shown.flatMap((value, index) =>
    index > 0 && value - shown[index - 1] > 1 ? ['gap' as const, value] : [value],
  );
}

const circle = 'flex size-9 items-center justify-center rounded-full text-sm tabular-nums';

export function Pagination({ page, limit, total, href }: PaginationProps) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-12">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="Previous" className={cn(circle, 'hover:bg-muted')}>
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(circle, 'text-border')}>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pageNumbers(page, pages).map((value, index) =>
        value === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden className={circle}>
            …
          </span>
        ) : value === page ? (
          <span
            key={value}
            aria-current="page"
            className={cn(circle, 'bg-foreground font-semibold text-background')}
          >
            {value}
          </span>
        ) : (
          <Link
            key={value}
            href={href(value)}
            aria-label={`Page ${value}`}
            className={cn(circle, 'hover:bg-muted')}
          >
            {value}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={href(page + 1)} aria-label="Next" className={cn(circle, 'hover:bg-muted')}>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(circle, 'text-border')}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
