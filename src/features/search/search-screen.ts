import { useSyncExternalStore } from 'react';

/**
 * Whether the phone's full-screen search is open. The tab bar opens and closes it, and the screen
 * itself closes it, so both read this one value.
 */
let open = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (open === value) return;
  open = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const searchScreen = {
  open: () => set(true),
  close: () => set(false),
  toggle: () => set(!open),
};

export function useSearchScreenOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
