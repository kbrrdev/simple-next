import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartKey } from '@/features/cart/api';
import { guestCart, type GuestCartItem } from '@/features/cart/guest-cart';
import { orderKey } from '@/features/orders/api';
import { request, type Schemas } from '@/lib/api';
import type { AddressInput } from './address';

export type PaymentMethodOption = Schemas['PaymentMethodOption'];
export type OrderPreview = Schemas['OrderPreview'];
type Order = Schemas['Order'];
type GuestOrder = Schemas['GuestOrder'];

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await request<{ data: PaymentMethodOption[] }>('/api/payment-methods');
      return data;
    },
  });
}

/**
 * The total the shopper confirms, with discounts, tax, and shipping, from the API. A coupon that
 * cannot be used comes back as `couponError`, rather than failing. A guest's email lets the API
 * check once-per-customer coupons.
 */
export function useOrderPreview(
  items: GuestCartItem[],
  discount: { couponCode?: string; email?: string } = {},
) {
  return useQuery({
    queryKey: ['checkout', 'preview', items, discount],
    queryFn: async () => {
      const { data } = await request<{ data: OrderPreview }>('/api/orders/preview', {
        method: 'POST',
        body: { items, ...discount },
      });
      return data;
    },
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
  });
}

interface OrderBase {
  paymentMethod: string;
  couponCode?: string;
  expectedTotalCents: number;
  idempotencyKey: string;
  acceptTerms: boolean;
}

/** Orders the account's cart, which the API then empties. */
export function usePlaceAccountOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: OrderBase & { addressId: string }) => {
      const { data } = await request<{ data: Order }>('/api/orders', {
        method: 'POST',
        body: order,
      });
      return data;
    },
    onSuccess: async (order) => {
      queryClient.setQueryData(orderKey(order.id), order);
      await queryClient.invalidateQueries({ queryKey: cartKey });
    },
  });
}

export function usePlaceGuestOrder() {
  return useMutation({
    mutationFn: async (
      order: OrderBase & { email: string; address: AddressInput; items: GuestCartItem[] },
    ) => {
      const { data } = await request<{ data: GuestOrder }>('/api/orders/guest', {
        method: 'POST',
        body: order,
      });
      return data;
    },
    onSuccess: () => guestCart.clear(),
  });
}
