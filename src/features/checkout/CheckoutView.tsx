'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Banknote, MapPin, Plus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Field } from '@/components/Field';
import { Loading } from '@/components/Loading';
import { CardListSkeleton, CheckoutSkeleton } from '@/components/skeletons';
import { OrderTotals } from '@/components/OrderTotals';
import { ChoiceCard } from '@/components/ChoiceCard';
import { FallbackImage } from '@/components/FallbackImage';
import { Button } from '@/components/ui/button';
import { useAddresses, useCreateAddress } from '@/features/addresses/api';
import { useSession } from '@/features/auth/session';
import { useCart } from '@/features/cart/api';
import { ApiError, errorMessage } from '@/lib/api';
import { formError } from '@/lib/form-errors';
import { formatCents } from '@/lib/money';
import {
  addressErrorsFrom,
  emptyAddress,
  formatAddress,
  validateAddress,
  type AddressErrors,
} from './address';
import { AddressForm } from './AddressForm';
import {
  useOrderPreview,
  usePaymentMethods,
  usePlaceAccountOrder,
  usePlaceGuestOrder,
} from './api';
import { nextAttempt, type Attempt } from './attempt';
import { CouponField, FreeShippingNote } from './CouponField';

const newAddress = 'new';
const cashOnDelivery = 'cod';

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="space-y-5 border-b border-hairline py-8 first:pt-0 last:border-b-0"
      aria-label={title}
    >
      <h2 className="text-[1.375rem] font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();
  const user = session.data ?? null;
  const { cart, isPending: cartPending, error: cartError, isGuest, guestItems } = useCart();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [address, setAddress] = useState(emptyAddress);
  const [clientAddressErrors, setClientAddressErrors] = useState<AddressErrors>({});
  const [chosenAddressId, setChosenAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  // A guest's email reaches the preview once the field is left, for once-per-customer coupons.
  const [previewEmail, setPreviewEmail] = useState<string>();

  const items = isGuest
    ? guestItems
    : (cart?.items ?? []).map(({ variantId, quantity }) => ({ variantId, quantity }));

  const addresses = useAddresses(Boolean(user));
  const paymentMethods = usePaymentMethods();
  const preview = useOrderPreview(items, {
    ...(couponCode && { couponCode }),
    ...(!user && previewEmail && { email: previewEmail }),
  });
  const createAddress = useCreateAddress();
  const placeAccountOrder = usePlaceAccountOrder();
  const placeGuestOrder = usePlaceGuestOrder();

  if (session.isPending || cartPending) return <CheckoutSkeleton />;
  if (cartError) {
    return (
      <p role="alert" className="text-destructive">
        Your cart could not be loaded. {errorMessage(cartError)}
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p>Your cart is empty.</p>
        <Link href="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const savedAddresses = addresses.data ?? [];
  const defaultAddress = savedAddresses.find((saved) => saved.isDefault) ?? savedAddresses[0];
  const addressChoice = chosenAddressId ?? defaultAddress?.id ?? newAddress;
  const usesAddressForm = !user || addressChoice === newAddress;

  // Cash on delivery is for accounts only, and the API does not list it.
  const paymentOptions = [
    ...(user ? [{ id: cashOnDelivery, label: 'Cash on delivery' }] : []),
    ...(paymentMethods.data ?? []).map((method) => ({ id: method.id, label: method.providerName })),
  ];

  const placeError = placeAccountOrder.error ?? placeGuestOrder.error;
  const failure = placeError ?? createAddress.error;
  const addressErrors = { ...addressErrorsFrom(failure), ...clientAddressErrors };
  const itemErrors = new Map(
    placeError instanceof ApiError
      ? placeError.details.map((detail) => [detail.field, detail.message])
      : [],
  );
  const hasFieldErrors =
    Object.keys(addressErrorsFrom(failure)).length > 0 ||
    (failure instanceof ApiError &&
      failure.details.some((detail) => detail.field === 'email' || itemErrors.has(detail.field)));
  const busy = createAddress.isPending || placeAccountOrder.isPending || placeGuestOrder.isPending;
  const canPlace =
    !busy && Boolean(preview.data) && !preview.isPlaceholderData && Boolean(paymentMethod);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview.data || !paymentMethod) return;

    const nextAddressErrors = usesAddressForm ? validateAddress(address) : {};
    const nextEmailError = !user && !isEmail(email) ? 'Enter your email.' : '';
    setClientAddressErrors(nextAddressErrors);
    setEmailError(nextEmailError || undefined);
    if (Object.keys(nextAddressErrors).length > 0 || nextEmailError) return;

    const expectedTotalCents = preview.data.totalCents;
    // Only a coupon the preview used goes with the order, so the total matches it.
    const usedCoupon = preview.data.coupon?.automatic ? undefined : preview.data.coupon?.code;

    try {
      if (user) {
        let addressId = addressChoice;
        if (addressId === newAddress) {
          const created = await createAddress.mutateAsync(address);
          // Chosen from now on, so that a retry does not save the address twice.
          setChosenAddressId(created.id);
          addressId = created.id;
        }

        const current = nextAttempt(
          attempt,
          JSON.stringify({ items, addressId, paymentMethod, usedCoupon, expectedTotalCents }),
          () => crypto.randomUUID(),
        );
        setAttempt(current);

        const order = await placeAccountOrder.mutateAsync({
          addressId,
          paymentMethod,
          couponCode: usedCoupon,
          expectedTotalCents,
          idempotencyKey: current.idempotencyKey,
        });
        router.push(`/orders/${order.id}`);
        return;
      }

      const current = nextAttempt(
        attempt,
        JSON.stringify({ items, email, address, paymentMethod, usedCoupon, expectedTotalCents }),
        () => crypto.randomUUID(),
      );
      setAttempt(current);

      const order = await placeGuestOrder.mutateAsync({
        email: email.trim(),
        address,
        items,
        paymentMethod,
        couponCode: usedCoupon,
        expectedTotalCents,
        idempotencyKey: current.idempotencyKey,
      });
      router.push(`/orders/guest#token=${encodeURIComponent(order.guestToken)}`);
    } catch {
      // The error is shown below. Prices or stock may have changed, so the total is checked again.
      await queryClient.invalidateQueries({ queryKey: ['checkout', 'preview'] });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-10 md:grid-cols-[1fr_minmax(20rem,26rem)] md:gap-16 lg:gap-24"
    >
      <div className="min-w-0">
        <Section title="Contact">
          {user ? (
            <p>
              Ordering as <span className="font-medium">{user.email}</span>
            </p>
          ) : (
            <>
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                error={
                  emailError ??
                  (failure instanceof ApiError
                    ? failure.details.find((detail) => detail.field === 'email')?.message
                    : undefined)
                }
                hint="For your order updates."
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setPreviewEmail(isEmail(email) ? email.trim() : undefined)}
              />
              <p className="text-sm">
                Have an account?{' '}
                <Link href="/login?next=%2Fcheckout" className="underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </Section>

        <Section title="Shipping address">
          {user && addresses.isPending && <CardListSkeleton label="Loading your addresses" />}
          {user && addresses.error && (
            <p role="alert" className="text-destructive">
              Your addresses could not be loaded. {errorMessage(addresses.error)}
            </p>
          )}
          {user && savedAddresses.length > 0 && (
            <fieldset className="space-y-3">
              <legend className="sr-only">Choose an address</legend>
              {savedAddresses.map((saved) => (
                <ChoiceCard
                  key={saved.id}
                  name="address"
                  checked={addressChoice === saved.id}
                  onChange={() => setChosenAddressId(saved.id)}
                  icon={<MapPin aria-hidden className="size-6" strokeWidth={1.5} />}
                >
                  <span className="block font-semibold">
                    {saved.recipientName}, {saved.phone}
                  </span>
                  <span className="block text-muted-foreground">{formatAddress(saved)}</span>
                </ChoiceCard>
              ))}
              <ChoiceCard
                name="address"
                checked={addressChoice === newAddress}
                onChange={() => setChosenAddressId(newAddress)}
                icon={<Plus aria-hidden className="size-6" strokeWidth={1.5} />}
              >
                <span className="font-semibold">Add a new address</span>
              </ChoiceCard>
            </fieldset>
          )}
          {usesAddressForm && !(user && addresses.isPending) && (
            <AddressForm value={address} errors={addressErrors} onChange={setAddress} />
          )}
        </Section>

        <Section title="Payment">
          {paymentMethods.isPending && <CardListSkeleton label="Loading payment methods" />}
          {paymentMethods.error && (
            <p role="alert" className="text-destructive">
              Payment methods could not be loaded. {errorMessage(paymentMethods.error)}
            </p>
          )}
          {!paymentMethods.isPending && paymentOptions.length === 0 && (
            <p>
              No payment method is available for guests.{' '}
              <Link href="/login?next=%2Fcheckout" className="underline">
                Log in
              </Link>{' '}
              to pay cash on delivery.
            </p>
          )}
          {paymentOptions.length > 0 && (
            <fieldset className="space-y-3">
              <legend className="sr-only">Choose how to pay</legend>
              {paymentOptions.map((option) => (
                <ChoiceCard
                  key={option.id}
                  name="payment"
                  checked={paymentMethod === option.id}
                  onChange={() => setPaymentMethod(option.id)}
                  icon={
                    option.id === cashOnDelivery ? (
                      <Banknote aria-hidden className="size-6" strokeWidth={1.5} />
                    ) : (
                      <Wallet aria-hidden className="size-6" strokeWidth={1.5} />
                    )
                  }
                >
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-muted-foreground">
                    {option.id === cashOnDelivery
                      ? 'Pay in cash when your order arrives.'
                      : 'Pay outside the store, then send the reference.'}
                  </span>
                </ChoiceCard>
              ))}
              {paymentMethod && paymentMethod !== cashOnDelivery && (
                <p className="text-sm text-muted-foreground">
                  After placing your order, you will see the account to pay and the deadline.
                </p>
              )}
            </fieldset>
          )}
          {!user && paymentOptions.length > 0 && (
            <p className="text-sm text-muted-foreground">Cash on delivery needs an account.</p>
          )}
        </Section>
      </div>

      <aside className="h-fit md:sticky md:top-32" aria-label="Order summary">
        <div className="space-y-5 rounded-xl border border-border p-6 shadow-float">
          <h2 className="text-lg font-semibold">Order summary</h2>
          {preview.isPending && <Loading label="Calculating your total..." />}
          {preview.error && (
            <p role="alert" className="text-sm text-destructive">
              Your total could not be calculated. {errorMessage(preview.error)}
            </p>
          )}
          {preview.data && (
            <>
              <ul className="space-y-4 border-b border-hairline pb-5 text-sm">
                {preview.data.items.map((item) => (
                  <li key={item.variantId} className="flex gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl && (
                        <FallbackImage
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="56px"
                          iconClassName="size-4"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span className="font-semibold">{item.productName}</span>
                        <span className="tabular-nums">{formatCents(item.lineTotalCents)}</span>
                      </span>
                      <span className="block text-muted-foreground">Qty {item.quantity}</span>
                      {itemErrors.has(item.variantId) && (
                        <span className="block text-destructive">
                          {itemErrors.get(item.variantId)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <CouponField
                applied={couponCode}
                preview={preview.isPlaceholderData ? undefined : preview.data}
                onApply={setCouponCode}
                onRemove={() => setCouponCode(null)}
              />
              <OrderTotals
                {...preview.data}
                couponCode={
                  preview.data.coupon?.automatic ? null : (preview.data.coupon?.code ?? null)
                }
              />
              <FreeShippingNote remainingCents={preview.data.freeShippingRemainingCents} />
            </>
          )}
          {failure && !hasFieldErrors && (
            <p role="alert" className="text-sm text-destructive">
              {formError(failure)}
            </p>
          )}
          {failure && hasFieldErrors && (
            <p role="alert" className="text-sm text-destructive">
              {failure.message} Check the marked details.
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={!canPlace}>
            {busy ? 'Placing your order...' : 'Place order'}
          </Button>
        </div>
      </aside>
    </form>
  );
}
