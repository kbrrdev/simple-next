/**
 * The Content Security Policy and other security headers for every page.
 *
 * `script-src` allows inline scripts, as Next.js needs them. A nonce would make every page render
 * per request, and lose the cached public pages. React escapes API data and the app never inserts
 * HTML, which keeps the risk low.
 */
export function securityHeaders({
  apiUrl,
  imageUrl,
  development,
}: {
  apiUrl: string;
  imageUrl?: string;
  /** The development server evaluates code and reloads over a WebSocket. */
  development: boolean;
}) {
  const api = new URL(apiUrl).origin;
  const images = imageUrl ? new URL(imageUrl).origin : null;

  const policy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : [])],
    // Next.js and next/image set inline styles.
    'style-src': ["'self'", "'unsafe-inline'"],
    // Photos load through Next.js's image optimizer on 'self', or straight from the API or S3.
    'img-src': ["'self'", 'data:', 'blob:', api, ...(images ? [images] : [])],
    'font-src': ["'self'"],
    'connect-src': ["'self'", api, ...(development ? ['ws:'] : [])],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  const csp = Object.entries(policy)
    .map(([directive, sources]) => `${directive} ${[...new Set(sources)].join(' ')}`)
    .join('; ');

  return [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ];
}
