'use client';

import { Search } from 'lucide-react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';

export interface CategoryOption {
  id: string;
  name: string;
}

/**
 * The header's search. On wide screens it is a pill with two parts, what to look for and where,
 * and a round search button. On phones it is one field.
 */
export function SearchPill({
  categories,
  query = '',
  categoryId = '',
}: {
  categories: CategoryOption[];
  query?: string;
  categoryId?: string;
}) {
  return (
    <Form
      action="/search"
      role="search"
      className="flex h-12 w-full max-w-2xl items-center rounded-full border border-border bg-background shadow-raise transition-shadow focus-within:shadow-float hover:shadow-float md:h-16"
    >
      <label className="flex min-w-0 flex-1 cursor-text flex-col justify-center rounded-full px-5 md:px-8 md:hover:bg-muted md:focus-within:bg-muted">
        <span className="hidden text-xs font-semibold md:block">What</span>
        <span className="flex items-center gap-2">
          <Search aria-hidden className="size-4 shrink-0 md:hidden" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search products"
            aria-label="Search products"
            maxLength={255}
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </span>
      </label>
      {categories.length > 0 && (
        <>
          <span aria-hidden className="hidden h-8 w-px bg-border md:block" />
          <label className="hidden min-w-0 flex-col justify-center rounded-full px-6 md:flex md:w-56 md:hover:bg-muted md:focus-within:bg-muted">
            <span className="text-xs font-semibold">Category</span>
            <select
              name="categoryId"
              defaultValue={categoryId}
              className="w-full min-w-0 cursor-pointer bg-transparent text-sm text-muted-foreground outline-none focus-visible:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="mr-2 hidden size-12 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:bg-brand-hover md:flex"
      >
        <Search aria-hidden className="size-4" strokeWidth={3} />
      </button>
    </Form>
  );
}

/** The search pill, filled in from the current URL. */
export function CurrentSearchPill({ categories }: { categories: CategoryOption[] }) {
  const params = useSearchParams();

  return (
    <SearchPill
      // Keyed by the URL, so the fields show the current search after each navigation.
      key={params.toString()}
      categories={categories}
      query={params.get('q') ?? ''}
      categoryId={params.get('categoryId') ?? ''}
    />
  );
}
