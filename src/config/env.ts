// Read one by one, as Next.js only builds `process.env.NEXT_PUBLIC_*` into the bundle when
// the name is written out in full.
function readUrl(name: string, value: string | undefined, required: true): string;
function readUrl(name: string, value: string | undefined, required: false): string | undefined;
function readUrl(name: string, value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error(`${name} is not set. Copy .env.example to .env.`);
    return undefined;
  }
  if (!URL.canParse(value)) throw new Error(`${name} is not a valid URL: ${value}`);

  return value.replace(/\/+$/, '');
}

/** Public settings, built into the browser bundle. */
export const env = {
  apiUrl: readUrl('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL, true),
  siteUrl: readUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL, true),
  imageUrl: readUrl('NEXT_PUBLIC_IMAGE_URL', process.env.NEXT_PUBLIC_IMAGE_URL, false),
  storeName: process.env.NEXT_PUBLIC_STORE_NAME?.trim() || 'Store',
};
