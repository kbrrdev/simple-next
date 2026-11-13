import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ScrollRow } from '@/components/ScrollRow';
import type { Product } from './api';
import { productRowClass } from './grid';
import { ProductCard } from './ProductCard';

/** A titled row of products that scrolls sideways, with a link to the full list. */
export function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline"
        >
          Show all
          <span className="sr-only"> {title}</span>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
      <ScrollRow label={title}>
        <ul className={productRowClass}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </ScrollRow>
    </section>
  );
}
