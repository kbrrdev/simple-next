'use client';

import { Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { FallbackImage } from '@/components/FallbackImage';
import { Price } from '@/components/Price';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api';
import { formatCents } from '@/lib/money';
import { useCart, useRemoveFromCart, useSetQuantity, type CartItem } from './api';
import { guestCart, maxItemQuantity } from './guest-cart';
import { CartSkeleton } from '@/components/skeletons';

// Mirrors the backend's rule as a hint. The backend refuses larger guest orders.
const maxGuestOrderQuantity = 10;

const stepperClass =
  'flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30';

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
    <li className="flex gap-4 py-6 md:gap-6">
      <Link
        href={`/products/${item.productId}`}
        className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted md:size-28"
      >
        {item.imageUrl && (
          <FallbackImage
            src={item.imageUrl}
            alt=""
            fill
            sizes="112px"
            iconClassName="size-5"
            className="object-cover"
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div className="min-w-0 space-y-0.5">
            <Link href={`/products/${item.productId}`} className="font-semibold hover:underline">
              {item.productName}
            </Link>
            {options.length > 0 && (
              <p className="text-sm text-muted-foreground">{options.join(' · ')}</p>
            )}
            <p className="text-sm text-muted-foreground">
              <Price cents={item.unitPriceCents} compareAtCents={item.compareAtPriceCents} /> each
            </p>
          </div>
          <p className="font-semibold tabular-nums">
            {item.available && formatCents(item.lineTotalCents)}
          </p>
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

        <div className="flex items-center justify-between gap-4">
          {item.available ? (
            <div
              className="flex items-center gap-1 rounded-full border border-border p-1"
              role="group"
              aria-label="Quantity"
            >
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.productName}`}
                disabled={busy || item.quantity <= 1}
                onClick={() => change(item.quantity - 1)}
                className={stepperClass}
              >
                <Minus aria-hidden className="size-4" />
              </button>
              <span aria-live="polite" className="w-8 text-center font-semibold tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.productName}`}
                disabled={busy || item.quantity >= maxQuantity}
                onClick={() => change(item.quantity + 1)}
                className={stepperClass}
              >
                <Plus aria-hidden className="size-4" />
              </button>
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => remove.mutate(item.variantId)}
            className="text-sm font-semibold underline underline-offset-4 disabled:opacity-50"
          >
            Remove
          </button>
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

  if (isPending) return <CartSkeleton />;
  if (error) {
    return (
      <p role="alert" className="text-destructive">
        Your cart could not be loaded. {errorMessage(error)}
      </p>
    );
  }
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border-t border-hairline py-10">
        <ShoppingBag aria-hidden className="size-8" strokeWidth={1.5} />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-muted-foreground">Find something you like, and it will show here.</p>
        </div>
        <Button asChild size="lg" variant="outline" className="border-foreground">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_minmax(20rem,24rem)] md:gap-16 lg:gap-24">
      <ul className="divide-y divide-hairline border-t border-hairline">
        {cart.items.map((item) => (
          <CartLine key={item.variantId} item={item} />
        ))}
      </ul>
      <aside className="h-fit md:sticky md:top-32">
        <div className="space-y-5 rounded-xl border border-border p-6 shadow-float">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between border-b border-hairline pb-5">
            <span>
              Subtotal · {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
            <span className="font-semibold tabular-nums">{formatCents(cart.subtotalCents)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Shipping and tax are shown at checkout.</p>
          {isGuest && totalQuantity > maxGuestOrderQuantity && (
            <p className="text-sm text-destructive">
              A guest order can have up to {maxGuestOrderQuantity} items. Log in, or remove some
              items.
            </p>
          )}
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
