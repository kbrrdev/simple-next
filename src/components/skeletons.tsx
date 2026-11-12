import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Announces what is loading to screen readers, while its placeholder blocks show the shape of
 * the content to come. Each skeleton below matches the layout it stands in for, so that nothing
 * moves when the content arrives.
 */
function Loading({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function repeat(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

/** The same grid as ProductGrid. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Loading
      label="Loading products"
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
    >
      {repeat(count).map((index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </Loading>
  );
}

/** The same grid as CategoryList, under its heading. */
export function CategoryListSkeleton() {
  return (
    <Loading label="Loading categories" className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {repeat(4).map((index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** A product list page: heading, sort links, and the grid. */
export function ProductListPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-5 w-40" />
      <ProductGridSkeleton />
    </div>
  );
}

/** The same two columns as the product page. */
export function ProductPageSkeleton() {
  return (
    <Loading label="Loading product" className="grid gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            {repeat(3).map((index) => (
              <Skeleton key={index} className="h-9 w-12" />
            ))}
          </div>
        </div>
        <Skeleton className="h-9 w-full sm:w-36" />
        <div className="space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </Loading>
  );
}

export function BlogListSkeleton() {
  return (
    <Loading label="Loading posts" className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="divide-y">
        {repeat(4).map((index) => (
          <div key={index} className="space-y-2 py-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function ArticleSkeleton() {
  return (
    <Loading label="Loading post" className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="aspect-video" />
      <div className="space-y-3">
        {repeat(5).map((index) => (
          <Skeleton key={index} className={cn('h-4', index === 4 && 'w-2/3')} />
        ))}
      </div>
    </Loading>
  );
}

function LineSkeleton({ thumbnail }: { thumbnail: string }) {
  return (
    <div className="flex gap-4 py-4">
      <Skeleton className={cn('shrink-0', thumbnail)} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** The cart page: its lines and the summary box. */
export function CartSkeleton() {
  return (
    <Loading label="Loading your cart" className="grid gap-8 md:grid-cols-[1fr_18rem]">
      <div className="divide-y">
        {repeat(3).map((index) => (
          <LineSkeleton key={index} thumbnail="size-20" />
        ))}
      </div>
      <div className="h-fit space-y-4 rounded-md border p-4">
        <Skeleton className="h-5" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8" />
      </div>
    </Loading>
  );
}

/** The order list's rows. */
export function OrderListSkeleton() {
  return (
    <Loading label="Loading your orders" className="divide-y rounded-md border">
      {repeat(4).map((index) => (
        <div key={index} className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </Loading>
  );
}

/** The same sections as OrderDetails. */
export function OrderSkeleton() {
  return (
    <Loading label="Loading your order" className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-6 w-44" />
      </div>
      <div className="space-y-3 rounded-md border p-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <div className="divide-y">
          {repeat(2).map((index) => (
            <LineSkeleton key={index} thumbnail="size-16" />
          ))}
        </div>
        <div className="space-y-2">
          {repeat(3).map((index) => (
            <Skeleton key={index} className="h-4" />
          ))}
          <Skeleton className="h-6" />
        </div>
      </div>
    </Loading>
  );
}

/** Bordered cards, such as saved addresses. */
export function CardListSkeleton({ label, count = 2 }: { label: string; count?: number }) {
  return (
    <Loading label={label} className="space-y-3">
      {repeat(count).map((index) => (
        <div key={index} className="space-y-2 rounded-md border p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </Loading>
  );
}

/** The checkout's form sections and the order summary box. */
export function CheckoutSkeleton() {
  return (
    <Loading label="Loading checkout" className="grid gap-10 md:grid-cols-[1fr_20rem]">
      <div className="space-y-10">
        {repeat(3).map((section) => (
          <div key={section} className="space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        ))}
      </div>
      <div className="h-fit space-y-4 rounded-md border p-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-6" />
        <Skeleton className="h-10" />
      </div>
    </Loading>
  );
}

/** A page's content area, while the session loads. */
export function PageSkeleton() {
  return (
    <Loading label="Loading" className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-32" />
    </Loading>
  );
}
