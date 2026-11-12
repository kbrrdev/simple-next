/**
 * Where to go after logging in. Only paths on this site are allowed, so that a crafted link
 * cannot send the shopper to another site. Browsers read `/\` like `//`, as another site.
 */
export function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}

export function loginHref(next: string) {
  return next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;
}
