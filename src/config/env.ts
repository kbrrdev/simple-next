// Read one by one, as Next.js only builds `process.env.NEXT_PUBLIC_*` into the bundle when
// the name is written out in full.
function readApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (!value) throw new Error('NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.');
  if (!URL.canParse(value)) throw new Error(`NEXT_PUBLIC_API_URL is not a valid URL: ${value}`);

  return value.replace(/\/+$/, '');
}

/** Public settings, built into the browser bundle. */
export const env = {
  apiUrl: readApiUrl(),
  storeName: process.env.NEXT_PUBLIC_STORE_NAME?.trim() || 'Store',
};
