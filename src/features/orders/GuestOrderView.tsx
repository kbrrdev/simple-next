'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError, errorMessage } from '@/lib/api';
import {
  needsPaymentReference,
  useGuestOrder,
  useSubmitGuestPayment,
  type GuestOrder,
} from './api';
import { OrderDetails } from './OrderDetails';
import { PaymentReferenceForm } from './PaymentReferenceForm';
import { OrderSkeleton } from '@/components/skeletons';

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

/**
 * The token from `#token=...`. It is in the fragment so that it never reaches a server, a log,
 * or another site.
 */
function useTokenFromHash() {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => null,
  );
  if (hash === null) return undefined;

  return new URLSearchParams(hash.slice(1)).get('token');
}

function SaveLink() {
  const [copied, setCopied] = useState(false);
  const link = window.location.href;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="save-link-heading"
      className="space-y-3 rounded-md border-2 border-foreground p-4"
    >
      <h2 id="save-link-heading" className="font-semibold">
        Save this link
      </h2>
      <p className="text-sm">
        This link is the only way back to your order. It was not emailed to you, so bookmark it or
        copy it somewhere safe. Anyone with the link can see the order, so keep it private.
      </p>
      <div className="flex gap-2">
        <label htmlFor="order-link" className="sr-only">
          Order link
        </label>
        <input
          id="order-link"
          readOnly
          value={link}
          onFocus={(event) => event.target.select()}
          className="h-9 min-w-0 flex-1 rounded-md border bg-muted px-2 text-sm"
        />
        <Button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
    </section>
  );
}

/** A guest's order, opened from its private link. */
export function GuestOrderView() {
  const token = useTokenFromHash();
  const order = useGuestOrder(token ?? null);

  if (token === undefined) return <OrderSkeleton />;
  if (!token || (order.error instanceof ApiError && order.error.status === 404)) {
    return <p>This order link is not valid. Check that you copied the whole link.</p>;
  }
  if (order.isPending) return <OrderSkeleton />;
  if (order.error) {
    return (
      <p role="alert" className="text-destructive">
        Your order could not be loaded. {errorMessage(order.error)}
      </p>
    );
  }

  return <LoadedGuestOrder token={token} order={order.data} />;
}

function LoadedGuestOrder({ token, order }: { token: string; order: GuestOrder }) {
  const submitPayment = useSubmitGuestPayment(token);

  return (
    <div className="space-y-8">
      <SaveLink />
      <OrderDetails
        order={order}
        paymentAction={
          needsPaymentReference(order) && (
            <PaymentReferenceForm providerName={order.paymentProvider} submit={submitPayment} />
          )
        }
      />
    </div>
  );
}
