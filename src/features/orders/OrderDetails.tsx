import Image from 'next/image';
import { OrderTotals } from '@/components/OrderTotals';
import { formatAddress } from '@/features/checkout/address';
import { formatDate, formatDateTime } from '@/lib/dates';
import { formatCents } from '@/lib/money';
import type { GuestOrder, Order } from './api';

const statusLabels: Record<Order['status'], string> = {
  awaiting_payment: 'Waiting for payment',
  pending: 'Being prepared',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

const paymentLabels: Record<Order['paymentStatus'], string> = {
  unpaid: 'Not paid',
  submitted: 'Payment reference sent, waiting for confirmation',
  paid: 'Paid',
  refunded: 'Refunded',
};

function PaymentInstructions({ order }: { order: Order | GuestOrder }) {
  if (order.paymentType === 'cod') {
    return <p>Pay {formatCents(order.totalCents)} in cash when your order arrives.</p>;
  }
  if (order.status !== 'awaiting_payment' || !order.payment) {
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
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Account name</dt>
        <dd>{accountName}</dd>
        <dt className="text-muted-foreground">Account number</dt>
        <dd className="font-medium">{accountNumber}</dd>
      </dl>
      {qrUrl && (
        <div className="relative size-48 overflow-hidden rounded-md border bg-white">
          <Image
            src={qrUrl}
            alt={`QR code for paying through ${providerName}`}
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Keep your payment reference, as the store confirms it before preparing your order.
      </p>
    </div>
  );
}

/** An order as the shopper sees it, for accounts and guests. */
export function OrderDetails({ order }: { order: Order | GuestOrder }) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Order {order.orderNumber} · Placed {formatDate(order.createdAt)}
        </p>
        <p className="text-lg font-semibold">{statusLabels[order.status]}</p>
      </div>

      <section className="space-y-2 rounded-md border p-4" aria-labelledby="payment-heading">
        <h2 id="payment-heading" className="font-semibold">
          Payment
        </h2>
        <PaymentInstructions order={order} />
      </section>

      <section className="space-y-3" aria-labelledby="items-heading">
        <h2 id="items-heading" className="font-semibold">
          Items
        </h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-3 text-sm">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground">
                  {[
                    item.option1Name && `${item.option1Name}: ${item.option1Value}`,
                    item.option2Name && `${item.option2Name}: ${item.option2Value}`,
                    `Qty ${item.quantity}`,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              <p>{formatCents(item.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        <OrderTotals {...order} />
      </section>

      {order.shippingAddress && (
        <section className="space-y-1 text-sm" aria-labelledby="address-heading">
          <h2 id="address-heading" className="font-semibold">
            Shipping to
          </h2>
          <p>
            {order.shippingAddress.recipientName}, {order.shippingAddress.phone}
          </p>
          <p>{formatAddress(order.shippingAddress)}</p>
        </section>
      )}
    </div>
  );
}
