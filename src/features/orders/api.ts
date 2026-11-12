import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request, type Schemas } from '@/lib/api';

export type Order = Schemas['Order'];
export type GuestOrder = Schemas['GuestOrder'];
export type OrderStatus = Order['status'];
type PageMeta = Schemas['PageMeta'];

const ordersKey = ['orders'];

export function orderKey(id: string) {
  return [...ordersKey, id];
}

function guestOrderKey(token: string | null) {
  return [...ordersKey, 'guest', token];
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKey(id),
    queryFn: async () => {
      const { data } = await request<{ data: Order }>(`/api/orders/${id}`);
      return data;
    },
  });
}

export const ordersPageSize = 10;

/** The shopper's orders, newest first. */
export function useOrders({ page, status }: { page: number; status?: OrderStatus }) {
  return useQuery({
    queryKey: [...ordersKey, 'list', { page, status }],
    queryFn: () =>
      request<{ data: Order[]; meta: PageMeta }>('/api/orders', {
        query: { page, limit: ordersPageSize, status },
      }),
    placeholderData: keepPreviousData,
  });
}

/** A guest's order, opened with the private token from its link. */
export function useGuestOrder(token: string | null) {
  return useQuery({
    queryKey: guestOrderKey(token),
    queryFn: async () => {
      const { data } = await request<{ data: GuestOrder }>(
        `/api/orders/guest/${encodeURIComponent(token ?? '')}`,
      );
      return data;
    },
    enabled: Boolean(token),
  });
}

/** Changes an order, then reloads every order query, so that the list and the order agree. */
function useOrderMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey }),
  });
}

export function useSubmitPayment(id: string) {
  return useOrderMutation((reference: string) =>
    request(`/api/orders/${id}/payment`, { method: 'POST', body: { reference } }),
  );
}

export function useSubmitGuestPayment(token: string) {
  return useOrderMutation((reference: string) =>
    request(`/api/orders/guest/${encodeURIComponent(token)}/payment`, {
      method: 'POST',
      body: { reference },
    }),
  );
}

export function useCancelOrder(id: string) {
  return useOrderMutation(() => request(`/api/orders/${id}/cancel`, { method: 'POST' }));
}

/** Mirrors the backend's rule, which refuses to cancel anything else. */
export function canCancel(order: Pick<Order, 'status' | 'paymentStatus'>) {
  return (
    order.status === 'pending' ||
    (order.status === 'awaiting_payment' && order.paymentStatus === 'unpaid')
  );
}

/** Whether the order is waiting for the shopper's payment reference. */
export function needsPaymentReference(
  order: Pick<Order, 'status' | 'paymentStatus' | 'paymentType'>,
) {
  return (
    order.paymentType === 'manual' &&
    order.status === 'awaiting_payment' &&
    order.paymentStatus === 'unpaid'
  );
}
