import Image from 'next/image';
import Link from 'next/link';
import { formatCents } from '@/lib/money';
import type { Product } from './api';
import { isInStock, priceRange, sortedImages } from './product';

export function ProductCard({ product }: { product: Product }) {
  const [image] = sortedImages(product);
  const { min, max } = priceRange(product.variants);

  return (
    <Link href={`/products/${product.id}`} className="group block space-y-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {image && (
          <Image
            src={image.url}
            alt={image.altText}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <div className="text-sm">
        <h3 className="font-medium group-hover:underline">{product.name}</h3>
        <p>{min === max ? formatCents(min) : `From ${formatCents(min)}`}</p>
        {!isInStock(product.variants) && <p className="text-destructive">Out of stock</p>}
      </div>
    </Link>
  );
}
