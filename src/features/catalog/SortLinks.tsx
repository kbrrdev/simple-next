import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProductSort } from './params';

const sorts: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
];

interface SortLinksProps {
  current: ProductSort;
  /** The link to the first page in a sort order, keeping the list's other filters. */
  href: (sort: ProductSort) => string;
}

/** The sort order as a pill of two choices. */
export function SortLinks({ current, href }: SortLinksProps) {
  return (
    <nav
      aria-label="Sort products"
      className="inline-flex items-center rounded-full border border-border p-1 text-sm"
    >
      {sorts.map(({ value, label }) => (
        <Link
          key={value}
          href={href(value)}
          scroll={false}
          aria-current={value === current ? 'true' : undefined}
          className={cn(
            'rounded-full px-4 py-1.5 transition-colors',
            value === current ? 'bg-foreground font-semibold text-background' : 'hover:bg-muted',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
