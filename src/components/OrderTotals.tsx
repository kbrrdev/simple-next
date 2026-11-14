import { formatCents } from '@/lib/money';

interface OrderTotalsProps {
  subtotalCents: number;
  /** Taken off by promotions, such as buy X get Y. */
  promotionDiscountCents: number;
  /** Each promotion by name, when known, as in the checkout preview. */
  promotions?: { id: string; name: string; discountCents: number }[];
  /** Taken off by a coupon, typed or automatic. */
  discountCents: number;
  /** The typed coupon, for its row's label. Automatic discounts have none. */
  couponCode: string | null;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  taxRatePercent: number;
  pricesIncludeTax: boolean;
}

/** The API's totals. Nothing here is calculated in the browser. */
export function OrderTotals(totals: OrderTotalsProps) {
  const taxLabel = totals.pricesIncludeTax
    ? `Includes VAT (${totals.taxRatePercent}%)`
    : `VAT (${totals.taxRatePercent}%)`;

  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{formatCents(totals.subtotalCents)}</dd>
      </div>
      {totals.promotions && totals.promotions.length > 0
        ? totals.promotions.map((promotion) => (
            <div key={promotion.id} className="flex justify-between gap-4 text-sale">
              <dt>{promotion.name}</dt>
              <dd className="tabular-nums">−{formatCents(promotion.discountCents)}</dd>
            </div>
          ))
        : totals.promotionDiscountCents > 0 && (
            <div className="flex justify-between text-sale">
              <dt>Promotions</dt>
              <dd className="tabular-nums">−{formatCents(totals.promotionDiscountCents)}</dd>
            </div>
          )}
      {totals.discountCents > 0 && (
        <div className="flex justify-between text-sale">
          <dt>{totals.couponCode ? `Coupon ${totals.couponCode}` : 'Discount'}</dt>
          <dd className="tabular-nums">−{formatCents(totals.discountCents)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd className="tabular-nums">
          {totals.shippingCents === 0 ? 'Free' : formatCents(totals.shippingCents)}
        </dd>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <dt>{taxLabel}</dt>
        <dd className="tabular-nums">{formatCents(totals.taxCents)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatCents(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
