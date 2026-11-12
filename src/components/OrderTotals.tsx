import { formatCents } from '@/lib/money';

interface OrderTotalsProps {
  subtotalCents: number;
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
        <dd>{formatCents(totals.subtotalCents)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Shipping</dt>
        <dd>{totals.shippingCents === 0 ? 'Free' : formatCents(totals.shippingCents)}</dd>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <dt>{taxLabel}</dt>
        <dd>{formatCents(totals.taxCents)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatCents(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
