import { useSyncExternalStore } from 'react';
import { isId } from '@/lib/search-params';

/** A guest's cart line. Prices and names are never stored, as the API prices the cart. */
export interface GuestCartItem {
  variantId: string;
  quantity: number;
}

// The API's limits for one line, and for the lines in one request.
export const maxItemQuantity = 99;
const maxLines = 100;

const storageKey = 'cart';
const empty: GuestCartItem[] = [];
const listeners = new Set<() => void>();

let snapshot: { raw: string | null; items: GuestCartItem[] } = { raw: null, items: empty };

/** Reads stored lines, dropping anything malformed, as the data could have been edited. */
export function parseGuestCart(raw: string | null): GuestCartItem[] {
  let value: unknown;
  try {
    value = raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];

  const items = new Map<string, number>();
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue;

    const { variantId, quantity } = entry as Record<string, unknown>;
    if (typeof variantId !== 'string' || !isId(variantId)) continue;
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue;

    items.set(variantId, Math.min((items.get(variantId) ?? 0) + quantity, maxItemQuantity));
  }

  return [...items].slice(0, maxLines).map(([variantId, quantity]) => ({ variantId, quantity }));
}

function readRaw() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    // Storage can be blocked, such as in some private windows. The cart is then empty.
    return null;
  }
}

/** The stored lines. The same array is returned until they change, as React requires. */
function read() {
  const raw = readRaw();
  if (raw !== snapshot.raw) snapshot = { raw, items: parseGuestCart(raw) };

  return snapshot.items;
}

function write(items: GuestCartItem[]) {
  try {
    if (items.length === 0) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Without storage, the cart cannot be kept. Nothing else can be done.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  // Other tabs change the cart through the storage event.
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) listener();
  };

  listeners.add(listener);
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export const guestCart = {
  read,

  add(variantId: string, quantity: number) {
    const items = read();
    const existing = items.find((item) => item.variantId === variantId);

    write(
      existing
        ? items.map((item) =>
            item === existing
              ? { variantId, quantity: Math.min(item.quantity + quantity, maxItemQuantity) }
              : item,
          )
        : [...items, { variantId, quantity: Math.min(quantity, maxItemQuantity) }].slice(
            0,
            maxLines,
          ),
    );
  },

  setQuantity(variantId: string, quantity: number) {
    write(
      read().map((item) =>
        item.variantId === variantId
          ? { variantId, quantity: Math.min(Math.max(quantity, 1), maxItemQuantity) }
          : item,
      ),
    );
  },

  remove(variantIds: string[]) {
    write(read().filter((item) => !variantIds.includes(item.variantId)));
  },

  clear() {
    write([]);
  },
};

/** The guest cart's lines. It is empty when rendering on the server. */
export function useGuestCart() {
  return useSyncExternalStore(subscribe, read, () => empty);
}
