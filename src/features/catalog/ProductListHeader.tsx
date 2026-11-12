import type { ReactNode } from 'react';

/** A product list's title and count, with its controls on the right. */
export function ProductListHeader({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-8 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-balance md:text-[1.75rem]">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {total === 1 ? '1 product' : `${total.toLocaleString('en-PH')} products`}
        </p>
      </div>
      {children}
    </div>
  );
}
