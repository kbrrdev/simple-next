/** One checkout attempt: what the shopper is ordering, and the key that places it once. */
export interface Attempt {
  signature: string;
  idempotencyKey: string;
}

/**
 * Reuses the key when the same order is retried, so that a slow network never places it twice.
 * Changing anything about the order is a new attempt, with a new key.
 */
export function nextAttempt(
  previous: Attempt | null,
  signature: string,
  newKey: () => string,
): Attempt {
  return previous?.signature === signature ? previous : { signature, idempotencyKey: newKey() };
}
