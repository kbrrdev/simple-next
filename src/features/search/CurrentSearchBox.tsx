'use client';

import { useSearchParams } from 'next/navigation';
import { SearchBox } from './SearchBox';
import type { SearchCategory } from './suggestions';

/** The search box, filled in with the current search on the search page. */
export function CurrentSearchBox({ categories }: { categories: SearchCategory[] }) {
  const query = useSearchParams().get('q') ?? '';

  // Keyed by the search, so the field shows the new search after each navigation.
  return <SearchBox key={query} categories={categories} initialQuery={query} />;
}
