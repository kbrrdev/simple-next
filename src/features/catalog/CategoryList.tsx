import Image from 'next/image';
import Link from 'next/link';
import type { CategoryNode } from './api';

export function CategoryList({ categories }: { categories: CategoryNode[] }) {
  if (categories.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <li key={category.id}>
          <Link href={`/categories/${category.id}`} className="group block space-y-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <span className="font-medium group-hover:underline">{category.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
