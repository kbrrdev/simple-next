import { formatCents } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * A price from the API. When a sale lowered it, the price before the sale shows struck through.
 */
export function Price({
  cents,
  compareAtCents,
  className,
}: {
  cents: number;
  compareAtCents?: number | null;
  className?: string;
}) {
  const onSale = compareAtCents != null && compareAtCents > cents;

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('font-semibold tabular-nums', onSale && 'text-sale')}>
        {formatCents(cents)}
      </span>
      {onSale && (
        <s className="text-[0.875em] font-normal text-muted-foreground tabular-nums">
          <span className="sr-only">was </span>
          {formatCents(compareAtCents)}
        </s>
      )}
    </span>
  );
}

/** The share taken off by a sale, for "Save 20%". The API's prices decide it; this only labels them. */
export function percentOff(cents: number, compareAtCents: number | null | undefined) {
  if (compareAtCents == null || compareAtCents <= cents) return null;
  return Math.round(((compareAtCents - cents) / compareAtCents) * 100);
}
