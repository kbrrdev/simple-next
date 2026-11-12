import type { Product } from './api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, empty }: { products: Product[]; empty: string }) {
  if (products.length === 0) return <p className="text-muted-foreground">{empty}</p>;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
