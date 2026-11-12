'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api';
import { formatCents } from '@/lib/money';
import { useCart, useRemoveFromCart, useSetQuantity, type CartItem } from './api';
import { guestCart, maxItemQuantity } from './guest-cart';

// Mirrors the backend's rule as a hint. The backend refuses larger guest orders.
const maxGuestOrderQuantity = 10;

function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useSetQuantity();
  const remove = useRemoveFromCart();
  const busy = setQuantity.isPending || remove.isPending;
  const options = [
    item.option1Name && `${item.option1Name}: ${item.option1Value}`,
    item.option2Name && `${item.option2Name}: ${item.option2Value}`,
  ].filter(Boolean);
  const maxQuantity = Math.min(Math.max(item.stock, 1), maxItemQuantity);

  function change(quantity: number) {
    setQuantity.mutate({ variantId: item.variantId, quantity });
  }

  return (
    <li className="flex gap-4 py-4">
      <Link
        href={`/products/${item.productId}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {item.imageUrl && (
          <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <div>
            <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
              {item.productName}
            </Link>
            {options.length > 0 && <p className="text-muted-foreground">{options.join(', ')}</p>}
            <p>{formatCents(item.unitPriceCents)} each</p>
          </div>
          <p className="font-medium">{item.available && formatCents(item.lineTotalCents)}</p>
        </div>

        {!item.available ? (
          <p className="text-destructive">No longer available</p>
        ) : (
          item.quantity > item.stock && (
            <p className="text-destructive">
              {item.stock === 0 ? 'Out of stock' : `Only ${item.stock} in stock`}
            </p>
          )
        )}

        <div className="flex items-center gap-4">
          {item.available && (
            <div className="flex items-center gap-2" role="group" aria-label="Quantity">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Decrease quantity of ${item.productName}`}
                disabled={busy || item.quantity <= 1}
                onClick={() => change(item.quantity - 1)}
              >
                −
              </Button>
              <span aria-live="polite" className="w-8 text-center">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Increase quantity of ${item.productName}`}
                disabled={busy || item.quantity >= maxQuantity}
                onClick={() => change(item.quantity + 1)}
              >
                +
              </Button>
            </div>
          )}
          <Button
            variant="link"
            size="sm"
            className="px-0"
            disabled={busy}
            onClick={() => remove.mutate(item.variantId)}
          >
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const { cart, isPending, error, isGuest, guestItems, isStale } = useCart();

  // The API leaves out variants that no longer exist, so they are dropped from a guest's cart.
  const missing =
    isGuest && cart && !isStale
      ? guestItems.filter(
          (stored) => !cart.items.some((item) => item.variantId === stored.variantId),
        )
      : [];
  const missingIds = missing.map((item) => item.variantId).join();

  useEffect(() => {
    if (!missingIds) return;

    guestCart.remove(missingIds.split(','));
    toast.warning('An item in your cart is no longer sold, so it was removed.');
  }, [missingIds]);

  if (isPending) return <Loading label="Loading your cart..." />;
  if (error) {
    return (
      <p role="alert" className="text-destructive">
        Your cart could not be loaded. {errorMessage(error)}
      </p>
    );
  }
  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-3">
        <p>Your cart is empty.</p>
        <Link href="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_18rem]">
      <ul className="divide-y">
        {cart.items.map((item) => (
          <CartLine key={item.variantId} item={item} />
        ))}
      </ul>
      <aside className="h-fit space-y-4 rounded-md border p-4">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCents(cart.subtotalCents)}</span>
        </div>
        <p className="text-sm text-muted-foreground">Shipping and tax are shown at checkout.</p>
        {isGuest && totalQuantity > maxGuestOrderQuantity && (
          <p className="text-sm text-destructive">
            A guest order can have up to {maxGuestOrderQuantity} items. Log in, or remove some
            items.
          </p>
        )}
        {/* Checkout is built in a later step. */}
        <Button className="w-full" disabled>
          Checkout
        </Button>
      </aside>
    </div>
  );
}
