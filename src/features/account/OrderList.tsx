'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/Pagination';
import { Label } from '@/components/ui/label';
import { ordersPageSize, useOrders, type OrderStatus } from '@/features/orders/api';
import { orderStatuses, statusLabels } from '@/features/orders/status';
import { errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/dates';
import { formatCents } from '@/lib/money';
import { readPage } from '@/lib/search-params';
import { OrderListSkeleton } from '@/components/skeletons';

function readStatus(value: string | null): OrderStatus | undefined {
  return orderStatuses.find((status) => status === value);
}

function ordersHref(page: number, status?: OrderStatus) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/account/orders?${query}` : '/account/orders';
}

/** The shopper's orders. The status filter and page live in the URL, so links and Back work. */
export function OrderList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = readPage(searchParams.get('page') ?? undefined);
  const status = readStatus(searchParams.get('status'));
  const orders = useOrders({ page, status });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter">Status</Label>
        <select
          id="status-filter"
          value={status ?? ''}
          onChange={(event) => router.push(ordersHref(1, readStatus(event.target.value)))}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">All orders</option>
          {orderStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
      </div>

      {orders.isPending && <OrderListSkeleton />}
      {orders.error && (
        <p role="alert" className="text-destructive">
          Your orders could not be loaded. {errorMessage(orders.error)}
        </p>
      )}
      {orders.data && orders.data.data.length === 0 && (
        <div className="space-y-2">
          <p>{status ? 'No orders with this status.' : 'You have no orders yet.'}</p>
          {!status && (
            <Link href="/" className="underline">
              Start shopping
            </Link>
          )}
        </div>
      )}
      {orders.data && orders.data.data.length > 0 && (
        <>
          <ul className="divide-y rounded-md border">
            {orders.data.data.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-muted"
                >
                  <span>
                    <span className="block font-medium">{order.orderNumber}</span>
                    <span className="block text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {statusLabels[order.status]}
                    </span>
                  </span>
                  <span className="font-medium">{formatCents(order.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            limit={ordersPageSize}
            total={orders.data.meta.total}
            href={(value) => ordersHref(value, status)}
          />
        </>
      )}
    </div>
  );
}
