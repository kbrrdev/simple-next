'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ApiError, errorMessage } from '@/lib/api';
import { isId } from '@/lib/search-params';
import {
  canCancel,
  needsPaymentReference,
  useCancelOrder,
  useOrder,
  useSubmitPayment,
  type Order,
} from './api';
import { OrderDetails } from './OrderDetails';
import { PaymentReferenceForm } from './PaymentReferenceForm';

function NotFound() {
  return (
    <div className="space-y-3">
      <p>This order could not be found.</p>
      <Link href="/account/orders" className="underline">
        See your orders
      </Link>
    </div>
  );
}

function CancelOrder({ order }: { order: Order }) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelOrder(order.id);

  return (
    <>
      <Button variant="outline" onClick={() => setConfirming(true)}>
        Cancel order
      </Button>
      {confirming && (
        <ConfirmDialog
          title={`Cancel order ${order.orderNumber}?`}
          description="The order is cancelled and its items are released. This cannot be undone."
          actionLabel="Cancel order"
          destructive
          pending={cancel.isPending}
          error={cancel.error}
          onConfirm={() => cancel.mutate(undefined, { onSuccess: () => setConfirming(false) })}
          onClose={() => {
            setConfirming(false);
            cancel.reset();
          }}
        />
      )}
    </>
  );
}

function LoadedOrder({ id }: { id: string }) {
  const order = useOrder(id);
  const submitPayment = useSubmitPayment(id);

  if (order.isPending) return <Loading label="Loading your order..." />;
  if (order.error instanceof ApiError && order.error.status === 404) return <NotFound />;
  if (order.error) {
    return (
      <p role="alert" className="text-destructive">
        Your order could not be loaded. {errorMessage(order.error)}
      </p>
    );
  }

  return (
    <OrderDetails
      order={order.data}
      paymentAction={
        needsPaymentReference(order.data) && (
          <PaymentReferenceForm providerName={order.data.paymentProvider} submit={submitPayment} />
        )
      }
      actions={canCancel(order.data) && <CancelOrder order={order.data} />}
    />
  );
}

/** A logged-in shopper's order. */
export function OrderView() {
  const { id } = useParams<{ id: string }>();

  return isId(id) ? <LoadedOrder id={id} /> : <NotFound />;
}
