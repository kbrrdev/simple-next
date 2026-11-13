import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { productGridClass, productImageClass, productRowClass } from '@/features/catalog/grid';
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

function ProductCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className={productImageClass} />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

/** The same grid as ProductGrid. */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Loading label="Loading products" className={productGridClass}>
      {repeat(count).map((index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </Loading>
  );
}

/** The same row as ProductRow, with its title. */
export function ProductRowSkeleton() {
  return (
    <Loading label="Loading products" className="space-y-4 overflow-hidden">
      <Skeleton className="h-7 w-48" />
      <div className={productRowClass}>
        {repeat(4).map((index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Loading>
  );
}

/** The home page's Shop by category row. */
export function ShopByCategorySkeleton() {
  return (
    <Loading label="Loading categories" className="space-y-4 overflow-hidden">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 md:gap-8">
        {repeat(8).map((index) => (
          <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2 md:w-24">
            <Skeleton className="size-16 rounded-full md:size-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** The banner carousel on the home page. */
export function BannerSkeleton() {
  return (
    <Loading label="Loading banners">
      <Skeleton className="-mx-6 aspect-2/1 rounded-none md:mx-0 md:aspect-3/1 md:rounded-xl" />
    </Loading>
  );
}

/** The category tabs under the header. */
export function CategoryTabsSkeleton() {
  return (
    <div aria-hidden className="flex gap-8 overflow-hidden pt-4 pb-3">
      {repeat(8).map((index) => (
        <div key={index} className="flex shrink-0 flex-col items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

/** A product list page: tabs, heading, count, and the grid. */
export function ProductListPageSkeleton() {
  return (
    <>
      <CategoryTabsSkeleton />
      <div aria-hidden className="space-y-2 pt-8 pb-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-24" />
      </div>
      <ProductGridSkeleton />
    </>
  );
}

/** The product page: the large photo and thumbnails beside the purchase panel. */
export function ProductPageSkeleton() {
  return (
    <Loading
      label="Loading product"
      className="-mt-6 grid gap-x-12 md:mt-0 md:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-x-16"
    >
      <div className="space-y-3">
        <Skeleton className="-mx-6 aspect-square rounded-none md:mx-0 md:rounded-xl" />
        <div className="hidden grid-cols-5 gap-3 md:grid">
          {repeat(5).map((index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-6 pt-6 md:pt-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <Skeleton className="h-8 w-28" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            {repeat(3).map((index) => (
              <Skeleton key={index} className="h-9 w-14 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-12 md:block" />
      </div>
    </Loading>
  );
}
export function BlogListSkeleton() {
  return (
    <Loading label="Loading posts" className="space-y-8">
      <Skeleton className="h-9 w-24" />
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {repeat(6).map((index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[3/2] rounded-xl" />
            <Skeleton className="h-5 w-4/5" />
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
    <Loading label="Loading post" className="mx-auto max-w-3xl space-y-8">
      <Skeleton className="h-4 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="aspect-video rounded-xl" />
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
    <div className="flex gap-4 py-6 md:gap-6">
      <Skeleton className={cn('shrink-0 rounded-xl', thumbnail)} />
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
    <Loading
      label="Loading your cart"
      className="grid gap-10 md:grid-cols-[1fr_minmax(20rem,24rem)] md:gap-16 lg:gap-24"
    >
      <div className="divide-y divide-hairline border-t border-hairline">
        {repeat(3).map((index) => (
          <LineSkeleton key={index} thumbnail="size-24 md:size-28" />
        ))}
      </div>
      <div className="h-fit space-y-5 rounded-xl border border-border p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-12" />
      </div>
    </Loading>
  );
}

/** The order list's rows. */
export function OrderListSkeleton() {
  return (
    <Loading
      label="Loading your orders"
      className="divide-y divide-hairline overflow-hidden rounded-xl border border-border"
    >
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
      <div className="space-y-3 rounded-xl border border-border p-5">
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
        <div key={index} className="space-y-2 rounded-xl border border-border p-5">
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
      <div className="h-fit space-y-4 rounded-xl border border-border p-5">
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
