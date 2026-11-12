// Stores are in the Philippines, so dates show Manila time wherever the server runs.
const longDate = new Intl.DateTimeFormat('en-PH', { dateStyle: 'long', timeZone: 'Asia/Manila' });

export function formatDate(iso: string) {
  return longDate.format(new Date(iso));
}
