import { SearchX } from 'lucide-react';
import type { Product } from './api';
import { productGridClass } from './grid';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, empty }: { products: Product[]; empty: string }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <SearchX aria-hidden className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-lg font-semibold">{empty}</p>
      </div>
    );
  }

  return (
    <ul className={productGridClass}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
