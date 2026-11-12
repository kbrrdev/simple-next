import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddressInput } from '@/features/checkout/address';
import { request, type Schemas } from '@/lib/api';

export type Address = Schemas['Address'];

const addressesKey = ['addresses'];

// The API's limit, shown as a hint. The API's error remains the authority.
export const maxAddresses = 20;

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: addressesKey,
    queryFn: async () => {
      const { data } = await request<{ data: Address[] }>('/api/addresses');
      return data;
    },
    enabled,
  });
}

function useAddressMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressesKey }),
  });
}

export function useCreateAddress() {
  return useAddressMutation(async (address: AddressInput) => {
    const { data } = await request<{ data: Address }>('/api/addresses', {
      method: 'POST',
      body: address,
    });
    return data;
  });
}

export function useUpdateAddress() {
  return useAddressMutation(async ({ id, address }: { id: string; address: AddressInput }) => {
    const { data } = await request<{ data: Address }>(`/api/addresses/${id}`, {
      method: 'PATCH',
      body: address,
    });
    return data;
  });
}

export function useDeleteAddress() {
  return useAddressMutation((id: string) => request(`/api/addresses/${id}`, { method: 'DELETE' }));
}

export function useSetDefaultAddress() {
  return useAddressMutation((id: string) =>
    request(`/api/addresses/${id}/default`, { method: 'POST' }),
  );
}
