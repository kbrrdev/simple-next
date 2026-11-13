import { FallbackImage } from '@/components/FallbackImage';
import type { ReactNode } from 'react';
import { OrderTotals } from '@/components/OrderTotals';
import { formatAddress } from '@/features/checkout/address';
import { formatDate, formatDateTime } from '@/lib/dates';
import { formatCents } from '@/lib/money';
import type { GuestOrder, Order } from './api';
import { cn } from '@/lib/utils';
import { paymentLabels, statusLabels } from './status';

// A small dot beside the status: amber while waiting, green once it moves, grey when it ends.
const statusDot: Partial<Record<Order['status'], string>> = {
  awaiting_payment: 'bg-amber-500',
  pending: 'bg-brand',
  confirmed: 'bg-brand',
  shipped: 'bg-brand',
  delivered: 'bg-brand',
  returned: 'bg-muted-foreground',
  cancelled: 'bg-muted-foreground',
};

function PaymentInstructions({ order }: { order: Order | GuestOrder }) {
  if (order.status === 'cancelled' && order.paymentStatus === 'unpaid') {
    return <p>This order was cancelled, so nothing is due.</p>;
  }
  if (order.paymentType === 'cod') {
    // Cash is only collected while the order is on its way.
    return order.paymentStatus === 'unpaid' && order.status !== 'returned' ? (
      <p>Pay {formatCents(order.totalCents)} in cash when your order arrives.</p>
    ) : (
      <p>{paymentLabels[order.paymentStatus]}</p>
    );
  }
  if (order.status !== 'awaiting_payment' || order.paymentStatus !== 'unpaid' || !order.payment) {
    return <p>{paymentLabels[order.paymentStatus]}</p>;
  }

  const { providerName, accountName, accountNumber, qrUrl } = order.payment;

  return (
    <div className="space-y-3">
      <p>
        Send <strong>{formatCents(order.totalCents)}</strong> through {providerName}
        {order.paymentDueAt && (
          <>
            {' '}
            by <strong>{formatDateTime(order.paymentDueAt)}</strong>. Unpaid orders are cancelled
            after that
          </>
        )}
        .
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg bg-muted p-4 text-sm">
        <dt className="text-muted-foreground">Account name</dt>
        <dd className="font-semibold">{accountName}</dd>
        <dt className="text-muted-foreground">Account number</dt>
        <dd className="font-semibold tabular-nums">{accountNumber}</dd>
      </dl>
      {qrUrl && (
        <div className="relative size-48 overflow-hidden rounded-lg border border-border bg-white">
          <FallbackImage
            src={qrUrl}
            alt={`QR code for paying through ${providerName}`}
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        After paying, send the reference number below. The store confirms it before preparing your
        order.
      </p>
    </div>
  );
}

/** An order as the shopper sees it, for accounts and guests. */
interface OrderDetailsProps {
  order: Order | GuestOrder;
  /** Shown under the payment instructions, such as the payment reference form. */
  paymentAction?: ReactNode;
  /** Shown at the end, such as the cancel button. */
  actions?: ReactNode;
}

export function OrderDetails({ order, paymentAction, actions }: OrderDetailsProps) {
  const awaitingPayment = order.status === 'awaiting_payment' && order.paymentStatus === 'unpaid';

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Order {order.orderNumber} · Placed {formatDate(order.createdAt)}
        </p>
        <p className="flex items-center gap-2 text-[1.375rem] font-semibold tracking-tight">
          <span
            aria-hidden
            className={cn('size-2.5 rounded-full', statusDot[order.status] ?? 'bg-foreground')}
          />
          {statusLabels[order.status]}
        </p>
      </div>

      <section
        className={cn(
          'space-y-4 rounded-xl border p-6',
          awaitingPayment ? 'border-foreground shadow-float' : 'border-border',
        )}
        aria-labelledby="payment-heading"
      >
        <h2 id="payment-heading" className="text-lg font-semibold">
          Payment
        </h2>
        <PaymentInstructions order={order} />
        {paymentAction}
      </section>

      <section className="space-y-4" aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-lg font-semibold">
          Items
        </h2>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 text-sm">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl && (
                  <FallbackImage
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    iconClassName="size-4"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.productName}</p>
                <p className="text-muted-foreground">
                  {[
                    item.option1Name && `${item.option1Name}: ${item.option1Value}`,
                    item.option2Name && `${item.option2Name}: ${item.option2Value}`,
                    `Qty ${item.quantity}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <p className="font-semibold tabular-nums">{formatCents(item.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <div className="rounded-xl bg-muted p-6">
          <OrderTotals {...order} />
        </div>
      </section>

      {order.shippingAddress && (
        <section className="space-y-1" aria-labelledby="address-heading">
          <h2 id="address-heading" className="text-lg font-semibold">
            Shipping to
          </h2>
          <p>
            {order.shippingAddress.recipientName}, {order.shippingAddress.phone}
          </p>
          <p>{formatAddress(order.shippingAddress)}</p>
        </section>
      )}

      {actions}
    </div>
  );
}
