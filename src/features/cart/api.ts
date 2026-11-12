import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { ensureSession, useSession } from '@/features/auth/session';
import { errorMessage, request, type Schemas } from '@/lib/api';
import { guestCart, useGuestCart, type GuestCartItem } from './guest-cart';

export type Cart = Schemas['Cart'];
export type CartItem = Schemas['CartItem'];
type MergedCart = Schemas['MergedCart'];

export const cartKey = ['cart'];

const emptyCart: Cart = { items: [], subtotalCents: 0 };

async function getAccountCart() {
  const { data } = await request<{ data: Cart }>('/api/cart');
  return data;
}

async function previewCart(items: GuestCartItem[]) {
  const { data } = await request<{ data: Cart }>('/api/cart/preview', {
    method: 'POST',
    body: { items },
  });
  return data;
}

function useSessionState() {
  const session = useSession();
  return { loggedIn: Boolean(session.data), loading: session.isPending };
}

/**
 * The priced cart. Logged-in shoppers' cart is in the API. A guest's is stored in the browser,
 * and priced by the API, as prices are never stored.
 */
export function useCart() {
  const { loggedIn, loading } = useSessionState();
  const guestItems = useGuestCart();
  const isGuest = !loading && !loggedIn;

  const account = useQuery({ queryKey: cartKey, queryFn: getAccountCart, enabled: loggedIn });
  const guest = useQuery({
    queryKey: [...cartKey, 'preview', guestItems],
    queryFn: () => previewCart(guestItems),
    enabled: isGuest && guestItems.length > 0,
    // Keeps the lines on screen while a changed quantity is priced again.
    placeholderData: keepPreviousData,
  });

  const base = { isGuest, guestItems, isStale: false };

  if (loading) return { ...base, cart: undefined, isPending: true, error: null };
  if (loggedIn) {
    return { ...base, cart: account.data, isPending: account.isPending, error: account.error };
  }
  if (guestItems.length === 0) {
    return { ...base, cart: emptyCart, isPending: false, error: null };
  }
  return {
    ...base,
    cart: guest.data,
    // The previous cart, shown while the changed one is priced. It does not match the stored lines.
    isStale: guest.isPlaceholderData,
    isPending: guest.isPending,
    error: guest.error,
  };
}

/** The number of items, for the header. A guest's count needs no request. */
export function useCartCount() {
  const { loggedIn } = useSessionState();
  const guestItems = useGuestCart();
  const account = useQuery({ queryKey: cartKey, queryFn: getAccountCart, enabled: loggedIn });

  const items = loggedIn ? (account.data?.items ?? []) : guestItems;
  return items.reduce((total, item) => total + item.quantity, 0);
}

function useCartMutation<T>(
  forAccount: (input: T) => Promise<unknown>,
  forGuest: (input: T) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: T) => {
      if (await ensureSession(queryClient)) {
        await forAccount(input);
        return 'account';
      }
      forGuest(input);
      return 'guest';
    },
    onSuccess: (owner) => {
      if (owner === 'account') return queryClient.invalidateQueries({ queryKey: cartKey });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useAddToCart() {
  return useCartMutation<GuestCartItem>(
    (item) => request('/api/cart/items', { method: 'POST', body: item }),
    (item) => guestCart.add(item.variantId, item.quantity),
  );
}

export function useSetQuantity() {
  return useCartMutation<GuestCartItem>(
    ({ variantId, quantity }) =>
      request(`/api/cart/items/${variantId}`, { method: 'PATCH', body: { quantity } }),
    ({ variantId, quantity }) => guestCart.setQuantity(variantId, quantity),
  );
}

export function useRemoveFromCart() {
  return useCartMutation<string>(
    (variantId) => request(`/api/cart/items/${variantId}`, { method: 'DELETE' }),
    (variantId) => guestCart.remove([variantId]),
  );
}

/** Explains what the merge changed, naming the items still in the cart. */
export function describeAdjustments({ adjustments, items }: MergedCart) {
  return adjustments.map(({ variantId, requestedQuantity, addedQuantity }) => {
    const name = items.find((item) => item.variantId === variantId)?.productName;

    if (addedQuantity === 0) return `${name ?? 'An item'} is no longer available.`;
    return `${name ?? 'An item'}: ${addedQuantity} of ${requestedQuantity} added, as stock is limited.`;
  });
}

/**
 * Moves a guest cart into the account after logging in, then clears it. If that fails, the guest
 * cart is kept, so nothing is lost.
 */
export async function mergeGuestCart(queryClient: QueryClient) {
  const items = guestCart.read();
  if (items.length === 0) return;

  try {
    const { data } = await request<{ data: MergedCart }>('/api/cart/merge', {
      method: 'POST',
      body: { items },
    });
    guestCart.clear();
    await queryClient.invalidateQueries({ queryKey: cartKey });

    const changes = describeAdjustments(data);
    if (changes.length > 0) {
      toast.warning('Some items in your cart changed', { description: changes.join(' ') });
    }
  } catch (error) {
    toast.error(`Your cart could not be moved to your account. ${errorMessage(error)}`);
  }
}
