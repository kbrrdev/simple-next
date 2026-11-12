'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { ApiError, errorMessage } from '@/lib/api';
import { isId } from '@/lib/search-params';
import { useOrder } from './api';
import { OrderDetails } from './OrderDetails';

function NotFound() {
  return (
    <div className="space-y-3">
      <p>This order could not be found.</p>
      <Link href="/" className="underline">
        Continue shopping
      </Link>
    </div>
  );
}

function LoadedOrder({ id }: { id: string }) {
  const order = useOrder(id);

  if (order.isPending) return <Loading label="Loading your order..." />;
  if (order.error instanceof ApiError && order.error.status === 404) return <NotFound />;
  if (order.error) {
    return (
      <p role="alert" className="text-destructive">
        Your order could not be loaded. {errorMessage(order.error)}
      </p>
    );
  }

  return <OrderDetails order={order.data} />;
}

/** A logged-in shopper's order. */
export function OrderView() {
  const { id } = useParams<{ id: string }>();

  return isId(id) ? <LoadedOrder id={id} /> : <NotFound />;
}
