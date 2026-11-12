import { useQuery } from '@tanstack/react-query';
import { request, type Schemas } from '@/lib/api';

export type Order = Schemas['Order'];
export type GuestOrder = Schemas['GuestOrder'];

export function orderKey(id: string) {
  return ['orders', id];
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

/** A guest's order, opened with the private token from its link. */
export function useGuestOrder(token: string | null) {
  return useQuery({
    queryKey: ['orders', 'guest', token],
    queryFn: async () => {
      const { data } = await request<{ data: GuestOrder }>(
        `/api/orders/guest/${encodeURIComponent(token ?? '')}`,
      );
      return data;
    },
    enabled: Boolean(token),
  });
}
