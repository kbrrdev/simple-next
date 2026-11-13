import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { request, type Schemas } from '@/lib/api';

type Product = Schemas['Product'];

export interface SearchCategory {
  id: string;
  /** The name with its parents, such as "Men › Shoes". */
  label: string;
  imageUrl: string | null;
  topLevel: boolean;
}

/** Suggestions start from this many characters, as one letter matches nearly everything. */
export const minQueryLength = 2;
const debounceMs = 250;
const productLimit = 5;

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value]);

  return debounced;
}

/** Products whose names match, fetched after the shopper pauses typing. */
export function useProductSuggestions(query: string) {
  const term = useDebounced(query.trim());
  const enabled = term.length >= minQueryLength;

  const result = useQuery({
    queryKey: ['search', 'suggestions', term],
    queryFn: async () => {
      const { data } = await request<{ data: Product[] }>('/api/products', {
        query: { search: term, limit: productLimit },
      });
      return data;
    },
    enabled,
    staleTime: 60_000,
  });

  return { term, enabled, ...result };
}

/** Categories whose names contain the query, closest matches first. */
export function matchCategories(categories: SearchCategory[], query: string, limit = 3) {
  const term = query.trim().toLowerCase();
  if (term.length < minQueryLength) return [];

  return categories
    .filter((category) => category.label.toLowerCase().includes(term))
    .sort(
      (a, b) =>
        Number(!a.label.toLowerCase().startsWith(term)) -
          Number(!b.label.toLowerCase().startsWith(term)) || a.label.length - b.label.length,
    )
    .slice(0, limit);
}

/** Splits text around each case-insensitive match of the query, to bold the matches. */
export function splitMatches(text: string, query: string) {
  const term = query.trim();
  if (!term) return [{ text, match: false }];

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text
    .split(new RegExp(`(${escaped})`, 'i'))
    .filter(Boolean)
    .map((part) => ({ text: part, match: part.toLowerCase() === term.toLowerCase() }));
}
