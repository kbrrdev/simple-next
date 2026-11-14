'use client';

import { Tag } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCents } from '@/lib/money';
import type { OrderPreview } from './api';

/**
 * The code as the API stores it, or null when its format is wrong. It mirrors the API's rule as a
 * hint, as a malformed code would fail the whole preview.
 */
export function normalizeCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  return /^[A-Z0-9_-]{3,32}$/.test(normalized) ? normalized : null;
}

interface CouponFieldProps {
  /** The code sent to the preview, or null. */
  applied: string | null;
  preview: Pick<OrderPreview, 'coupon' | 'couponError'> | undefined;
  onApply: (code: string) => void;
  onRemove: () => void;
}

/**
 * The coupon code. The API checks it in the preview, and says why when it cannot be used. It
 * sits inside the checkout form, so it applies with its own button rather than submitting.
 */
export function CouponField({ applied, preview, onApply, onRemove }: CouponFieldProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  function apply() {
    const normalized = normalizeCoupon(code);
    if (!normalized) {
      setError('Enter 3 to 32 letters, digits, - or _.');
      return;
    }
    setError(undefined);
    setCode('');
    onApply(normalized);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter would place the order, as the field is inside the checkout form.
    if (event.key === 'Enter') {
      event.preventDefault();
      apply();
    }
  }

  if (applied) {
    const used = preview?.coupon && !preview.coupon.automatic ? preview.coupon : null;
    const status = preview?.couponError
      ? { error: true, text: preview.couponError }
      : used
        ? { error: false, text: `${formatCents(used.discountCents)} off` }
        : preview?.coupon?.automatic
          ? { error: false, text: 'A better discount already applies, so this code is not used.' }
          : null;

    return (
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-semibold">
            <Tag aria-hidden className="size-4" />
            {applied}
          </span>
          <button type="button" onClick={onRemove} className="underline hover:no-underline">
            Remove<span className="sr-only"> coupon {applied}</span>
          </button>
        </div>
        {status && (
          <p
            role={status.error ? 'alert' : 'status'}
            className={status.error ? 'text-destructive' : 'text-muted-foreground'}
          >
            {status.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon">Coupon code</Label>
      <div className="flex gap-2">
        <Input
          id="coupon"
          autoComplete="off"
          value={code}
          maxLength={32}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'coupon-error' : undefined}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button type="button" variant="outline" onClick={apply} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      {error && (
        <p id="coupon-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** "Add ₱250.00 more for free shipping", from the API's preview. */
export function FreeShippingNote({ remainingCents }: { remainingCents: number | null }) {
  if (!remainingCents) return null;

  return (
    <p className="text-sm text-muted-foreground">
      Add <span className="font-semibold text-foreground">{formatCents(remainingCents)}</span> more
      for free shipping.
    </p>
  );
}
