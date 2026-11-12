const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export function formatCents(cents: number) {
  return peso.format(cents / 100);
}
